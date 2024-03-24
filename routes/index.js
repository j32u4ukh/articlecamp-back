// 引用 Express 與 Express 路由器
const Router = require('express')
const router = Router()

// API-v1
const v1 = Router()
const articles = require('./articles')
v1.use('/articles', articles)

router.use('/v1', v1)

// 匯出路由器
module.exports = router
