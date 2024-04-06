// 引用 Express 與 Express 路由器
const Router = require('express')
const { ReturnCode, ErrorCode } = require('../utils/codes')
const { User, Auth } = require('../services')

// 建立根路由
const router = Router()

// 準備引入路由模組
const articles = require('./articles')
const users = require('./users')
const authHandler = require('../middlewares/auth')

// API-v2
const v2 = Router()
v2.use('/articles', authHandler, articles)
v2.use('/users', users)

// 註冊帳號
v2.post('/register', (req, res) => {
  const BODY = req.body
  const name = BODY.name
  if (name === undefined || name === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 name',
    })
  }
  const email = BODY.email
  if (email === undefined || email === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 email',
    })
  }
  const password = BODY.password
  if (password === undefined || password === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 password',
    })
  }
  User.add({ name, email, password })
    .then((user) => {
      res.json(user)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

// 帳號登入
v2.post('/login', (req, res) => {
  const BODY = req.body
  const email = BODY.email
  if (email === undefined || email === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 email',
    })
  }
  const password = BODY.password
  if (password === undefined || password === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 password',
    })
  }
  Auth.login({ email, password })
    .then((token) => {
      res.json({
        token,
      })
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

v2.get('/test', (req, res) => {
  const { Article } = require('../services')
  console.log('/test')
  Article.getCount(1)
    .then((count) => {
      console.log(`count: ${count}`)
      res.json({ count })
    })
    .catch((error) => [res.status(500).json(error)])
})

// 將 API-v2 相關路由加入根路由
router.use('/v2', v2)

// 匯出路由器
module.exports = router
