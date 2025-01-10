// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Validation middleware
const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First name is required.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last name is required.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  handleValidationErrors,
];

// Route
router.post('/', validateSignup, async (req, res, next) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({
      where: { email },
    });
    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUser || existingUsername) {
      const error = new Error('User already exists');
      error.status = 500;
      error.errors = {
        email: existingUser ? 'Email already exists' : undefined,
        username: existingUsername ? 'Username already exists' : undefined,
      };
      return next(error);
    }

    // Create new user
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
    });

    // Create a safe user object
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    // Set token cookie
    await setTokenCookie(res, safeUser);

    // Respond with the new user
    return res.status(201).json({ user: safeUser });
  } catch (err) {
    // Handle validation errors (status 400)
    if (err.name === 'SequelizeValidationError') {
      err.status = 400;
      err.errors = err.errors.map((e) => e.message);
    }
    next(err);
  }
});

module.exports = router;
