const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

function getAllUsers(req, res, next) {
  factory.getAll(User)(req, res, next);
}

function getUser(req, res, next) {
  factory.getOne(User)(req, res, next);
}

//NB:Do NOT update password with this logic
function updateUser(req, res, next) {
  factory.updateOne(User)(req, res, next);
}

function deleteUser(req, res, next) {
  factory.deleteOne(User)(req, res, next);
}

function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
}

function getMe(req, res, next) {
  req.params.id = req.user.id;
  next();
}

function updateMe(req, res, next) {
  catchAsync(async () => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400,
        ),
      );
    }

    const filteredBody = filterObj(req.body, 'name', 'email'); //only include allowed fields
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  })(req, res, next);
}

function deleteMe(req, res, next) {
  catchAsync(async () => {
    //in this implementation we do not actually delete the user from the DB,
    //we simply set the active field to false
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  })(req, res, next);
}

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
  getMe,
};
