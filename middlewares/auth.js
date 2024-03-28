const { Auth } = require('../services')
const { ErrorCode } = require('../utils/codes')

module.exports = (req, res, next) => {
  Auth.verifyToken(req)
    .then((token) => {
      req.authData = token
      next()
    })
    .catch((error) => {
      console.log(error)
      error.location = '/login'
      return res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
}
