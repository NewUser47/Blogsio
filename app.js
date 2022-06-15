const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const blogRouter = require('./routes/blogRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.use(cookieParser());

app.use(fileUpload({ useTempFiles: true }));

//set secure http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); //logs requests nicely

//To limit number of requests from same ip address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Try again in an hour',
});
app.use('/api', limiter);

//body parser - reading data from body to req.body
app.use(express.json({ limit: '10mb' }));

//Data sanitization against NOSql query injection
app.use(mongoSanitize());

//Data sanitization againt XSS
app.use(xss());

//http parameter pollution - removes same filters - for eg - sort by price and duration both in 1 request
//pass in parameters where duplicates allowed as array
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsAverage',
//       'ratingsQuantity',
//       'difficulty',
//       'price',
//       'maxGroupSize',
//     ],
//   })
// );

//serving static files
app.use(express.static(`${__dirname}/public`));

//Mounting router to routes
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//if a request reaches here, it must mean that is has not been handled by any routers - so, we can write a middlware handling that
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
