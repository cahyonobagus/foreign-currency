const models            = require('../models')
const CurrencyPair      = models.CurrencyPair
const ExchangeRate      = models.ExchangeRate
const bundleResponse    = require('../helpers/bundleResponse')
const moment            = require('moment')
const invalidRequest    = "Invalid data provided"
const { validationResult } = require('express-validator/check')

module.exports = {
  addDailyRate: (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      CurrencyPair.find({
        attributes: ['id'], 
        where: {
          currencyOrigin      : req.body.from.toUpperCase(), 
          currencyDestination : req.body.to.toUpperCase()
        }
      })
      .then(currencypair => {
        if(currencypair) {
          ExchangeRate.findOrCreate({
            where   : { CurrencyPairId: currencypair.id, date: req.body.date},
            defaults: { rate: req.body.rate }
          })
          .spread((exrate, created) => {
            // created == true means new object was just created, and false means data already exist in db
            if(created) {
              bundleResponse.success(res, exrate)
            } else {
              // data exist, just update the rate (only one rate in a day)
              exrate.update(
                { rate  : req.body.rate },
                { 
                  returning : true
                }
              )
              .then(exchangerate => {
                bundleResponse.success(res, exchangerate)
              })
              .catch(err => {
                bundleResponse.error(res, err)
              })
            }
          })
          .catch(err => {
            bundleResponse.error(res, err)
          })
          
        } else {
          CurrencyPair.create({
            currencyOrigin      : req.body.from.toUpperCase(), 
            currencyDestination : req.body.to.toUpperCase()
          })
          .then(currencypair => {
            ExchangeRate.create({
              CurrencyPairId: currencypair.id,
              date          : req.body.date,
              rate          : req.body.rate
            })
            .then(exchangerate => {
              bundleResponse.success(res, exchangerate)
            })
            .catch(err => {
              bundleResponse.error(res, err)
            })
          })
          .catch(err => {
            bundleResponse.error(res, err)
          })
        }
      })
      .catch(err => {
        bundleResponse.error(res, err)
      })
    } else {
      bundleResponse.fail(res, { reason: invalidRequest, errors: errors.array() })
    }
  },
  getListRate: (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      var startDate = moment(req.body.date).subtract(6, 'days').format('YYYY-MM-DD')
      CurrencyPair.findAll({
        attributes: ['currencyOrigin', 'currencyDestination'],
        order: [
          [models.ExchangeRate, 'date', 'DESC']
        ],
        include: [{
          model: models.ExchangeRate,
          attributes : ['date', 'rate'],
          where : { 
            date: { 
              $between : [startDate, req.body.date]
            } 
          },
          required: false 
        }]
      })
      .then(currencypair => {
        var dataResponse = []
        for (let pair of currencypair) {
          var sevenDayAverage = 'insufficient data'
          if(pair.ExchangeRates.length > 0) {
            var rates = []
            for(let exrate of pair.ExchangeRates) {
              rates.push(exrate.rate)
            }
            sevenDayAverage   = rates.reduce((total, element) => total + element ) / rates.length
          } 
    
          dataResponse.push({
            from: pair.currencyOrigin,
            to  : pair.currencyDestination,
            rate: pair.ExchangeRates.length > 0 ? pair.ExchangeRates[0].rate : 'insufficient data',
            sevenDayAverage
          })
        }
        bundleResponse.success(res, dataResponse)
      })
      .catch(err => {
        bundleResponse.error(res, err)
      })
    } else {
      bundleResponse.fail(res, { reason: invalidRequest, errors: errors.array() })
    }
    
  },
  getTrend: (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      CurrencyPair.find({
        attributes: ['currencyOrigin', 'currencyDestination'],
        where: { id: req.body.id },
      })
      .then(currencypair => {
        /**
         * CURRENT VERSION OF SEQUELIZE IS NOT SUPPORTED TO SET LIMIT
         * ON ASSOCIATION (INCLUDE CLAUSE), SO THAT I USE 2 QUERIES
         */
        ExchangeRate.findAll({
          where: { CurrencyPairId: req.body.id },
          attributes: ['date', 'rate'],
          order: [
            ['date', 'DESC'],
          ], 
          limit: 7  // 7 data points is the maximum, based on the requirement  
        })
        .then(exchangerates => {
          var average   = 0
          var variance  = 0
          if(exchangerates.length > 0) {
            var rates = []
            for(let exrate of exchangerates) {
              rates.push(exrate.rate)
            }
            rates.sort((a, b) => b - a )
            variance  = rates[0] - rates[rates.length - 1]
            average   = rates.reduce((total, element) => total + element ) / rates.length
          } 

          var dataResponse = {
            from    : currencypair.currencyOrigin,
            to      : currencypair.currencyDestination,
            average,
            variance,
            trends : exchangerates
          }

          bundleResponse.success(res, dataResponse)
        })
        .catch(err => {
          bundleResponse.error(res, err)
        })
        
      })
      .catch(err => {
        bundleResponse.error(res, err)
      })
    } else {
      bundleResponse.fail(res, { reason: invalidRequest, errors: errors.array() })
    }
  },
  addCurrencyPair: (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      // find existing data
      CurrencyPair.find({
        where: {
          currencyOrigin      : req.body.from.toUpperCase(), 
          currencyDestination : req.body.to.toUpperCase()
        }
      })
      .then(currencypair => {
        
        if(currencypair) {
          // data exist
          bundleResponse.fail(res, { reason: 'Data already exist' })
        } else {
          // data doesn't exist, then create a new one
          CurrencyPair.create({
            currencyOrigin     : req.body.from.toUpperCase(),
            currencyDestination: req.body.to.toUpperCase()
          })
          .then(currencypair => {
            bundleResponse.success(res, currencypair)
          })
          .catch(err => {
            bundleResponse.error(res, err)
          })
        }
        
      })
      .catch(err => {
        bundleResponse.error(res, err)
      })
    } else {
      bundleResponse.fail(res, { reason: invalidRequest, errors: errors.array()})
    }

  },
  getAllCurrencyPair: (req, res) => {
    CurrencyPair.findAll({ 
      attributes: ['id','currencyOrigin', 'currencyDestination'] 
    })
    .then(currencypairs => {
      bundleResponse.success(res, currencypairs)
    })
    .catch(err => { bundleResponse.error(res, err) })
  },
  deleteCurrencyPairById : (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      CurrencyPair.destroy({
        where: {
          id  : req.body.id
        }
      })
      .then(currencypair => {
        bundleResponse.success(res, {deletedRow: currencypair, id: req.body.id })
      })
      .catch(err => {
        bundleResponse.error(res, err)
      })
    } else {      
      bundleResponse.fail(res, {reason: invalidRequest, errors: errors.array()})
    }
  }
}
