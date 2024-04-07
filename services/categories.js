const { ErrorCode } = require('../utils/codes')
const { toNumeric } = require('../utils')
const db = require('../models')

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
  // 有效文章分類 id 則直接返回，否則返回預設文章分類 id
  validCategory(categoryId) {
    const [cid, ok] = toNumeric(categoryId)
    if (ok) {
      categoryId = cid
    }
    return this.isValidCategory(categoryId) ? categoryId : 1
  }
  // 判斷文章分類 id 是否有效
  isValidCategory(categoryId) {
    for (let i = 0; i < this.n_category; i++) {
      if (this.categories[i].id === categoryId) {
        return true
      }
    }
    return false
  }
}

const Service = new CategoryService()
module.exports = Service
