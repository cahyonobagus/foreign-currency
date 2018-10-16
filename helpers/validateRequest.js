const { body }  = require('express-validator/check')
const moment    = require('moment')

var schemaReq = {
  addDailyRate : [
    {field: 'date', type: 'string'},
    {field: 'from', type: 'string'},
    {field: 'to',   type: 'string'},
    {field: 'rate', type: 'string'},
  ],
  getListRate : [
    {field: 'date', type: 'string'},
  ],
  getTrend: [
    {field: 'id',   type: 'number'},
  ],
  addCurrencyPair: [
    {field: 'from', type: 'string'},
    {field: 'to',   type: 'string'},
  ],
  deleteCurrencyPair : [
    {field: 'id',   type: 'number'},
  ]
}

function createValidationRule (schemaName) {
  var validationRule = []
  var schemas = schemaReq[schemaName]
  for (let schema of schemas ) {
    validationRule.push(
      body(schema.field).custom(value => {
        if(schema.field == 'date') {
          if(
            value && 
            typeof value == schema.type && 
            moment(value, 'YYYY-MM-DD',true).isValid() == true
          ) {
            return true
          } else {
            throw new Error(`Field ${schema.field} is required and must follow the correct format`)
          }
        } else {
          if(value && typeof value == schema.type) {
            return true
          } else {
            throw new Error(`Field ${schema.field} is required and must be a ${schema.type}`)
          }
        }
      })
    )
  }
  return validationRule
}

var validate = {
  forex: {
    addDailyRate          : createValidationRule('addDailyRate'),
    getListRate           : createValidationRule('getListRate'),
    getTrend              : createValidationRule('getTrend'),
    addCurrencyPair       : createValidationRule('addCurrencyPair'),
    deleteCurrencyPair    : createValidationRule('deleteCurrencyPair')
  }
}


module.exports = validate
