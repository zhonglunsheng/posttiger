// 发现没，我这里 export 是一个方法，app就是方法入参，app是在index.js 中传入的
module.exports = app => {
    // 路由
    require("./routes")(app)

    // .... 可继续添加其他中间件
}