const apiDocRouter = require("./apiDoc")

const routes = (app) => {
    app.use("/api/api-doc", apiDocRouter)
}

module.exports = routes