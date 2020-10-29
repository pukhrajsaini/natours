const express = require('express');
const tourRouter = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');




tourRouter.route('/tours-stats')
  .get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);
tourRouter.route('/')
  .get(authController.protected, tourController.getAllTours)
  .post(tourController.createTour);
tourRouter.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protected,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);


module.exports = tourRouter;
