const { ErrorCode } = require('../utils/codes.js')
const db = require('../models')
const { Op } = require('sequelize')
const User = db.user
const Follow = db.follow

class FollowService {
  setRelationShip({ userId, followTo, follow }) {
    return new Promise(async (resolve, reject) => {
      try {
        // 檢查用戶 userId & followTo 是否存在
        const users = await User.findAll({
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: [userId, followTo],
            },
          },
          raw: true,
        })
        const nUser = users.length
        switch (nUser) {
          case 0:
            return reject({
              code: ErrorCode.InvalidParameters,
              msg: `用戶(${userId} & ${followTo}) 皆不存在`,
            })
          case 1:
            let notFound
            if (users[0].id === userId) {
              notFound = followTo
            } else {
              notFound = userId
            }
            return reject({
              code: ErrorCode.InvalidParameters,
              msg: `用戶(${notFound}) 不存在`,
            })
        }

        // 有 userId & followTo 的數據則修改狀態，沒有的話則新增數據
        const relationship = await Follow.findOne({
          where: {
            userId,
            followTo,
          },
          raw: true,
        })

        if (relationship) {
          await Follow.update(
            { status: follow },
            {
              where: {
                id: relationship.id,
              },
            }
          )
        } else {
          await Follow.create({
            userId,
            followTo,
            status: follow,
          })
        }

        return resolve({
          msg: 'OK',
        })
      } catch (error) {
        if (error.code === undefined || error.msg === undefined) {
          console.log(`更新關係數據時發生錯誤, error: ${error}`)
          error = {
            code: ErrorCode.UpdateError,
            msg: '更新關係數據時發生錯誤',
          }
        }
        return reject(error)
      }
    })
  }
}

const service = new FollowService()
module.exports = service
