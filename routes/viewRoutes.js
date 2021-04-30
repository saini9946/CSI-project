const express = require('express');
const viewsController = require('../Controllers/viewsController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/about-us', viewsController.aboutUsForm);
router.get('/credits', viewsController.creditsForm);
router.get('/csistaff', viewsController.csistaffForm);
router.get('/MI', viewsController.MIForm);
router.get('/motivation', viewsController.motivationForm);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
router.get('/me', authController.protect, viewsController.getMe);
router.get(
  '/manage-events',
  authController.isLoggedIn,
  viewsController.manageEvents
);
router.get(
  '/manage-user',
  authController.isLoggedIn,
  viewsController.manageUser
);
router.get('/how-to-join', viewsController.howToJoin);
module.exports = router;
