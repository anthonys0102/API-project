const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();
// Validation middleware for creating a booking
const validateBooking = [
  check('startDate').exists({ checkFalsy: true }).withMessage('Start date is required.'),
  check('endDate').exists({ checkFalsy: true }).withMessage('End date is required.'),
  check('endDate')
    .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
    .withMessage('End date must be after start date.'),
  handleValidationErrors,
];

// Edit a Booking by ID
router.put('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user.id;
  const today = new Date();

  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== userId)
      return res.status(403).json({ message: 'Forbidden: You are not authorized to edit this booking' });

    if (new Date(booking.endDate) < today)
      return res.status(400).json({ message: 'Past bookings cannot be modified' });

    const overlappingBooking = await Booking.findOne({
      where: {
        spotId: booking.spotId,
        id: { [Op.ne]: bookingId },
        startDate: { [Op.lt]: new Date(endDate) },
        endDate: { [Op.gt]: new Date(startDate) },
      },
    });

    if (overlappingBooking) return res.status(403).json({ message: 'This spot is already booked for the specified dates' });

    await booking.update({ startDate, endDate });
    return res.json(booking);
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(500).json({ error: 'An error occurred while updating the booking.' });
  }
});

// Delete a Booking by ID
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const today = new Date();

  try {
    const booking = await Booking.findByPk(bookingId, { include: [{ model: Spot }] });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== userId && booking.Spot.ownerId !== userId)
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this booking' });

    if (new Date(booking.startDate) <= today)
      return res.status(400).json({ message: 'Bookings that have started cannot be deleted' });

    await booking.destroy();
    return res.json({ message: 'Successfully deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ error: 'An error occurred while deleting the booking.' });
  }
});
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const today = new Date();

  const booking = await Booking.findByPk(bookingId, { include: [{ model: Spot }] });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  if (booking.userId !== userId && booking.Spot.ownerId !== userId)
    return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this booking' });

  if (new Date(booking.startDate) <= today)
    return res.status(400).json({ message: 'Bookings that have started cannot be deleted' });

  await booking.destroy();
  return res.json({ message: 'Successfully deleted' });
});

// Get all bookings for a spot
router.get('/spots/:spotId/bookings', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);
  if (!spot) return res.status(404).json({ message: 'Spot not found' });

  const isOwner = spot.ownerId === userId;
  const bookings = await Booking.findAll({
    where: { spotId },
    include: isOwner ? [{ model: User, attributes: ['id', 'firstName', 'lastName'] }] : [],
  });

  return res.json({
    Bookings: bookings.map(booking => ({
      id: booking.id,
      spotId: booking.spotId,
      userId: isOwner ? booking.userId : undefined,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: isOwner ? booking.createdAt : undefined,
      updatedAt: isOwner ? booking.updatedAt : undefined,
      User: isOwner ? { id: booking.User.id, firstName: booking.User.firstName, lastName: booking.User.lastName } : undefined
    }))
  });
});

module.exports = router;
