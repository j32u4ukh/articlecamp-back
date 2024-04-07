const { QueryTypes } = require('sequelize')

const { ErrorCode } = require('../utils/codes.js')
const Article = require('./article')
const db = require('../models')
const Service = require('./base')

const Message = db.message

class MessageService extends Service {
  getOptions(articleId) {
    const options = `FROM messages AS m
                     JOIN users AS u
                     ON u.id = m.userId
                     WHERE m.articleId = ${articleId}`
    return options
  }
  getCount(articleId, filter = {}) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(articleId, filter)
      const sql = `SELECT COUNT(*) as 'count' ${options}`
      try {
        const count = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        resolve(Number(count[0]['count']))
      } catch (error) {
        console.log(`讀取留言數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取留言數據時發生錯誤',
        })
      }
    })
  }
  getList(articleId, filter = {}) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(articleId)
      const sql = `SELECT m.id, m.articleId, u.name, m.content, m.updatedAt
                  ${options}
                  LIMIT ${filter.offset}, ${filter.limit}`

      try {
        let datas = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        return resolve(datas)
      } catch (error) {
        console.log(`讀取留言數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取留言數據時發生錯誤',
        })
      }
    })
  }
  // 新增留言
  add(userId, articleId, message) {
    return new Promise(async (resolve, reject) => {
      try {
        await Article.get({ id: articleId })
        message.userId = userId
        message.articleId = articleId
        message = await Message.create(message)
        return resolve(message)
      } catch (error) {
        if (error.code === undefined || error.msg === undefined) {
          console.log(`更新數據時發生錯誤, error: ${error}`)
          error = {
            code: ErrorCode.UpdateError,
            msg: '更新數據時發生錯誤',
          }
        }
        return reject(error)
      }
    })
  }
}

const service = new MessageService()
module.exports = service
