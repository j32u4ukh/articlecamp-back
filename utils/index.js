const path = require('path')
const baseX = require('base-x')

// 創建 BASE62 編碼器
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const textEncoder = new TextEncoder()
const base62Encoder = baseX(BASE62)

// 定義一個函數，用於深拷貝物件或陣列
function _deepCopy(obj) {
  // 如果是原始資料類型，直接返回
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  // 根據原始資料的類型創建新的物件或陣列
  const clone = Array.isArray(obj) ? [] : {}

  // 遞迴地拷貝每個屬性或元素
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = _deepCopy(obj[key])
    }
  }
  return clone
}

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
  getRoot() {
    return path.resolve(__dirname, '..')
  },
  toBase62(data) {
    data = textEncoder.encode(data)
    return base62Encoder.encode(data)
  },
  selectByOffsetSize(datas, offset = 0, size = 10) {
    try {
      offset = Number(offset)
      size = Number(size)
    } catch {
      offset = 0
      size = 10
    }
    const total = datas.length
    if (offset > total) {
      offset = total
    }
    let len = offset + size
    len = len > total ? total : len
    const results = {
      total: Number(total),
      offset: Number(offset),
      size: Number(len - offset),
      datas: datas.slice(offset, len),
    }
    return results
  },
  // 定義一個函數，用於深拷貝物件或陣列
  deepCopy(obj) {
    return _deepCopy(obj)
  },
}
