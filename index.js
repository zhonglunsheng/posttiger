// const express = require("express");
// const proxy = require("http-proxy-middleware").createProxyMiddleware;
// const request = require("request");
// // 执行npm install body-parser之后再引入
// const bodyParser = require("body-parser");
// const app = express();
// const cors = require("cors");
// app.use(cors());

// // app.use("/proxy", (req, res, next) => {
// //   const dynamicTarget = req.headers["x-dynamic-target"] || "http://localhost";
// //   req.headers.host = dynamicTarget
// //     .replace("https://", "")
// //     .replace("http://", "");
// //   req.headers.origin = dynamicTarget;
// //   req.headers.referer = dynamicTarget;
// //   console.log(req.headers);
// //   req.baseUrl = "/";
// //   req.originalUrl = req.originalUrl.replace(/^\/proxy/, "");
// //   req._parsedUrl.pathname = req._parsedUrl.pathname.replace(/^\/proxy/, "");
// //   req._parsedUrl.path = req._parsedUrl.pathname.replace(/^\/proxy/, "");
// //   req._parsedUrl.href = req._parsedUrl.pathname.replace(/^\/proxy/, "");
// //   req._parsedUrl._raw = req._parsedUrl.pathname.replace(/^\/proxy/, "");
// //   // console.log(req.baseUrl, req.originalUrl, req._parsedUrl);
// //   return proxy({
// //     target: dynamicTarget,
// //     changeOrigin: true,
// //     secure: false, // 验证SSL证书。应用于https
// //     onProxyRes: (proxyRes, req, res) => {
// //       // Access and modify the response headers here
// //       // For example, you can log the headers to the console
// //       console.log("Proxy response headers:", proxyRes);

// //       // console.log(res);
// //       // You can also modify the headers if needed
// //       // For example, setting a new header
// //       proxyRes.headers["x-custom-header"] = "modified-value";
// //       proxyRes.headers["Access-Control-Expose-Headers"] = "*";
// //     },
// //   })(req, res, next);
// // });
// app.use(bodyParser.json());

// app.use("/proxy", (req, res, next) => {
//   const dynamicTarget = req.headers["x-dynamic-target"] || "http://localhost";
//   const requestData = req.body;
//   console.log(requestData);
//   req.body = requestData["requestBody"];
//   req.headers = requestData["headers"];
//   req.headers.host = dynamicTarget
//     .replace("https://", "")
//     .replace("http://", "");
//   req.headers.origin = dynamicTarget;
//   req.headers.referer = dynamicTarget;
//   console.log(req.headers);
//   req.baseUrl = "/";
//   req.originalUrl = req.originalUrl.replace(/^\/proxy/, "");
//   req._parsedUrl.pathname = req._parsedUrl.pathname.replace(/^\/proxy/, "");
//   req._parsedUrl.path = req._parsedUrl.pathname.replace(/^\/proxy/, "");
//   req._parsedUrl.href = req._parsedUrl.pathname.replace(/^\/proxy/, "");
//   req._parsedUrl._raw = req._parsedUrl.pathname.replace(/^\/proxy/, "");

//   console.log(req);
//   req.pipe(request(dynamicTarget)).pipe(res);
// });

// app.use("/api/test2", (req, res, next) => {
//   res.json(112);
// });

// app.use(express.static("public"));

// // Start the Express app
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/proxy", async (req, res) => {
  try {
    const { requestBody, headers, method, url, queryParams } = req.body;

    // 构建代理请求的配置
    const proxyConfig = {
      method: method || "GET",
      url: url,
      params: queryParams,
      data: requestBody,
      headers: headers,
    };

    console.log(proxyConfig);
    // 发起代理请求
    const response = await axios(proxyConfig);

    // 设置 Access-Control-Expose-Headers 响应头
    res.set("Access-Control-Expose-Headers", "*");

    // 返回代理请求的响应
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
