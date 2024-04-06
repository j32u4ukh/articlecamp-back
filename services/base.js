class Service {
  getCount(userId, filter) {
    return new Promise((resolve, reject) => {})
  }
  getList(userId, filter) {
    return new Promise((resolve, reject) => {})
  }
  getBatchDatas(userId, offset, limit, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        offset = Number(offset)
        limit = Number(limit)
        filter.offset = offset === undefined ? 0 : offset
        filter.limit = limit === undefined ? 10 : limit
        const count = await this.getCount(userId, filter)
        const datas = await this.getList(userId, filter)
        const results = {
          total: count,
          offset: filter.offset,
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
