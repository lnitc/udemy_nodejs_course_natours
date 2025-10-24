const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

function getAllUsers(req, res, next) {
  catchAsync(async () => {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  })(req, res, next);
}

function getUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function updateUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function deleteUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
};
