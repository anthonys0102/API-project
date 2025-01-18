'use strict';
const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { User } = require('../models'); // Import the User model

    // Use bulkCreate to seed Users
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: 'hashed_password_1', // Replace with properly hashed passwords
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user1@user.io',
        username: 'UserOne',
        hashedPassword: 'hashed_password_2', // Replace with properly hashed passwords
        firstName: 'User',
        lastName: 'One',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user2@user.io',
        username: 'UserTwo',
        hashedPassword: 'hashed_password_3', // Replace with properly hashed passwords
        firstName: 'User',
        lastName: 'Two',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {
      validate: true, // Ensures data validation
    });
  },

  async down(queryInterface, Sequelize) {
    const { User } = require('../models'); // Import the User model

    // Use destroy to remove seeded users
    await User.destroy({
      where: {
        username: ['Demo-lition', 'UserOne', 'UserTwo'],
      },
    });
  }
};
