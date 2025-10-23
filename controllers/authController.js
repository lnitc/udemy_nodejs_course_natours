const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
function signup(req, res, next) {
  catchAsync(async () => {
    const user = await User.create(req.body);
    res.status(201).json({ status: 'success', data: { user } });
  })(req, res, next);
}

module.exports = {
  signup,
};
