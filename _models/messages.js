const Model = require('./base')
const { getTimestamp } = require('../utils')

function belongToArticle(articleId, message) {
  return message.articleId === articleId
}

class MessageModel extends Model {
  constructor() {
    super({ file_path: './public/data/messages.json' })
    this.messages = []
    this.next_id = 0
    this.n_message = 0
    this.requiredFields = ['articleId', 'userId', 'content']

    this.read()
      .then((messages) => {
        // 將留言根據 createAt 進行排序
        messages = this.sortByTime(messages, 'createAt')
        messages.forEach((message) => {
          this.next_id = this.next_id > message.id ? this.next_id : message.id
          this.messages.push(message)
        })
        this.next_id++
        this.n_message = messages.length
      })
      .catch((err) => {
        console.error(err)
      })
  }
  // 新增留言
  add(message) {
    return new Promise((resolve, reject) => {
      message.id = this.next_id
      const timestamp = getTimestamp()
      message.createAt = timestamp
      this.messages.push(message)

      // 將留言根據 createAt 進行排序
      this.messages = this.sortByTime(this.messages, 'createAt')

      // 將留言寫入檔案中
      this.write(this.messages)
        .then((messages) => {
          // 成功寫入，再更新索引值
          this.next_id++
          this.n_message = messages.length
          resolve(message)
        })
        .catch((error) => {
          this.messages.pop()
          reject(error)
        })
    })
  }
  get(id) {
    return super.get({ id, datas: this.messages })
  }
  // 取得留言列表
  getList(articleId, func) {
    let filterFunc
    if (func) {
      filterFunc = (message) => {
        return belongToArticle(articleId, message) && func(message)
      }
    } else {
      filterFunc = (message) => {
        return belongToArticle(articleId, message)
      }
    }
    return super.getList(this.messages, filterFunc)
  }
  getBatchDatas(articleId, offset, size, func) {
    const articles = this.getList(articleId, func)
    return super.getBatchDatas({ datas: articles, offset, size })
  }
  // 檢查傳入數據(data)是否必要欄位(requiredFields)都有定義
  validate(data) {
    return super.validate(data, this.requiredFields)
  }
}

const Message = new MessageModel()
module.exports = Message
