const { Router } = require('express')
const { User, Follow, UserFollow } = require('../services')
const { upload } = require('../services/users')
const { ReturnCode, ErrorCode } = require('../utils/codes')
const { getImageFolder } = require('../utils')
const fs = require('fs')
const path = require('path')

// 建立路由物件
const router = Router()

router.get('/', function (req, res) {
  const token = req.headers.token
  if (token === undefined) {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 token',
    })
  }
  const userId = Number(token)
  const offset = req.query.offset
  const size = req.query.size
  UserFollow.getBatchDatas(userId, offset, size).then((results) => {
    res.json(results)
  })
})

router.post('/', function (req, res) {
  const token = req.headers.token
  if (token === undefined) {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 token',
    })
  }
  const BODY = req.body
  const targetId = BODY.userId
  if (targetId === undefined || targetId === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.ParamError,
      msg: 'userId 為必要參數',
    })
  }
  const follow = BODY.follow
  if (follow === undefined || follow === '') {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.ParamError,
      msg: 'follow 為必要參數',
    })
  }
  // 當前用戶的 id
  const userId = Number(token)
  // 欲追隨用戶的 id
  const followTo = Number(targetId)
  Follow.setRelationShip({ userId, followTo, follow })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

router.get('/images/:userId/:fileName', (req, res) => {
  const imageFolder = getImageFolder()
  const userId = req.params.userId
  const fileName = req.params.fileName
  const filePath = path.join(imageFolder, userId, fileName)

  // 檢查檔案是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 返回 404 圖片
      res.sendFile(path.join(imageFolder, 'icons8-not-found-100.png'))
    } else {
      // 發送圖片文件
      res.sendFile(filePath)
    }
  })
})

router.get('/profile', (req, res) => {
  const token = req.headers.token
  if (token === undefined) {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 token',
    })
  }
  const userId = Number(token)
  User.get({
    id: userId,
  })
    .then((result) => {
      res.json(result)
    })
    .catch((error) => {
      res.status(ErrorCode.getReturnCode(error.code)).json(error)
    })
})

// 設定的 image 表示提交的表單中，圖片上傳的欄位名稱是 image (要配合表單傳送過來時，檔案對應的 name)
router.patch('/profile', upload.single('image'), async (req, res) => {
  const token = req.headers.token
  if (token === undefined) {
    return res.status(ReturnCode.BadRequest).json({
      code: ErrorCode.MissingParameters,
      msg: '缺少必要參數 token',
    })
  }
  try {
    const userId = Number(token)
    const user = await User.get({ id: userId, concealing: false })
    const BODY = req.body
    const { file } = req
    user.name = BODY.name ?? user.name
    user.email = BODY.email ?? user.email

    if (file) {
      const image = await User.uploadImage(userId, file.path)
      user.image = image
    }

    const result = await User.update({ id: userId, user })
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(ErrorCode.getReturnCode(error.code)).json(error)
  }
})

module.exports = router