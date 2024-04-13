const { QueryTypes } = require('sequelize')

const { ErrorCode } = require('../utils/codes.js')
const Category = require('./categories')
const db = require('../models')
const Service = require('./base')

const Article = db.article

class ArticleService extends Service {
  // 新增文章
  add(article) {
    return new Promise((resolve, reject) => {
      article.category = Category.validCategory(article.category)
      Article.create(article)
        .then((article) => {
          article['userId'] = undefined
          article['createdAt'] = undefined
          return resolve(article)
        })
        .catch((err) => {
          console.error(err)
          return reject({
            code: ErrorCode.WriteError,
            msg: '寫入數據時發生錯誤',
          })
        })
    })
  }
  getOptions(userId, filter = {}) {
    let searchCondition = ''
    if (filter.keyword) {
      // NOTE: 搜尋字如果要搜文章分類，必須是完整名稱，不區分大小寫
      // 根據搜尋字反查文章分類 id，再比對各篇文章的分類 id，而非將各篇文章的分類 id 轉換成字串來比對
      let cid = Category.getId(filter.keyword)
      let categoryCondition = ''
      if (cid !== null) {
        categoryCondition = `OR (category = ${cid})`
      }
      searchCondition = `AND (
                          (title LIKE '%${filter.keyword}%') OR
                          (content LIKE '%${filter.keyword}%') OR
                          (u.\`name\` LIKE '%${filter.keyword}%')
                          ${categoryCondition}
                        )`
    }
    const options = `FROM articles AS a
                  JOIN users AS u
                  ON a.userId = u.id
                  WHERE (a.userId = ${userId} OR
                    a.userId IN (
                      SELECT followTo FROM \`follows\`
                      WHERE userId = ${userId}
                    )
                  ) ${searchCondition}`
    return options
  }
  getCount(userId, filter = {}) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(userId, filter)
      const sql = `SELECT COUNT(*) as 'count' ${options}`
      try {
        const count = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        resolve(Number(count[0]['count']))
      } catch (error) {
        console.log(`讀取文章數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取文章數據時發生錯誤',
        })
      }
    })
  }
  // 取得文章列表
  getList(userId, filter) {
    return new Promise(async (resolve, reject) => {
      const options = this.getOptions(userId, filter)
      let offset = Number(filter.offset)
      let limit = Number(filter.limit)
      offset = offset === undefined ? 0 : offset
      limit = limit === undefined ? 10 : limit
      const sql = `SELECT a.id, a.userId, u.\`name\`, u.image, title, category, content, a.updatedAt
                  ${options}
                  LIMIT ${offset}, ${limit}`

      try {
        let datas = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        if (filter.summary) {
          datas.forEach((data) => {
            let preview = data.content.substring(0, 20)
            if (data.content.length > 20) {
              preview += '...'
            }
            data.content = preview
          })
        }
        console.log(`data: ${JSON.stringify(datas[0])}`)
        return resolve(datas)
      } catch (error) {
        console.log(`讀取文章數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取文章數據時發生錯誤',
        })
      }
    })
  }
  // 根據文章 ID 取得文章
  get({ id }) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT a.id, a.userId, u.\`name\`, u.image, title, category, content, a.updatedAt
                  FROM articles AS a
                  JOIN users AS u
                  ON a.userId = u.id
                  WHERE a.id = ${id}`

      try {
        const data = await db.sequelize.query(sql, {
          type: QueryTypes.SELECT,
        })
        console.log(`data: ${JSON.stringify(data)}`)
        if (data.length === 0) {
          return reject({
            code: ErrorCode.NotFound,
            msg: `沒有 id 為 ${id} 的文章`,
          })
        } else {
          return resolve(data[0])
        }
      } catch (error) {
        console.log(`讀取文章數據時發生錯誤, error: ${error}`)
        return reject({
          code: ErrorCode.ReadError,
          msg: '讀取文章數據時發生錯誤',
        })
      }
    })
  }
  // 根據文章 ID 更新文章
  update({ id, userId, article }) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.get({ id })

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

        const result = await Article.update(article, { where: { id, userId } })
        if (Number(result[0]) > 0) {
          return resolve({
            msg: 'OK',
          })
        } else {
          return resolve({
            msg: 'Nothing changed',
          })
        }
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

const service = new ArticleService()
module.exports = service
