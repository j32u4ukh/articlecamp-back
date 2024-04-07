const baseX = require('base-x')
const path = require('path')

// 創建 BASE62 編碼器
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const textEncoder = new TextEncoder()
const base62Encoder = baseX(BASE62)

module.exports = {
  getTimestamp() {
    return Math.floor(new Date().getTime() / 1000)
  },
  toNumeric(input) {
    if (input === null || input === '' || isNaN(input)) {
      return [NaN, false]
    }
    const val = Number(input)
    return [val, !isNaN(val)]
  },
  getImageFolder() {
    const root = path.resolve(__dirname, '..')
    return path.join(root, 'public/images')
  },
  toBase62(data) {
    data = textEncoder.encode(data)
    return base62Encoder.encode(data)
  },
}
