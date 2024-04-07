const Service = require('./base')
const { ErrorCode } = require('../utils/codes')
const { QueryTypes } = require('sequelize')
const db = require('../models')

class UserFollowService extends Service {
  getOptions(userId, filter = {}) {
    const options = `FROM users AS u
                     LEFT JOIN \`follows\` AS f
                     ON u.id = f.followTo AND f.userId = ${userId}
                     WHERE u.id != ${userId}`
    return options
  }
  getCount(userId, filter = {}) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(userId, filter)
      const sql = `SELECT COUNT(u.id) as 'count' ${options}`
      try {
        const count = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        resolve(Number(count[0]['count']))
      } catch (error) {
        console.log(`讀取追隨數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取追隨數據時發生錯誤',
        })
      }
    })
  }
  getList(userId, filter) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(userId, filter)
      const sql = `SELECT u.id, u.name, u.image, u.updatedAt, COALESCE(f.status, FALSE) AS status
                  ${options}
                  ORDER BY status DESC
                  LIMIT ${filter.offset}, ${filter.limit}`

      try {
        let datas = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        return resolve(datas)
      } catch (error) {
        console.log(`讀取追隨數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取追隨數據時發生錯誤',
        })
      }
    })
  }
}

const UserFollow = new UserFollowService()
module.exports = UserFollow
