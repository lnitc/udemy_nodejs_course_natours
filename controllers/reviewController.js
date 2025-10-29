const mongoose = require('mongoose');
const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

function getAllReviews(req, res, next) {
  catchAsync(async () => {
    let filter = {};
    if (req.params.id) filter = { tour: req.params.id };

    const reviews = await Review.find(filter);

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
    if (!req.body.tour) req.body.tour = req.params.id;

    const tour = await Tour.findById(req.body.tour);
    if (!tour) return next(new AppError('No tour found with that ID', 404));

    if (!req.body.user) req.body.user = req.user.id;

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
