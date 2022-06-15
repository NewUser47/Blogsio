const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  //we need to send jwt not as json but as http cookie, to prevent from attacks
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions); //httponly is required so that browser can in no way change or alter the cookies. Used to prevent cross site scripting attacks

  user.password = undefined;
  //will not display in return output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); - this is a security flaw as anyone can register themselves for the role of admin by sending data
  //FIX
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //Payload can be the id of each user, Secret String is added in the config.env file (Normally is suppsoed to be 32 chars long)
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     data: newUser,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email, password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) Check if user exists && if pw correct
  const user = await User.findOne({ email: email }).select('+password');
  // console.log(user.role);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3)If everything ok, send token to client

  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'You have been logged out successfully!',
    token: undefined,
  });
});

//Middleware function to check if user is logged in or not
//Tokens are normally sent using headers. Name - Authorization, value - Bearer *Token Number*. This can be accessed using req.headers
exports.protect = catchAsync(async (req, res, next) => {
  //Get Token and see if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Login to get access.', 401)
    );
  }
  //Validate the token/ Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded); //prints an object like { id: '6274034431448e17d4d586f7', iat: 1651770225, exp: 1659546225 } containing the payload (id) and creation time etc
  // console.log(decoded.id);
  //Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  //Check if user changed passwords after JWT was issued
  //fn returns true if user has actually changed passwords
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again!', 401)
    );
  }

  //Grant access to protected route
  req.user = currentUser;

  next();
});

//only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //Get Token and see if its there
  let token;
  // console.log(req.headers.jwt);
  if (req.headers.jwt) {
    token = req.headers.jwt;

    //Verify the token
    const decoded = await promisify(jwt.verify)(
      req.headers.jwt,
      process.env.JWT_SECRET
    );
    // console.log(decoded); //prints an object like { id: '6274034431448e17d4d586f7', iat: 1651770225, exp: 1659546225 } containing the payload (id) and creation time etc

    //Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    //Check if user changed passwords after JWT was issued
    //fn returns true if user has actually changed passwords
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    //There is a logged in user
    // console.log(req.user);
    req.user = currentUser;
    // console.log(req.user);
    res.locals.user = currentUser; //pass in as locals argument to template
    // console.log(currentUser);
  }
  next();
});

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array of all arguments passed to restrictTo
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  const { password } = req.body;
  if (!user) return next(new AppError('There is no user by this email.', 404));

  //2) Generate Random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `<h1>Forgot your password?</h1> Submit a PATCH request with your new password and confirmPassword to: ${resetURL}\nPlease ignore if you remember your password!`;
  const message = `This is an automated email sent to you from Blogsio as you just requested a password reset.\nHere is your new password token: ${resetToken}\n\nEnter this in the token field on the forgot password page you must be on currently.\nThe token expires in 10 minutes, after which you may need to repeat the process! Thank you for being a loyal blogger.\n\nHappy Blogging!\n\n\nTeam Blogsio`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Blogsio - Password Reset Token (valid for only 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Try again later.', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on token
  //encrypt token again to compare
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2 If token has not expired, or there is a user, set the new password.
  if (!user) {
    return next(new AppError('Token is not valid or has expired ', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //validators not turned off as we need to verify pw==cnfpw
  //3 Updated changedPasswordAt property for the user
  //4 Log the user in, send JWT

  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User with this email does not exist', 400));
  }
  //2 Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  //3 If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // user.findByIdAndUpdate() will not work as pw wont be compared, and pre middleware will also not run

  //4 Log user in, send JWT
  createSendToken(user, 200, res);
});
