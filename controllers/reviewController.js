const mongoose = require('mongoose');
const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

function getAllReviews(req, res, next) {
  catchAsync(async () => {
    const reviews = await Review.find();
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  })(req, res, next);
}

function createReview(req, res, next) {
  catchAsync(async () => {
    if (!mongoose.Types.ObjectId.isValid(req.body.tour))
      return next(new AppError('Invalid ID', 400));

    const tour = await Tour.findById(req.body.tour);
    if (!tour) return next(new AppError('No tour found with that ID', 404));

    req.body.user = req.user.id;

    const review = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  })(req, res, next);
}

module.exports = {
  getAllReviews,
  createReview,
};
