const cloudinary = require('cloudinary').v2;
const Blog = require('../models/blogModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('./handlerFactory');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_cloudName,
  api_key: process.env.CLOUDINARY_apiKey,
  api_secret: process.env.CLOUDINARY_apiSecret,
  secure: true,
});

// exports.getAllBlogs = factory.getAll(Blog);
exports.getAllBlogs = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.blogId) filter = { blog: req.params.blogId };

  const features = new APIFeatures(
    Blog.find(filter).select('+createdAt'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const docs = await features.query;
  // const docs = await features.query.explain();
  // console.log(req.user);
  res.status(200).json({
    status: 'success',
    results: docs.length,
    user: req.user,
    data: {
      data: docs,
    },
  });
});

exports.getBlog = factory.getOne(Blog, { path: 'author' });

// exports.createNewBlog = factory.createOne(Blog);
exports.createNewBlog = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // console.log(req.files);

  //CLOUDINARY PART
  /*
  // const imageCover = req.files.coverImage;
  // const disp1 = req.files.displayImage1;
  // const disp2 = req.files.displayImage2;
  // const disp3 = req.files.displayImage3;
  // console.log('HERE', imageCover, disp1, disp2, disp3);
  // let urlImg;
  // let urlDisp1;
  // let urlDisp2;
  // let urlDisp3;
  await cloudinary.uploader.upload(imageCover.tempFilePath, (err, result) => {
    console.log(result);
    urlImg = result.url;
  });
  await cloudinary.uploader.upload(disp1.tempFilePath, (err, result) => {
    console.log(result);
    urlDisp1 = result.url;
  });
  await cloudinary.uploader.upload(disp2.tempFilePath, (err, result) => {
    console.log(result);
    urlDisp2 = result.url;
  });
  await cloudinary.uploader.upload(disp3.tempFilePath, (err, result) => {
    console.log(result);
    urlDisp3 = result.url;
  });
  */
  const doc = await Blog.create({
    title: req.body.title,
    domain: req.body.domain,
    summary: req.body.summary,
    content: req.body.content,
    // imageCover: urlImg,
    // image1: urlDisp1,
    // image2: urlDisp2,
    // image3: urlDisp3,
    author: req.user._id,
  });
  console.log(doc);
  res.status(201).json({ status: 'success', data: { data: doc } });
});

exports.updateBlog = factory.updateOne(Blog);

exports.deleteBlog = factory.deleteOne(Blog);

exports.getSlugBlog = catchAsync(async (req, res, next) => {
  //1 get tour data with review and tour guide
  const blog = await Blog.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).json({
    title: `${blog.title}`,
    blog: blog,
  });
});
