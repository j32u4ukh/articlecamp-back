const ArticleModel = require('../models/articles.js')
const { ErrorCode } = require('../utils/codes.js')

class ArticleService {
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
  getList(filterFunc) {
    return new Promise((resolve, reject) => {
      resolve(ArticleModel.getList(filterFunc))
    })
  }
  getByKeyword(keyword) {
    return new Promise((resolve, reject) => {
      keyword = keyword.toUpperCase()
      this.getList((article) => {
        if (article.title.toUpperCase().includes(keyword)) {
          return true
        }
        if (article.content.toUpperCase().includes(keyword)) {
          return true
        }
        return false
      }).then((articles) => {
        resolve(articles)
      })
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
      resolve(result.data)
    })
  }
  update({ id, article }) {
    return new Promise((resolve, reject) => {
      const isValid = ArticleModel.validate(article)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: '缺少必要參數',
        })
        return
      }
      const { index, data } = ArticleModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
        return
      }
      article.id = id
      article.createAt = data.createAt
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
  delete({ id }) {
    return new Promise((resolve, reject) => {
      const { index, _ } = ArticleModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
        return
      }
      ArticleModel.delete(id)
        .then(() => {
          resolve({
            code: ErrorCode.Ok,
            msg: 'OK',
          })
        })
        .catch((err) => {
          console.error(err)
          reject({
            code: ErrorCode.DeleteError,
            msg: '刪除數據時發生錯誤',
          })
        })
    })
  }
}

const Article = new ArticleService()
module.exports = Article
