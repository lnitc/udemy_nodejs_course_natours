const mongoose = require('mongoose');
const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

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

function setTourUserIds(req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}

function createReview(req, res, next) {
  factory.createOne(Review)(req, res, next);
}

function updateReview(req, res, next) {
  factory.updateOne(Review)(req, res, next);
}

function deleteReview(req, res, next) {
  factory.deleteOne(Review)(req, res, next);
}

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
};
