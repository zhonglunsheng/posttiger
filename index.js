const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const { backupRouteHandler, cleanupExpiredBackups, syncDataRouterHandler } = require('./app/backup');
const { curl2JsonRouteHandler } = require('./app/curl');
const {uploadImageRouteHandler} = require("./app/upload");
const {posttiger} = require('./common/db')
const app = express();
app.use(cors());
// 引入文件上传模块express-fileupload
var fileUpload = require('express-fileupload');
const path = require("path");
// 配置文件上传模块
app.use(fileUpload());

const port = 3000;

app.use(bodyParser.json({limit: '1000mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


// 注册中间件
require("./middlewareConfig")(app)


app.post("/proxy", async (req, res) => {
  try {
    const { requestBody, headers, method, url, queryParams } = req.body;
    console.log(`proxy ${url}`)
    // 构建代理请求的配置
    const proxyConfig = {
      method: method || "GET",
      url: url,
      params: queryParams,
      data: requestBody,
      headers: headers,
    };
    // 发起代理请求
    const response = await axios(proxyConfig);
    for (let item in
        response.headers) {
      res.set(item, response.headers[item]);
    }
    // 设置 Access-Control-Expose-Headers 响应头
    res.set("Access-Control-Expose-Headers", "*");
    res.set("Access-Control-Allow-Origin", "*");
    // 返回代理请求的响应
    res.status(response.status).json(JSON.parse(JSON.stringify(response.data)))
  } catch (error) {
    try {
      for (let item in
          error.response.headers) {
        res.set(item, error.response.headers[item]);
      }
      res.set("Access-Control-Expose-Headers", "*");
      res.set("Access-Control-Allow-Origin", "*");
      res.status(error.response.status).json(error.response.data);
    }catch (e) {
      res.status(502).send("接口超时" + error);
    }
  }
});


// 数据备份
// 备份数据接口
app.post('/backup', backupRouteHandler);
app.post('/curlParse', curl2JsonRouteHandler);
app.post('/upload/images', uploadImageRouteHandler);
app.get('/syncData', syncDataRouterHandler);

app.get('/sync/api/project/get', (req, res) => {
  console.log("hello")
  res.status(200).json({
    "errcode": 0,
    "errmsg": "成功！",
    "data": {
      "switch_notice": true,
      "is_mock_open": false,
      "strice": false,
      "is_json5": false,
      "_id": 217491,
      "name": "test",
      "basepath": "",
      "project_type": "private",
      "uid": 176006,
      "group_id": 204345,
      "icon": "code-o",
      "color": "green",
      "add_time": 1703513150,
      "up_time": 1703514605,
      "env": [
        {
          "header": [],
          "global": [],
          "_id": "65898c3e3097080009aeb1b9",
          "name": "local",
          "domain": "http://127.0.0.1"
        }
      ],
      "tag": [],
      "cat": [

      ],
      "role": "owner"
    }
  });
});


app.get('/sync/api/interface/save', (req, res) => {
  console.log(req.body)
  res.status(200)
})

app.post('/sync/api/interface/save', (req, res) => {
  console.log(req.body)
  res.status(200).json({
    "errcode": 0,
    "errmsg": "成功！",
    "data": {
      "ok": 1,
      "nModified": 1,
      "n": 1
    }
  })
})

app.post('/sync/api/interface/add_cat', (req, res) => {
  console.log(req.body)
  res.status(200).send({
    "errcode": 0,
    "errmsg": "成功！",
    "data": {
      "index": 0,
      "name": "登录接口类",
      "project_id": 217491,
      "desc": "登录接口类",
      "uid": 176006,
      "add_time": 1703515611,
      "up_time": 1703515611,
      "_id": 1661576,
      "__v": 0
    }
  })
})


// 清理过期备份数据
setInterval(cleanupExpiredBackups, 60 * 60 * 1000); // 每小时清理一次


app.get('/insert/data', (req, res) => {
  posttiger.db("test").insert({name: 123})
  res.status(200).json(posttiger.db("test").collection.find())
})

app.get('/bigdata', (req, res) => {
  let resData = []
  for (let i = 0; i < 1000000; i++) {
    resData.push({
      name: i
    })
  }
  res.status(200).json(resData)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
