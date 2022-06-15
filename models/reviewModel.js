const mongoose = require('mongoose');
const Blog = require('./blogModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      ref: 'Blog',
      required: [true, 'Review must belong to a blog'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ blog: 1, user: 1 }, { unique: true }); //this will allow only 1 review per user on a tour

reviewSchema.pre(/^find/, function (next) {
  //we dont need to populate reviews with tours
  this.populate({
    path: 'user',
    select: 'name email photo',
  });
  next();
});

//to calculate average ratings and quantity of ratings, we use static methods
reviewSchema.statics.calcAverageRatings = async function (blogId) {
  console.log(blogId);
  const stats = await this.aggregate([
    {
      $match: { blog: blogId }, //only selecting the tour we want to update
    },
    {
      $group: {
        _id: 'blog', //group on the basis of id
        nRating: { $sum: 1 }, //number of ratings = add 1 for each tour
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Blog.findByIdAndUpdate(blogId, {
      reviewAverage: stats[0].avgRating,
      reviewQuantity: stats[0].nRating,
    });
  } else {
    await Blog.findByIdAndUpdate(blogId, {
      reviewAverage: 4.5,
      reviewQuantity: 0,
    });
  }
};

//changing reviewsAvg, n for creating new reviews
reviewSchema.post('save', function () {
  //this points to current review document
  this.constructor.calcAverageRatings(this.blog);
});

//changing reviewsAvg, n for delete/update
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); //making it a property so that it can be passed
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); - doesnt work here - query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.blog);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
