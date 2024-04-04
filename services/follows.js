const { Follow: FollowModel } = require('../_models/index')
const { ErrorCode } = require('../utils/codes.js')
const User = require('../_models/users.js')

class FollowService {  
  // TODO: 串接資料庫
  getList(userId) {
    return new Promise((resolve, reject) => {
      resolve(FollowModel.getList(userId))
    })
  }
  // TODO: 串接資料庫
  setRelationShip({ userId, followTo, follow }) {
    return new Promise((resolve, reject) => {
      if (!this.isUserExists(userId)) {
        return reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${userId} 的用戶`,
        })
      }

      if (!this.isUserExists(followTo)) {
        return reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${followTo} 的用戶`,
        })
      }

      let promise
      if (follow) {
        promise = this.add({ userId, followTo })
      } else {
        promise = this.remove({ userId, followTo })
      }

      promise
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  // TODO: 串接資料庫
  add({ userId, followTo }) {
    return new Promise((resolve, reject) => {
      const index = FollowModel.getRelationship(userId, followTo)

      // 若已經是追隨關係
      if (index !== -1) {
        return reject({
          code: ErrorCode.Conflict,
          msg: '已經是追隨關係',
        })
      }

      FollowModel.add({ userId, followTo })
        .then(() => {
          return resolve({
            code: ErrorCode.Ok,
          })
        })
        .catch((error) => {
          console.error(error)
          return reject({
            code: ErrorCode.WriteError,
            msg: '寫入數據時發生錯誤',
          })
        })
    })
  }
  // TODO: 串接資料庫
  remove({ userId, followTo }) {
    return new Promise((resolve, reject) => {
      // 取得追隨關係數據
      const index = FollowModel.getRelationship(userId, followTo)

      // 若不是追隨關係
      if (index === -1) {
        return reject({
          code: ErrorCode.NotRelationship,
          msg: '不是追隨關係',
        })
      }

      // 移除追隨關係
      FollowModel.delete(index)
        .then(() => {
          return resolve({
            code: ErrorCode.Ok,
          })
        })
        .catch((error) => {
          console.error(error)
          return reject({
            code: ErrorCode.DeleteError,
            msg: '刪除數據時發生錯誤',
          })
        })
    })
  }
  // TODO: 串接資料庫
  // 檢查用戶是否都存在
  isUserExists(userId) {
    const user = User.get(userId)
    return user.index !== -1
  }
}

const Follow = new FollowService()
module.exports = Follow
