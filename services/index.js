const { User } = require('./users')
const Article = require('./article')
const Auth = require('./auth')
const Category = require('./categories')
const Follow = require('./follows')
const Message = require('./messages')
const UserFollow = require('./user_follows')

module.exports = {
  Article,
  Auth,
  Category,
  Follow,
  Message,
  User,
  UserFollow,
}
