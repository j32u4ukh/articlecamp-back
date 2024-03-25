const Article = require('./article')
const Category = require('./categories')
const Message = require('./messages')
const { User } = require('./users')
const Follow = require('./follows')
const UserFollow = require('./user_follows')
const Auth = require('./auth')

module.exports = {
  Article,
  Category,
  Message,
  User,
  Follow,
  UserFollow,
  Auth,
}
