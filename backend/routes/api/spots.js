const express = require('express');
const { Spot, SpotImage, Review, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// middleware for Spot creation & update
const validateSpot = [
  check('address').exists({ checkFalsy: true }).withMessage('Address is required.'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required.'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required.'),
  check('country').exists({ checkFalsy: true }).withMessage('Country is required.'),
  check('lat')
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90.'),
  check('lng')
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180.'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be at most 50 characters.'),
  check('description').exists({ checkFalsy: true }).withMessage('Description is required.'),
  check('price').exists({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price must be a valid number.'),
  handleValidationErrors,
];

// Validation for creating a review
const validateReview = [
  check('review').exists({ checkFalsy: true }).withMessage('Review text is required.'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5.'),
  handleValidationErrors,
];

// Create a review for a spot
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    const existingReview = await Review.findOne({ where: { spotId, userId } });

    if (existingReview) {
      return res.status(403).json({ message: 'You have already reviewed this spot.' });
    }

    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    return res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ error: 'An error occurred while creating the review.' });
  }
});

module.exports = router;
