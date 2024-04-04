const { User: UserModel } = require('../_models/index')
const { ErrorCode } = require('../utils/codes')
const multer = require('multer')
const { getImageFolder, toBase62 } = require('../utils/index')
const upload = multer({ dest: 'public/images/' })
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

// 實際使用中應從 config 讀取，且不應上傳 config
const secretKey = 'ArticleCamp'

class UserService {
  getAll() {
    return new Promise((resolve, reject) => {
      resolve(UserModel.getList())
    })
  }
  // concealing: 是否隱藏資訊
  getList(userId, concealing, filterFunc) {
    return new Promise((resolve, reject) => {
      let users = UserModel.getList((user) => {
        if (filterFunc) {
          let cond = filterFunc(user)
          if (cond === false) {
            return false
          }
        }
        return user.id !== userId
      })
      if (concealing) {
        users = users.map((user) => {
          delete user.password
          return user
        })
      }
      resolve(users)
    })
  }
  // concealing: 是否隱藏資訊
  get({ id, concealing = true }) {
    return new Promise((resolve, reject) => {
      let { index, data } = UserModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的用戶`,
        })
      }
      if (concealing) {
        delete data.password
        delete data.createAt
      }
      resolve(data)
    })
  }
  login({ email, password }) {
    return new Promise(async (resolve, reject) => {
      const user = UserModel.getByEmail(email)
      if (user === undefined) {
        return reject({
          code: ErrorCode.NotFound,
          msg: `找不到此信箱`,
        })
      }
      if (password !== user.password) {
        return reject({
          code: ErrorCode.Unauthorized,
          msg: `密碼不正確`,
        })
      }

      delete user.password
      delete user.image
      delete user.createAt
      resolve(user)
    })
  }
  add(user) {
    return new Promise((resolve, reject) => {
      const isValid = UserModel.validate(user, UserModel.requiredFields)
      if (!isValid) {
        return reject({
          code: ErrorCode.MissingParameters,
          msg: `缺少必要參數, requiredFields: ${JSON.stringify(
            UserModel.requiredFields
          )}`,
        })
      }
      const temp = UserModel.getByEmail(user.email)
      if (temp !== undefined) {
        return reject({
          code: ErrorCode.Conflict,
          msg: `此信箱(${user.email})已註冊過`,
        })
      }
      UserModel.add(user)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          console.error(error)
          reject({
            code: ErrorCode.WriteError,
            msg: '寫入數據時發生錯誤',
          })
        })
    })
  }
  // 根據 id 更新用戶數據
  update({ id, user }) {
    return new Promise((resolve, reject) => {
      const { index, data } = UserModel.get(id)
      if (index === -1) {
        reject({
          code: ErrorCode.NotFound,
          msg: `沒有 id 為 ${id} 的用戶`,
        })
        return
      }
      const isValid = UserModel.validate(user, UserModel.requiredFields)
      if (!isValid) {
        reject({
          code: ErrorCode.MissingParameters,
          msg: `缺少必要參數, requiredFields: ${JSON.stringify(
            UserModel.requiredFields
          )}`,
        })
        return
      }
      user.id = id
      user.createAt = data.createAt
      UserModel.update(index, user)
        .then((result) => {
          resolve(result)
        })
        .catch((err) => {
          console.error(err)
          reject({
            code: ErrorCode.UpdateError,
            msg: '更新數據時發生錯誤',
          })
        })
    })
  }
  // TODO: 每個用戶有自己的資料夾，當中則是專屬各個使用者的圖片資源
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
  // 生成 JWT
  generateToken(user) {
    return new Promise((resolve, reject) => {
      jwt.sign({ user }, secretKey, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          reject({
            code: ErrorCode.ServerInternalError,
            msg: '生成 jwt 時發生錯誤',
          })
        } else {
          resolve(token)
        }
      })
    })
  }
  verifyToken(req) {
    return new Promise((resolve, reject) => {
      // 獲取 Authorization 頭
      const bearerHeader = req.headers['authorization']

      // 檢查是否有 token
      if (bearerHeader === undefined || bearerHeader === '') {
        return reject({
          code: ErrorCode.MissingParameters,
          msg: 'Header 中缺少 jwt',
        })
      } else {
        // 分割 token
        const bearer = bearerHeader.split(' ')
        const token = bearer[1]

        // 驗證 token
        jwt.verify(token, secretKey, (err, authData) => {
          if (err) {
            return reject({
              code: ErrorCode.Forbidden,
              msg: 'jwt 驗證失敗',
            })
          } else {
            return resolve(authData)
          }
        })
      }
    })
  }
}

const User = new UserService()
module.exports = { User, upload }
