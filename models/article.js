'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      article.belongsTo(models.user)
    }
  }
  article.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      category: DataTypes.INTEGER,
      content: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'article',
    }
  )
  return article
}
