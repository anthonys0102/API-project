'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Spot, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      Review.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  Review.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Spots', key: 'id' },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      review: { type: DataTypes.TEXT, allowNull: false },
      stars: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );

  return Review;
};
