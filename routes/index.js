const apiDocRouter = require("./apiDoc")
const swaggerRouter = require("./swagger")

const routes = (app) => {
    app.use("/api/api-doc", apiDocRouter)
    app.use("/api/swagger", swaggerRouter)
}

module.exports = routes