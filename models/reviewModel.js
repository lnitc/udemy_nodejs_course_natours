const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
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
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
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
  },
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name', //not working, leave as is for now
  // }).populate({
  //   path: 'user',
  //   select: 'name photo -_id',
  // });

  //tour population was turned off in the course to prevent excessive data
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//static method
//"this" keyword points to the current model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, //number of ratings, sum of all ratings
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

//"post" middleware doesn't have access to next()
reviewSchema.post('save', function () {
  //"this" points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//middleware for update and delete(findOneAndUpdate and findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function (r) {
  //r points to current review, "this" to query
  await r.constructor.calcAverageRatings(r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
