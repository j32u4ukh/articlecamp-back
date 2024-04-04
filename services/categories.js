const { Category: Model } = require('../_models/index')

class CategoryService {  
  // TODO: 串接資料庫
  getList(filterFunc) {
    return new Promise((resolve, reject) => {
      const categories = Model.getList(filterFunc)
      resolve(categories)
    })
  }
}

const Category = new CategoryService()
module.exports = Category
