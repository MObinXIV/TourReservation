const express = require('express');
const tourController = require('../controllers/tourController');

const router= express.Router();


router.route('/').post(tourController.createTour).get(tourController.getAllTours);
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = router;