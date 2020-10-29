const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // secure: true,
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is exist

  if (!email || !password) {
    return next(new AppError('please provide email and password ..', 400));
  }

  // if user exist && password is correct

  const user = await User.findOne({ email }).select('+password');
  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect Email or Password'));
  }

  createSendToken(user, 200, res);
});

exports.protected = catchAsync(async (req, res, next) => {
  // 1) getting token and check it is there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  //check token exist
  if (!token) {
    return next(new AppError('You are not logged in, please logIn to get access', 401));
  }
  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) check user is exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('user belonging this token does not exist', 401));
  }
  // 4) if user changed the password
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('You have Recently changed password, please log in again'));
  }

  // grant excess to protected route
  req.user = currentUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You Do not permission to perform This Action ...', 403))
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //  1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // 2)generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) send it to user's Email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password submit a patch request with your new password and password confirm to ${resetUrl}.  if you didn't forgot your password please Ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password Reset Token valid for 10 min',
      text: message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to Email ...'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There wa an Error sending the Email, please try later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user bsed on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) if token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) upDate ChangePasswordAt property for the user

  // 4) log the user in, send jwt
  createSendToken(user, 201, res);
})

exports.updatePassword = catchAsync(async (req, res, next) => {

  // 1) get the user from collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) check if posted current password is correct
  if (await !user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your Current Password is Wrong', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in, send Jwt
  createSendToken(user, 201, res);
})