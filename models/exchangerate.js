'use strict';
module.exports = (sequelize, DataTypes) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    CurrencyPairId    : DataTypes.INTEGER,
    date              : DataTypes.DATEONLY,
    rate              : DataTypes.FLOAT
  }, {timestamps: true});
  ExchangeRate.associate = function(models) {
    // associations can be defined here
    ExchangeRate.belongsTo(models.CurrencyPair)
  };
  return ExchangeRate;
};
