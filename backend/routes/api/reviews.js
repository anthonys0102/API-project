const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Review, ReviewImage, Spot, SpotImage, User } = require('../../db/models');

const router = express.Router();

// Maximum allowed images per review
const MAX_IMAGES_PER_REVIEW = 10;

// Get all reviews of the current user
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Spot,
          attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country',
            'lat', 'lng', 'name', 'price'
          ],
          include: [
            {
              model: SpotImage,
              attributes: ['url'],
              where: { preview: true },
              required: false,
            }
          ]
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
        }
      ],
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: review.stars,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      User: {
        id: review.User.id,
        firstName: review.User.firstName,
        lastName: review.User.lastName,
      },
      Spot: {
        id: review.Spot.id,
        ownerId: review.Spot.ownerId,
        address: review.Spot.address,
        city: review.Spot.city,
        state: review.Spot.state,
        country: review.Spot.country,
        lat: review.Spot.lat,
        lng: review.Spot.lng,
        name: review.Spot.name,
        price: review.Spot.price,
        previewImage: review.Spot.SpotImages?.[0]?.url || null,
      },
      ReviewImages: review.ReviewImages.map(image => ({
        id: image.id,
        url: image.url,
      })),
    }));

    return res.json({ Reviews: formattedReviews });
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    return res.status(500).json({ error: 'An error occurred while fetching the reviews.' });
  }
});

module.exports = router;
