'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
      Review.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Review.init(
    {
      spotId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      review: DataTypes.TEXT,
      stars: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );

  return Review;
};
