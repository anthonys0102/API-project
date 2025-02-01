const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Review, ReviewImage, Spot, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Maximum allowed images per review
const MAX_IMAGES_PER_REVIEW = 10;

// Validation middleware for editing a review
const validateReview = [
  check('review').exists({ checkFalsy: true }).withMessage('Review text is required.'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5.'),
  handleValidationErrors,
];

// Edit a Review by ID
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to edit this review' });
    }

    await existingReview.update({ review, stars });

    return res.json({
      id: existingReview.id,
      userId: existingReview.userId,
      spotId: existingReview.spotId,
      review: existingReview.review,
      stars: existingReview.stars,
      createdAt: existingReview.createdAt,
      updatedAt: existingReview.updatedAt,
    });
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({ error: 'An error occurred while updating the review.' });
  }
});

// Delete a Review by ID
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this review' });
    }

    await review.destroy();

    return res.json({ message: 'Successfully deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'An error occurred while deleting the review.' });
  }
});

router.delete('/review-images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.id;

  try {
    const image = await ReviewImage.findByPk(imageId, {
      include: [{ model: Review }],
    });

    if (!image) return res.status(404).json({ message: 'Review image not found' });

    if (image.Review.userId !== userId)
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this image' });

    await image.destroy();
    return res.json({ message: 'Successfully deleted' });
  } catch (err) {
    console.error('Error deleting review image:', err);
    return res.status(500).json({ error: 'An error occurred while deleting the review image.' });
  }
});

module.exports = router;
