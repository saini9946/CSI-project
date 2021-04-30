const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../Models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
//const { STATUS_CODES } = require('http');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //Remove the password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email } = await req.body;
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  this.verifyTokenExpire = Date.now() + 10 * 60 * 1000;
  console.log(`verification token ${verifyToken} sent to ${email}!`);
});
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Check if email and password are submitted by the client
  if (!email || !password) {
    return next(
      new AppError('Please provide your email and your password', 400)
    );
  }
  //Check if user exists and the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401));
  }
  //Return a web token to the client
  createSendToken(user, 200, res);
});
//Logging out
//CHECKING IF THE USER IS LOGGED IN OR NOT

exports.protect = catchAsync(async (req, res, next) => {
  //getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not loggen in.Please login to access this', 401)
    );
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exits
  const currentUSer = await User.findById(decoded.id);
  if (!currentUSer) {
    return next(new AppError('This user no longer exists!'));
  }

  //check if user changed password after the token was issued
  if (currentUSer.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User changed the password recently!.Please login again to continue',
        401
      )
    );
  }
  res.locals.user = currentUSer;
  req.user = currentUSer;
  next();
});

//Only for rendered pages and there will be no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //check if user still exits
      const currentUSer = await User.findById(decoded.id);
      if (!currentUSer) {
        return next();
      }

      //check if user changed password after the token was issued
      if (currentUSer.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUSer;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Invalid email address', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to th user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and password confirm to: ${resetURL}.\n 
  If you didn't forget your password,Please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    // eslint-disable-next-line no-console
    console.log(err);
    return next(
      new AppError('There was an error sending the email!Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Find the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  //if the token has not expired and there is user,then set the new password
  if (!user) {
    return next(
      new AppError('The token is invalid or has already expired!!', 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //Log in the user and send JWT
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    http: true
  });
  res.status(200).json({ status: 'success' });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //If so,update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //log user in,send jwt
  createSendToken(user, 200, res);
});
