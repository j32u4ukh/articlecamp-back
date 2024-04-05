// const { Article: ArticleModel, Category } = require('../_models/index.js')
// const Follow = require('./follows.js')
const { ErrorCode } = require('../utils/codes.js')
const Service = require('./base')
const { User } = require('./users')
const { Sequelize, Op } = require('sequelize')
const db = require('../models')
const { options } = require('../routes/articles.js')
const Article = db.article
const Follow = db.follow

class ArticleService extends Service {
  // TODO: 串接資料庫
  // 新增文章
  add(article) {
    return new Promise((resolve, reject) => {
      article.category = Category.validCategory(article.category)
      const isValid = ArticleModel.validate(article)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: `缺少必要參數, requiredFields: ${JSON.stringify(
            ArticleModel.requiredFields
          )}`,
        })
      } else {
        ArticleModel.add(article)
          .then((article) => {
            delete article.userId
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
  // TODO: 串接資料庫
  // 取得批次的文章列表
  getBatchDatas(userId, offset, size, summary, filterFunc) {
    return new Promise(async (resolve, reject) => {
      try {
        const articles = await this.getList(userId, summary, filterFunc)
        // const results = super.getBatchDatas({ datas: articles, offset, size })
        resolve(articles)
      } catch (error) {
        reject(error)
      }
    })
  }
  // 取得文章列表
  getList(userId, summary, filterFunc) {
    return new Promise(async (resolve, reject) => {
      const options = {
        where: {
          [Op.or]: [
            { userId: userId },
            {
              userId: {
                [Op.in]: [
                  Sequelize.literal(
                    `SELECT \`followTo\` FROM \`follows\` WHERE \`userId\` = ${userId}`
                  ),
                ],
              },
            },
          ],
        },
        order: [['updatedAt', 'ASC']],
        limit: 10,
        offset: 20,
      }
      Article.findAll(options)
        .then((articles) => {
          articles = articles.map((article) => {
            // 是否返回摘要即可
            if (summary) {
              let preview = article.content.substring(0, 20)
              if (article.content.length > 20) {
                preview += '...'
              }
              article.content = preview
            }
            return article
          })
          resolve(articles)
        })
        .catch((error) => {
          console.error(error)
          reject({
            code: ErrorCode.ReadError,
            msg: '讀取文章列表數據時發生錯誤',
          })
        })
    })
  }
  // TODO: 串接資料庫
  // 根據關鍵字搜尋文章
  getByKeyword(userId, offset, size, summary, keyword) {
    return new Promise(async (resolve, reject) => {
      keyword = keyword.toUpperCase()
      // NOTE: 搜尋字如果要搜文章分類，必須是完整名稱，不區分大小寫
      // 根據搜尋字反查文章分類 id，再比對各篇文章的分類 id，而非將各篇文章的分類 id 轉換成字串來比對
      let cid = Category.getId(keyword)
      const articles = await this.getList(userId, summary, (article) => {
        if (article.author.toUpperCase().includes(keyword)) {
          return true
        }
        if (article.title.toUpperCase().includes(keyword)) {
          return true
        }
        if (article.content.toUpperCase().includes(keyword)) {
          return true
        }
        if (cid !== null && article.category === cid) {
          return true
        }
        return false
      })
      const results = super.getBatchDatas({ datas: articles, offset, size })
      resolve(results)
    })
  }
  // 根據文章 ID 取得文章
  get({ id }) {
    return new Promise((resolve, reject) => {
      Article.findByPk(id, {
        raw: true,
      })
        .then((article) => {
          if (!article) {
            return reject({
              code: ErrorCode.NotFound,
              msg: `沒有 id 為 ${id} 的文章`,
            })
          }
          return resolve(article)
        })
        .catch((error) => {
          console.log(`讀取文章數據時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.ReadError,
            msg: '讀取文章數據時發生錯誤',
          })
        })
    })
  }
  // TODO: 串接資料庫
  // 根據文章 ID 更新文章
  update({ id, userId, article }) {
    return new Promise((resolve, reject) => {
      article.category = Category.validCategory(article.category)
      const { index, data } = ArticleModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
        return
      }

      // 檢查請求是否來自原作者
      if (userId !== data.userId) {
        return reject({
          code: ErrorCode.Unauthorized,
          msg: '當前用戶沒有權限修改這篇文章',
        })
      }

      article.id = id
      article.userId = data.userId
      article.createAt = data.createAt
      const isValid = ArticleModel.validate(article)
      if (!isValid) {
        return reject({
          code: ErrorCode.MissingParameters,
          msg: '缺少必要參數',
        })
      }

      // 更新文章數據
      ArticleModel.update(article)
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
  // TODO: 串接資料庫
  // 根據文章 ID 刪除文章
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

const service = new ArticleService()
module.exports = service
