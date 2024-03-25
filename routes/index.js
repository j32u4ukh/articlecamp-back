// 引用 Express 與 Express 路由器
const Router = require('express')
const { ReturnCode, ErrorCode } = require('../utils/codes')
const { User } = require('../services')

// 建立根路由
const router = Router()

// 準備引入路由模組
const articles = require('./articles')
const users = require('./users')

// API-v2
const v2 = Router()
v2.use('/articles', articles)
v2.use('/users', users)

// 註冊帳號
v2.post('/register', (req, res) => {
  /*{
        name: "Author Name",
        email: "This is title",
        password: "This is content",
    }*/
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

// 將 API-v2 相關路由加入根路由
router.use('/v2', v2)

// 匯出路由器
module.exports = router
