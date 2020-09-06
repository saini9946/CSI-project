const express = require('express');
const authController = require('../Controllers/authController');

const Router = express.Router();

const eventController = require('../Controllers/eventControllers');
// eslint-disable-next-line no-unused-vars
const { router } = require('../app');

//.route('/weekly-events/:year').get(eventController.getWeeklyEvents);

Router.route('/')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createEvent
  );

Router.route('/:id')
  .get(eventController.getEvent)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.deleteEvent
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.updateEvent
  );

module.exports = Router;
