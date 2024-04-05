const { User } = require('./users')
const { ErrorCode } = require('../utils/codes')
const jwt = require('jsonwebtoken')

// 實際使用中應從 config 讀取，且不應上傳 config
const secretKey = 'ArticleCamp'

class AuthService {
  constructor() {
    this.tokens = {}
  }
  login({ email, password }) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.login({ email, password })
        const token = await this.generateToken(user)
        this.tokens[user.id] = token
        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  }
  getToken(userId) {
    return this.tokens[userId]
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
            /*
            authData: {
                "user": {
                    "id": 1,
                    "name": "Henry",
                    "email": "henry@articlecamp.com",
                    "updateAt": 1705819929
                },
                "iat": 1711380760,
                "exp": 1711384360
            }
            */
            return resolve(authData)
          }
        })
      }
    })
  }
}

const Auth = new AuthService()
module.exports = Auth
