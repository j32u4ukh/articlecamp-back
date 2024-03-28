const { Auth } = require('../services')

module.exports = (req, res, next) => {
  Auth.verifyToken(req)
    .then((token) => {
      req.authData = token
      next()
    })
    .catch((error) => {
      console.log(error)
      return res.location('/login').json(error)
    })
}
