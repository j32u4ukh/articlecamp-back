const { Category: Model } = require('../_models/index')

class CategoryService {
  getList(filterFunc) {
    return new Promise((resolve, reject) => {
      const categories = Model.getList(filterFunc)
      resolve(categories)
    })
  }
}

const Category = new CategoryService()
module.exports = Category
