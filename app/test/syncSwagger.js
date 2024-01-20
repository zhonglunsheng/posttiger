const { parseSchema }  = require('./swaggerUtil');

const SwaggerParser = require("@apidevtools/swagger-parser");


// console.log("Sync Swagger", SwaggerParser)


const test = async ()  => {
    // let api = await SwaggerParser.validate("my-api.yaml");
    let api = await SwaggerParser.validate("Elasticsearch API  copy.swagger.json");
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);

    // console.log(JSON.stringify(api, null, 2))

    let result = []
    for (let apiItem in api.paths) {
        let apiInfo = {}
        apiInfo['url'] = apiItem

        for (let method in api.paths[apiItem]) {
            let apiInfoCopy = JSON.parse(JSON.stringify(apiInfo))

            apiInfoCopy['method'] = method
            apiInfoCopy['label'] = api.paths[apiItem][method].summary
            let parameters = api.paths[apiItem][method].parameters;
            if (parameters && parameters.length && !parameters[0]['schema']) {

                let jsonSchema = {}
                if (parameters && parameters.length) {
                    for (let pItem of parameters) {
                        jsonSchema[pItem.name] = pItem
                    }
                    apiInfoCopy['queryParams'] = parseSchema({
                        type: 'object',
                        properties: jsonSchema
                    })
                }else {
                    apiInfoCopy['queryParams'] = ''
                }
                apiInfoCopy['requestBody'] = ''
            }else {
                if (parameters && parameters.length) {
                    apiInfoCopy['requestBody'] = parseSchema(parameters[0]['schema'])
                }else {
                    apiInfoCopy['requestBody'] = ''
                }
                apiInfoCopy['queryParams'] = ''
            }
            apiInfoCopy['headers'] = ''
            result.push(apiInfoCopy)
        }
    }
    console.log(result)
}

test()


result = [
    {
        url: '',
        method: 'post',
        label: '',
        queryParams: 'summary',
        requestBody: 'parameters',
        headers: '',
    }
]