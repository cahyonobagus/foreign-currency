var express         = require('express')
var router          = express.Router()
var forexController = require('../../controllers/forex')
var validate        = require('../../helpers/validateRequest')

// ADD DAILY EXCHANGE RATE
router.post(
    '/daily',
    validate.forex.addDailyRate,
    forexController.addDailyRate
  )

// FETCH DATA EXCHANGE RATE AND PAST 7-DAY AVERAGE RATE 
router.post(
    '/',
    validate.forex.getListRate,
    forexController.getListRate
  )

// FETCH EXCHANGE RATE TREND FROM MOST RECENT 7 DATA POINTS
router.post(
  '/trend',
  validate.forex.getTrend,
  forexController.getTrend
)

// ADD CURRENCY PAIR 
router.post(
  '/currency_pair',
  validate.forex.addCurrencyPair,
  forexController.addCurrencyPair
)

// GET ALL LIST CURRENCY PAIR 
router.get('/currency_pair', forexController.getAllCurrencyPair)

// DELETE A CURRENCY PAIR
router.delete(
    '/currency_pair', 
    validate.forex.deleteCurrencyPair, 
    forexController.deleteCurrencyPairById
  )

module.exports = router;
