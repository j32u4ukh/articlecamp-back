class Service {
  getCount(id, filter) {
    return new Promise((resolve, reject) => {})
  }
  getList(id, filter) {
    return new Promise((resolve, reject) => {})
  }
  getBatchDatas(id, offset, limit, filter = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        offset = Number(offset)
        limit = Number(limit)
        filter.offset = isNaN(offset) ? 0 : offset
        filter.limit = isNaN(limit) ? 10 : limit
        const count = await this.getCount(id, filter)
        const datas = await this.getList(id, filter)
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
