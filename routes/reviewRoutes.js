const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//we need to merge the params of the parent route to get access to them
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
