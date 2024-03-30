const express = require('express')
const cors = require('cors')
const Article = require('./services/article.js')
const { ReturnCode, ErrorCode } = require('./utils/codes.js')

const app = express()
const PORT = 3000

// 使用 cors 中間件
app.use(cors())

// 告訴 Express 應用程式要使用 express.json() 中間件來解析請求主體中的 JSON 格式資料
app.use(express.json())

// ==================================================
// 開始定義路由
// ==================================================
// 取得文章列表
app.get('/articles', (req, res) => {
  Article.getList().then((articles) => {
    res.json(articles)
  })
})

// 新增一篇文章
app.post('/articles', (req, res) => {
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

// 根據文章 ID 取得內容
app.get('/articles/:id', (req, res) => {
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

// 根據文章 ID 更新內容
app.put('/articles/:id', (req, res) => {
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

// 伺服器開始監聽
app.listen(PORT, () => {
  console.log(`express server is running on http://localhost:${PORT}`)
})
