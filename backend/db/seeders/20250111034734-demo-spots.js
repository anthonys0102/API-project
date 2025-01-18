'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spots.bulkCreate([
      {
        ownerId: 1,
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Cozy Apartment',
        description: 'A lovely, comfortable place to stay.',
        price: 200.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: '456 Elm St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Luxury Villa',
        description: 'A luxurious villa with amazing views.',
        price: 500.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: '789 Oak St',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        lat: 47.6062,
        lng: -122.3321,
        name: 'Modern Loft',
        description: 'A modern loft in the heart of the city.',
        price: 300.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {

    }, {});
  }
};
