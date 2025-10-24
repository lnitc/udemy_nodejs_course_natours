const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function signup(req, res, next) {
  catchAsync(async () => {
    //const user = await User.create(req.body); //this is a security breach because anyone can assign themselves an admin role
    //we need to retrieve only the necessary fields from the body
    const { name, email, password, passwordConfirm } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      passwordConfirm,
    });

    const token = signToken(user._id);
    res.status(201).json({ status: 'success', token, data: { user } });
  })(req, res, next);
}

function login(req, res, next) {
  catchAsync(async () => {
    const { email, password } = req.body;

    //check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    //check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password'); //+ needed to select deselected fields

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401)); //intentionally make the error msg vague
    }

    //create and send token
    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token });
  })(req, res, next);
}

function protect(req, res, next) {
  catchAsync(async () => {
    //check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in', 401));
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decoded)

    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401),
      );
    }

    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password. Please log in again!',
          401,
        ),
      );
    }

    //grant access to protected route
    req.user = currentUser;
    next();
  })(req, res, next);
}

module.exports = {
  signup,
  login,
  protect,
};
