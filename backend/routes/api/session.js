// backend/routes/api/session.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Validation middleware for login
const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors,
];

// Log In a User
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  try {
    // Find the user by username or email
    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: [
          { username: credential },
          { email: credential },
        ],
      },
    });

    // If user not found or password invalid
    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      err.title = 'Authentication Error';
      err.errors = { credential: 'The provided credentials are invalid.' };
      return next(err);
    }

    // Prepare the safe user object
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    // Set token cookie
    await setTokenCookie(res, safeUser);

    // Respond with user info
    return res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

// Get the Current User
router.get('/', restoreUser, requireAuth, (req, res) => {
  const { user } = req;

  // If no user is found, send an error (although requireAuth should already handle this)
  if (!user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  // Prepare safe user object
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  // Send successful response
  return res.json({ user: safeUser });
});

// Log Out a User
router.delete('/', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
});

module.exports = router;
