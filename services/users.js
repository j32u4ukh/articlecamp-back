const { ErrorCode } = require('../utils/codes')
const multer = require('multer')
const { getImageFolder, toBase62 } = require('../utils/index')
const upload = multer({ dest: 'public/images/' })
const fs = require('fs')
const path = require('path')
const db = require('../models')
const { Op } = require('sequelize')
const User = db.user

class UserService {
  getAll() {
    return new Promise((resolve, reject) => {
      User.findAll({
        attributes: ['id', 'name', 'email', 'updatedAt'],
        // where: { userId },
        // offset: (page - 1) * limit,
        // limit,
        raw: true,
      })
        .then((users) => {
          resolve(users)
        })
        .catch((error) => {
          console.log(`讀取用戶列表時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.ReadError,
            msg: `讀取用戶列表時發生錯誤`,
          })
        })
    })
  }
  // concealing: 是否隱藏資訊
  getOthers({ userId, concealing }) {
    return new Promise((resolve, reject) => {
      let attributes = ['id', 'name', 'email', 'updatedAt']
      if (!concealing) {
        attributes.push('password')
        attributes.push('createdAt')
      }
      User.findAll({
        attributes: attributes,
        where: {
          id: {
            [Op.ne]: userId,
          },
        },
        raw: true,
      })
        .then((users) => {
          resolve(users)
        })
        .catch((error) => {
          console.log(`讀取用戶列表時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.ReadError,
            msg: `讀取用戶列表時發生錯誤`,
          })
        })
    })
  }
  // concealing: 是否隱藏資訊
  get({ id, concealing = true }) {
    return new Promise((resolve, reject) => {
      let attributes = ['id', 'name', 'email', 'updatedAt']
      if (!concealing) {
        attributes.push('password')
        attributes.push('createdAt')
      }
      User.findByPk(id, {
        attributes: attributes,
        raw: true,
      })
        .then((user) => {
          if (user === null) {
            return reject({
              code: ErrorCode.NotFound,
              msg: `沒有 id 為 ${id} 的用戶`,
            })
          }
          return resolve(user)
        })
        .catch((error) => {
          console.log(`讀取用戶數據時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.ReadError,
            msg: `讀取用戶數據時發生錯誤`,
          })
        })
    })
  }
  // 用戶登入，驗證成功後返回 JWT
  login({ email, password }) {
    return new Promise((resolve, reject) => {
      User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: { email },
        raw: true,
      })
        .then((user) => {
          if (!user) {
            return reject({
              code: ErrorCode.NotFound,
              msg: `找不到 email 為 ${email} 的用戶`,
            })
          }
          if (password !== user.password) {
            return reject({
              code: ErrorCode.Unauthorized,
              msg: `密碼不正確`,
            })
          }
          delete user.password
          return resolve(user)
        })
        .catch((error) => {
          console.log(`讀取用戶數據時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.ReadError,
            msg: `讀取用戶數據時發生錯誤`,
          })
        })
    })
  }
  // 新增用戶
  add(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const count = await User.count({
          where: { email: user.email },
        })
        if (count > 0) {
          return reject({
            code: ErrorCode.Conflict,
            msg: `此信箱(${user.email})已註冊過`,
          })
        }
        const result = User.create({
          name: user.name,
          email: user.email,
          password: user.password,
        })
        resolve(result)
      } catch (error) {
        console.error(error)
        return reject({
          code: ErrorCode.WriteError,
          msg: '新增玩家時發生錯誤',
        })
      }
    })
  }
  // 根據 id 更新用戶數據
  update({ id, user }) {
    return new Promise((resolve, reject) => {
      User.update(user, {
        where: {
          id,
        },
      })
        .then(() => {
          return resolve({
            msg: 'OK',
          })
        })
        .catch((error) => {
          console.log(`讀取用戶數據時發生錯誤, error: ${error}`)
          return reject({
            code: ErrorCode.UpdateError,
            msg: `更新用戶數據時發生錯誤`,
          })
        })
    })
  }
  // 每個用戶有自己的資料夾，當中則是專屬各個使用者的圖片資源
  // 經過 upload.single() 這個 middleware 後，檔案的部分就會被放到 req.file 屬性裡，而其他非檔案的欄位仍然會保留在 req.body 屬性裡
  uploadImage(userId, image) {
    return new Promise((resolve, reject) => {
      // 從檔案路徑讀檔
      fs.readFile(image, (err, data) => {
        if (err) {
          console.error(err)
          return reject({
            code: ErrorCode.ReadError,
            msg: '讀取檔案時發生錯誤',
          })
        }

        const folder = path.join(getImageFolder(), userId.toString())

        // 確認資料夾是否存在，若不存在則建立資料夾
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true })
        }

        const timestamp = Date.now()
        const prefix = Math.floor(Math.random() * 10000)
          .toString()
          .padEnd(5, '0')
        const suffix = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(5, '0')
        const fileName = path.join(
          userId.toString(),
          `${toBase62(`${prefix}${timestamp}${suffix}`)}.png`
        )
        const filePath = path.join(getImageFolder(), fileName)
        console.log(`filePath: ${filePath}`)

        fs.writeFile(filePath, data, () => {
          // 檔案寫入成功後，刪除暫時的檔案
          fs.unlink(image, (err) => {
            if (err) {
              console.error(err)
            }

            // 文件删除成功
            resolve(fileName)
          })
        })
      })
    })
  }
}

const Service = new UserService()
module.exports = { User: Service, upload }
