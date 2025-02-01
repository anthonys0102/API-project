'use strict';
const { ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: 'https://example.com/review-image1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 2,
        url: 'https://example.com/review-image2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkDelete(options, null, {});
  }
};
