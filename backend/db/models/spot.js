'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    static associate(models) {
      Spot.hasMany(models.Review, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      Spot.belongsTo(models.User, { foreignKey: 'ownerId' });
    }
  }

  Spot.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      address: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      lat: { type: DataTypes.FLOAT, allowNull: false },
      lng: { type: DataTypes.FLOAT, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.DECIMAL, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Spot',
    }
  );

  return Spot;
};
