const ArticleModel = require('../models/articles.js')
const { ErrorCode } = require('../utils/codes.js')

class ArticleService {
  getList(filterFunc) {
    return new Promise((resolve, reject) => {
      let articles = ArticleModel.getList(filterFunc)
      articles = articles.map((article) => {
        delete article.createAt
        return article
      })
      resolve(articles)
    })
  }
  get({ id }) {
    return new Promise((resolve, reject) => {
      const result = ArticleModel.get(id)
      if (result.index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
        return
      }

      let article = result.data
      delete article.createAt
      resolve(article)
    })
  }
  add(article) {
    return new Promise((resolve, reject) => {
      const isValid = ArticleModel.validate(article)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: `缺少必要參數`,
        })
      } else {
        ArticleModel.add(article)
          .then((article) => {
            delete article.createAt
            resolve(article)
          })
          .catch((err) => {
            console.error(err)
            reject({
              code: ErrorCode.WriteError,
              msg: '寫入數據時發生錯誤',
            })
          })
      }
    })
  }
  update({ id, article }) {
    return new Promise((resolve, reject) => {
      const { index, data } = ArticleModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
        return
      }
      article.id = id
      article.author = data.author
      article.createAt = data.createAt
      const isValid = ArticleModel.validate(article)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: '缺少必要參數',
        })
        return
      }
      ArticleModel.update(index, article)
        .then((result) => {
          resolve(result)
        })
        .catch((err) => {
          console.error(err)
          reject({
            code: ErrorCode.UpdateError,
            msg: '更新數據時發生錯誤',
          })
        })
    })
  }
}

const Article = new ArticleService()
module.exports = Article
