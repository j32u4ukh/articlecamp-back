class Service {
  getCount(userId, filter) {
    return new Promise((resolve, reject) => {})
  }
  getList(userId, filter) {
    return new Promise((resolve, reject) => {})
  }
  getBatchDatas(userId, offset, size) {
    return new Promise(async (resolve, reject) => {
      try {
        offset = Number(offset)
        let limit = Number(size)
        offset = offset === undefined ? 0 : offset
        limit = limit === undefined ? 10 : limit
        const filter = { offset, limit, summary: true }
        const count = await this.getCount(userId, filter)
        const datas = await this.getList(userId, filter)
        const results = {
          total: count,
          offset: offset,
          size: datas.length,
          datas: datas,
        }
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = Service
