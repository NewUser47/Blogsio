const mongoose = require('mongoose');
// const validator = require('validator');
const slugify = require('slugify');
const User = require('./userModel');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A blog must have a title'],
      maxlength: [120, `Title must be shorter than 120 characters`],
      minlength: [6, `Title must be longer than 6 characters`],
    },
    domain: {
      type: String,
      required: [true, `Please mention the blog's domain.`],
      maxlength: [60, `Domain name must be shorter than 60 characters`],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [120, `Summary must be shorter than 120 characters`],
      required: [true, 'A blog must have a summary!'],
    },
    content: {
      type: String,
      trim: true, //this will delete extra whitespaces from beginning and end
      required: [true, 'A blog must have content'],
    },
    imageCover: {
      type: String,
      required: [true, 'A blog must have a cover image!'],
    },
    image1: {
      type: String,
      required: [true, 'A Blog must have exactly 3 display images!'],
    },
    image2: {
      type: String,
      required: [true, 'A Blog must have exactly 3 display images!'],
    },
    image3: {
      type: String,
      required: [true, 'A Blog must have exactly 3 display images!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    reviewAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Review must be atleast 1.0'],
      max: [5.0, 'Review must be atmost 5.0'],
      set: (val) => Math.round(val * 10) / 10, //as rounds to integer so we multiply by 10, round it and then divide
    },
    reviewQuantity: { type: Number, default: 0 },

    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A blog must have an author'],
    },
    slug: String,
  },
  //to be able to add reviews virtually
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  // this.author = req.user;
  next();
});

blogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    ref: 'User',
    select: 'name email photo',
  });
  next();
});

blogSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'blog',
  localField: '_id',
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
