const { Article: ArticleModel, Category } = require('../_models/index.js')
const Follow = require('./follows.js')
const { ErrorCode } = require('../utils/codes.js')
const Service = require('./base')
const { User } = require('./users')

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
        const results = super.getBatchDatas({ datas: articles, offset, size })
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })
  }
  // TODO: 串接資料庫
  // 取得文章列表
  getList(userId, summary, filterFunc) {
    return new Promise(async (resolve, reject) => {
      // 取得用戶 ID 以及其追蹤對象的 ID 列表
      const ids = [userId]
      const follows = await Follow.getList(userId)
      follows.forEach((follow) => {
        ids.push(follow.followTo)
      })

      // 根據 ID 列表返回文章列表
      let articles = ArticleModel.getList((article) => {
        if (filterFunc) {
          let cond = filterFunc(article)
          if (cond === false) {
            return false
          }
        }
        return (
          // 只取得 ID 列表中的作者的文章
          ids.findIndex((id) => {
            return id === article.userId
          }) !== -1
        )
      })

      // 取得用戶列表，並將用戶名稱帶入文章列表數據
      const users = await User.getAll()
      articles = articles.map((article) => {
        const user = users.find((user) => {
          return user.id === article.userId
        })
        if (user) {
          article.author = user.name
        }
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
  // TODO: 串接資料庫
  // 根據文章 ID 取得文章
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

const Article = new ArticleService()
module.exports = Article
