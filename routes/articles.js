const { Article, Category, Message } = require('../services')
const { ReturnCode, ErrorCode } = require('../utils/codes')
const { Router } = require('express')

// 建立路由物件
const router = Router()

// 取得文章列表
router.get('/', (req, res) => {
  // 從 JWT 中取得 userId
  const userId = Number(req.authData.user.id)
  const keyword = req.query.keyword
  const offset = req.query.offset
  const size = req.query.size
  const filter = {}
  if (keyword) {
    filter.keyword = keyword
  }
  Article.getBatchDatas(userId, offset, size, filter)
    .then((articles) => {
      res.json(articles)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

// 新增文章
router.post('/', (req, res) => {
  // 從 JWT 中取得 userId
  const userId = Number(req.authData.user.id)
  const BODY = req.body
  const title = BODY.title
  if (title === undefined || title === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.ParamError,
      msg: 'title 為必要參數',
    })
  }
  Article.add({
    userId,
    title,
    category: BODY.category,
    content: BODY.content,
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.get('/categories', (req, res) => {
  Category.getList().then((categories) => {
    res.json(categories)
  })
})

router.get('/:id/messages', (req, res) => {
  const articleId = Number(req.params.id)
  const offset = req.query.offset
  const size = req.query.size
  Message.getBatchDatas(articleId, offset, size)
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.post('/:id/messages', (req, res) => {
  // 從 JWT 中取得 userId
  const userId = Number(req.authData.user.id)

  const articleId = Number(req.params.id)
  const message = req.body
  if (message.content === undefined || message.content === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: 'content 為必要參數',
    })
  }

  Message.add(userId, articleId, message)
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  Article.get({
    id,
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.put('/:id', (req, res) => {
  // 從 JWT 中取得 userId
  const userId = Number(req.authData.user.id)
  const id = Number(req.params.id)
  Article.update({
    id,
    userId,
    article: req.body,
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

module.exports = router
