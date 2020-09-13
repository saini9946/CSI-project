const Event = require('../Models/eventModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const events = await Event.find();
  res.status(200).render('overview', {
    title: 'Upcoming events',
    events
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});

exports.getSignupForm = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Register your account'
  });
});

exports.aboutUsForm = catchAsync(async (req, res) => {
  res.status(200).render('aboutus', {
    title: 'About CSI'
  });
});

exports.creditsForm = catchAsync(async (req, res) => {
  res.status(200).render('credits', {
    title: 'credits'
  });
});

exports.csistaffForm = catchAsync(async (req, res) => {
  res.status(200).render('csistaff', {
    title: 'csistaff'
  });
});

exports.MIForm = catchAsync(async (req, res) => {
  res.status(200).render('MI', {
    title: 'MI'
  }); 
});

exports.motivationForm = catchAsync(async (req, res) => {
  res.status(200).render('motivation', {
    title: 'motivation'
  }); 
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: 'My account'
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'My account',
    user: updatedUser
  });
});

exports.manageEvents = catchAsync(async (req, res,next) => {
  const events = await Event.find();
  res.status(200).render('manage-events', {
    title: 'Manage-events',
    events
  });
});

exports.manageUser = catchAsync(async (req, res) => {
  res.status(200).render('manage-user', {
    title: 'Manage-user'
  });
});

exports.howToJoin = catchAsync(async (req, res) => {
  res.status(200).render('how-to-join', {
    title: 'How TO JOIN'
  });
});