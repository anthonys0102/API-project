'use strict';
const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Aakename',
        lastName: 'Danana',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user3@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'Fakename',
        lastName: 'Banana',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'Gakename',
        lastName: 'Panana',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
