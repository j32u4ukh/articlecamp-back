// 引用 Express 與 Express 路由器
const express = require("express");
const router = express.Router();

// 準備引入路由模組
const articles = require("./articles");
router.use("/articles", articles);

const v1 = require("./v1");
router.use("/v1", v1);

// 匯出路由器
module.exports = router;
