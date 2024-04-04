const { Message: MessageModel, Article: ArticleModel } = require('../_models/index.js')
const { ErrorCode } = require('../utils/codes.js')
const Service = require('./base')

class MessageService extends Service {
  // TODO: 串接資料庫
  getBatchDatas(articleId, offset, size, filterFunc) {
    return new Promise(async (resolve, reject) => {
      try {
        const messages = await this.getList(articleId, filterFunc)
        const results = super.getBatchDatas({ datas: messages, offset, size })
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })
  }
  // TODO: 串接資料庫
  getList(articleId, filterFunc) {
    return new Promise((resolve, reject) => {
      const article = ArticleModel.get(articleId)
      if (article.index === -1) {
        return reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的文章`,
        })
      }
      const messages = MessageModel.getList(articleId, filterFunc)
      resolve(messages)
    })
  }
  // TODO: 串接資料庫
  get({ id }) {
    return new Promise((resolve, reject) => {
      const result = MessageModel.get(id)
      if (result.index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的留言`,
        })
      }
      resolve(result.data)
    })
  }
  // TODO: 串接資料庫
  add(userId, articleId, message) {
    return new Promise((resolve, reject) => {
      // 檢查 articleId 是否存在
      const article = ArticleModel.get(articleId)
      if (article.index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${articleId} 的文章`,
        })
        return
      }

      message.userId = userId
      message.articleId = articleId
      const isValid = MessageModel.validate(message)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: '缺少必要參數',
        })
        return
      }
      MessageModel.add(message)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject({
            code: ErrorCode.WriteError,
            msg: error,
          })
        })
    })
  }
}

const Message = new MessageService()
module.exports = Message
