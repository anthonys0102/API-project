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
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'Fakename',
        lastName: 'Banana',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user4@user.io',
        username: 'FakeUser4',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'Gakename',
        lastName: 'Panana',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    //options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Users', {
      email: { [Op.in]: ['user4@user.io', 'user3@user.io', 'demo@user.io'] }
    }, {});
  }
};
