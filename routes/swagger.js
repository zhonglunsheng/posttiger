// 创建路由对象，并编写路由，然后导出
const express = require("express");
const router = express.Router();
const { swagger2ApiJson } = require("../utils/swaggerUtil");
const Swagger2Apipost = require("swagger2apipost");

router.post("/sync/url", async (req, res) => {
  try {
    const swaggerUrl = req.body.swaggerUrl;
    console.log(swaggerUrl);
    const converter = new Swagger2Apipost();
    const convertResult = await converter.convert(swaggerUrl);
    let apis = swagger2ApiJson(convertResult);
    res.status(200).json({
      apis: apis,
      project: convertResult.data?.project?.name || "",
      server: convertResult.data?.env?.[0]?.pre_url || "",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
