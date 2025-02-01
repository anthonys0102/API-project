const express = require('express');
const { Spot, SpotImage, Review, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Middleware for Spot creation & update validation
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

//  Delete an Image for a Spot by ID
router.delete('/spot-images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.id;

  try {
    const image = await SpotImage.findByPk(imageId, {
      include: [{ model: Spot }],
    });

    if (!image) {
      return res.status(404).json({ message: 'Spot image not found' });
    }

    if (image.Spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this image' });
    }

    await image.destroy();

    return res.json({ message: 'Successfully deleted' });
  } catch (err) {
    console.error('Error deleting spot image:', err);
    return res.status(500).json({ error: 'An error occurred while deleting the spot image.' });
  }
});

router.get('/', async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;


  page = parseInt(page) || 1;
  size = parseInt(size) || 20;
  if (page < 1 || size < 1) {
    return res.status(400).json({ message: "Page and size must be positive integers" });
  }
  if (size > 100) size = 100;


  let where = {};
  if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
  if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
  if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
  if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
  if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

  try {
    const spots = await Spot.findAndCountAll({
      where,
      limit: size,
      offset: (page - 1) * size,
      include: [
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false,
        },
      ],
    });

    // Format response
    const formattedSpots = spots.rows.map(spot => ({
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
      previewImage: spot.SpotImages?.[0]?.url || null,
    }));

    return res.json({
      Spots: formattedSpots,
      page,
      size,
    });
  } catch (err) {
    console.error('Error fetching spots:', err);
    return res.status(500).json({ error: 'An error occurred while retrieving spots.' });
  }
});

module.exports = router;
