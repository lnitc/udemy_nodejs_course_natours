const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name cannot be emply'],
    trim: true,
    maxlength: [20, 'A user name must have less then or equal 20 characters'],
    minlength: [3, 'A user name must have more or equal then 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'User email cannot be empty'],
    trim: true,
    unique: true,
    index: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty'],
    trim: true,
    maxlentgh: [20, 'A password must have less then or equal 20 characters'],
    minlength: [8, 'A password must have more or equal then 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm cannot be empty'],
    trim: true,
    maxlentgh: [20, 'A password must have less then or equal 20 characters'],
    minlength: [8, 'A password must have more or equal then 8 characters'],
    validate: {
      validator:
        //This only works on CREATE and SAVE
        function (val) {
          return this.password === val;
        },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //use the async version to prevent blocking

  //Delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    ); //divide by 1000 to get seconds from milliseconds
    return JWTTimestamp < changedTimestamp; //true if password was changed after JWT was issued
  }
  //false means password was not changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
