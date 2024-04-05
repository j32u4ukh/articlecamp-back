const db = require('../models')
const { ErrorCode } = require('../utils/codes')
const Category = db.category

class CategoryService {
  getList() {
    return new Promise((resolve, reject) => {
      Category.findAll({
        attributes: ['id', 'name'],
        raw: true,
      })
        .then((categories) => {
          resolve(categories)
        })
        .catch((error) => {
          console.log(`讀取文章分類數據時發生錯誤, error: ${error}`)
          reject({
            code: ErrorCode.ReadError,
            msg: '讀取文章分類數據時發生錯誤',
          })
        })
    })
  }
}

const Service = new CategoryService()
module.exports = Service
