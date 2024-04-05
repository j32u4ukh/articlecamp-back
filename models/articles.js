const Model = require('./base')
const { getTimestamp, deepCopy } = require('../utils')

class ArticleModel extends Model {
  constructor() {
    super({ file_path: `./public/data/articles.json` })
    this.articles = []
    this.next_id = 0
    this.n_article = 0
    this.requiredFields = ['userId', 'title', 'content']

    this.read()
      .then((articles) => {
        articles = this.sortByTime(articles, 'updateAt')
        articles.forEach((article) => {
          this.next_id = this.next_id > article.id ? this.next_id : article.id
          this.articles.push(article)
        })
        this.next_id++
        this.n_article = articles.length
      })
      .catch((err) => {
        console.error(err)
      })
  }
  // 新增文章
  add(article) {
    return new Promise((resolve, reject) => {
      article.id = this.next_id
      const timestamp = getTimestamp()
      article.createAt = timestamp
      article.updateAt = timestamp
      this.articles.push(article)
      this.articles = this.sortByTime(this.articles, 'updateAt')

      // 將文章列表寫入檔案中
      this.write(this.articles)
        .then((articles) => {
          // 成功寫入，再更新索引值
          this.next_id++
          this.n_article = articles.length
          resolve(article)
        })
        .catch((error) => {
          this.articles.pop()
          reject(error)
        })
    })
  }
  // 根據文章 id 取得指定文章
  get(id) {
    return super.get({ id: id, datas: this.articles })
  }
  getList(func) {
    if (func) {
      return deepCopy(
        this.articles.filter((article) => {
          return func(article)
        })
      )
    } else {
      return deepCopy(this.articles)
    }
  }
  // 根據文章 id 更新指定文章
  update(article) {
    return new Promise((resolve, reject) => {
      article.updateAt = getTimestamp()
      const data = this.get(article.id)
      this.articles[data.index] = article
      this.articles = this.sortByTime(this.articles, 'updateAt')

      // 將文章列表寫入檔案中
      this.write(this.articles)
        .then(() => {
          resolve(article)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  // 根據文章 id 刪除文章
  delete(index) {
    return new Promise((resolve, reject) => {
      // 根據索引值移除文章
      this.articles.splice(index, 1)

      // 將文章列表寫入檔案中
      this.write(this.articles)
        .then(() => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  validate(data) {
    return super.validate(data, this.requiredFields)
  }
}

const Article = new ArticleModel()
module.exports = Article
