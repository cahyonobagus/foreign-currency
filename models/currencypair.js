'use strict';
module.exports = (sequelize, DataTypes) => {
  const CurrencyPair = sequelize.define('CurrencyPair', {
    currencyOrigin     : DataTypes.STRING,
    currencyDestination: DataTypes.STRING,
    deletedAt          : DataTypes.DATE
  }, {
    timestamps  : true,
    paranoid    : true
  });
  CurrencyPair.associate = function(models) {
    // associations can be defined here
    CurrencyPair.hasMany(models.ExchangeRate)
  };
  return CurrencyPair;
};
