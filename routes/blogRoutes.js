const express = require('express');
const blogController = require('../controllers/blogController');
// const reviewRouter = require('./reviewRoutes');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/', authController.isLoggedIn);

router.use('/:blogId/reviews', reviewRouter);

router.get('/:slug', blogController.getSlugBlog);

router
  .route('/')
  .get(blogController.getAllBlogs)
  .post(authController.protect, blogController.createNewBlog);

router.use(authController.protect); //, authController.restrictTo('admin'));

router
  .route('/:id')
  .get(blogController.getBlog)
  .delete(blogController.deleteBlog)
  .patch(blogController.updateBlog);

module.exports = router;
