const Model = require('./base')
const { getTimestamp } = require('../utils')

class ArticleModel extends Model {
  constructor({ version }) {
    super({ file_path: `./public/data/v${version}/articles.json` })
    this.version = version
    this.articles = []
    this.next_id = 0
    this.n_article = 0

    // TODO: 根據 version 不同，設置不同的必要欄位
    this.requiredFields = ['userId', 'title', 'content']

    this.read()
      .then((articles) => {
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
  // 取得所有文章
  getAll() {
    return this.articles
  }
  // 根據文章 id 取得指定文章
  get(id) {
    return super.get({ id: id, datas: this.articles, n_data: this.n_article })
  }
  getList(func) {
    if (func) {
      return this.articles.filter((article) => {
        return func(article)
      })
    } else {
      return this.articles
    }
  }
  // 根據文章 id 更新指定文章
  update(index, article) {
    return new Promise((resolve, reject) => {
      article.updateAt = getTimestamp()
      this.articles[index] = article

      // 將文章列表寫入檔案中
      this.write(this.articles)
        .then((articles) => {
          resolve(articles[index])
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
}

const Article1 = new ArticleModel({ version: 1 })
const Article2 = new ArticleModel({ version: 2 })
module.exports = { Article1, Article2 }
