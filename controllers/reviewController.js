const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

function getAllReviews(req, res, next) {
  factory.getAll(Review)(req, res, next);
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

function getReview(req, res, next) {
  factory.getOne(Review)(req, res, next);
}

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
