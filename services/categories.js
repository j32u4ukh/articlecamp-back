const db = require('../models')
const { ErrorCode } = require('../utils/codes')
const Category = db.category

class CategoryService {
  constructor() {
    this.categories = null
    this.getList()
  }
  getId(name) {
    name = name.toUpperCase()
    const category = this.categories.find((c) => c.name.toUpperCase() === name)
    if (category) {
      return category.id
    }
    return null
  }
  getList() {
    return new Promise((resolve, reject) => {
      if (this.categories !== null) {
        return resolve(this.categories)
      }
      Category.findAll({
        attributes: ['id', 'name'],
        raw: true,
      })
        .then((categories) => {
          this.categories = categories
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
