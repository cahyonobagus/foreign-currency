module.exports = {
  success : (responseObject, data) => {
    responseObject.send({
      status  : 'success',
      data
    })
  },
  fail  : (responseObject, data) => {
    responseObject.send({
      status  : 'fail',
      data
    })
  },
  error : (responseObject, message) => {
    responseObject.send({
      status  : 'error',
      message
    })
  }
}
