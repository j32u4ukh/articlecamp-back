const Router = require('express')
const router = Router()
const Article = require('../services/article.js')
const { ReturnCode, ErrorCode } = require('../utils/codes.js')

router.get('/', (req, res) => {
  const keyword = req.query.keyword
  if (keyword) {
    Article.getByKeyword({ keyword }).then((articles) => {
      res.json(articles)
    })
  } else {
    Article.getList().then((articles) => {
      res.json(articles)
    })
  }
})

router.post('/', (req, res) => {
  const BODY = req.body
  console.log(`create: ${JSON.stringify(BODY)}`)
  const author = BODY.author
  if (author === undefined || author === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.ParamError,
      msg: 'author 為必要參數',
    })
  }
  const title = BODY.title
  if (title === undefined || title === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.ParamError,
      msg: 'title 為必要參數',
    })
  }
  Article.add({
    author,
    title,
    content: BODY.content,
  })
    .then((result) => {
      res.json(result)
    })
    .catch(({ ret, err }) => {
      res.status(ret).json(err)
    })
})

router.get('/:id', (req, res) => {
  Article.get({
    id: Number(req.params.id),
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.put('/:id', (req, res) => {
  Article.update({
    id: Number(req.params.id),
    article: req.body,
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.delete('/:id', (req, res) => {
  Article.delete({
    id: Number(req.params.id),
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

module.exports = router
