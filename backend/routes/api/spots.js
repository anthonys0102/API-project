const express = require('express');
const { Spot, SpotImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validation middleware for Spot creation
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

// Get all spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
          attributes: ['stars'],
        },
        {
          model: SpotImage,
          attributes: ['url', 'preview'],
        },
      ],
    });

    const formattedSpots = spots.map((spot) => {
      const reviews = spot.Reviews || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
          : null;

      const previewImage = spot.SpotImages?.find((image) => image.preview)?.url || null;

      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating,
        previewImage,
      };
    });

    return res.json({ spots: formattedSpots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});

// Create a new spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;

  try {
    const newSpot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    return res.status(201).json(newSpot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the spot.' });
  }
});

// Add an Image to a Spot by ID
router.post('/:spotId/images', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to add an image to this spot' });
    }

    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding the image.' });
  }
});

module.exports = router;
