// 创建路由对象，并编写路由，然后导出
const express = require("express")
const router = express.Router()
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const path = require('path');
const { createDoc } = require('apidoc');


const formatTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};


router.post("/generate",  async (req, res)=> {
    try {
        // Get the JSON data from the request body
        const jsonData = req.body.project;
        const apiData = req.body.apiDoc;
        console.log(jsonData)
        // Validate if jsonData is a valid JSON object
        if (typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON data' });
        }

        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Generate a timestamp in the format: YYYYMMDDHHmmssSSS
        const timestamp = formatTimestamp()

        // Generate a short UUID (4 characters)
        const shortUUID = uuidv4().substring(0, 4);

        // Combine timestamp and short UUID for the folder name
        const folderName = `${timestamp}-${shortUUID}`;

        // Specify the path where you want to save the file
        const filePath = `public/apidoc/${folderName}/apidoc.json`;

        // Create the folder if it doesn't exist
        await fs.mkdir(`public/apidoc/${folderName}/src`, { recursive: true });

        // Write the JSON data to the file
        await fs.writeFile(filePath, jsonString);


        // 生成注释文档
        const apidocTest = `
/**
 * @apiVersion ${apiData.apiVersion}
 * @api {${apiData.method}} ${apiData.path} ${apiData.title}
 * @apiGroup ${apiData.group}
 * @apiDescription ${apiData.description}
${generateHeaders(apiData.headers)}
${generateParam(apiData.queryParams)}
${generateRequestBody(apiData.param)}
 * @apiParamExample {json} request-example
 * ${JSON.stringify(apiData.paramExample, null, 2)}
${generateExamples(apiData.examples)}
${generateSuccess(apiData.success)}
${generateSuccessExample(apiData.successExample)}
${generateError(apiData.error)}
${generateErrorExample(apiData.errorExample)}
 */`;

// 打印生成的注释文档
        console.log(apidocTest);

        await fs.writeFile(`public/apidoc/${folderName}/src/api.js`, apidocTest);


        await new Promise(resolve => setTimeout(() => {
            console.log("开始生成在线文档成功");
            createDoc({
                src: path.resolve(__dirname, '..' ,'public', 'apidoc', folderName, 'src'),
                dest: path.resolve(__dirname, '..', 'public', 'apidoc', folderName),
                config: path.resolve(__dirname, '..', 'public', 'apidoc', folderName, 'apidoc.json'),
                dryRun: false,
                silent: false,
            });
            console.log("生成在线文档成功", folderName);
            resolve();
        }, 1000));
        // if (typeof doc !== 'boolean') {
        //     console.log(doc.data); // the parsed api documentation object
        //     console.log(doc.project); // the project information
        // }

        res.status(200).json({ success: '后台正在生成，请稍后访问链接 ' + `${window.posttiger.appUrl}/apidoc/${folderName}  ` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})



// 辅助函数：生成 requestBody 部分
function generateRequestBody(queryParam) {
    if (!queryParam || queryParam.length === 0) {
        return '';
    }

    const paramLines = queryParam.map(param => {
        return ` * @apiParam {${param.type}} ${param.name} ${param.description}`;
    });

    return `${paramLines.join('\n')}\n`;
}



// 辅助函数：生成 Param 部分
function generateParam(queryParam) {
    if (!queryParam || queryParam.length === 0) {
        return '';
    }

    const paramLines = queryParam.map(param => {
        const defaultValue = param.defaultValue ? `=${param.defaultValue}` : '';
        return ` * @apiQuery {${param.type}} ${param.name}${defaultValue} ${param.description}`;
    });

    return `${paramLines.join('\n')}\n`;
}

// 辅助函数：生成 Headers 部分
function generateHeaders(headers) {
    if (!headers || headers.length === 0) {
        return '';
    }

    const headerLines = headers.map(header => ` * @apiHeader {${header.type}} ${header.name} ${header.description.replaceAll('/*', '')}`);
    const defaultValueLines = headers
        .filter(header => header.defaultValue)
        .map(header => ` * @apiHeaderExample {${header.type}} ${header.name}-Example\n *     "${header.name}: ${header.description.replaceAll('/*', '')}"`);

    return `${headerLines.join('\n')}\n${defaultValueLines.join('\n')}\n`;
}

// 辅助函数：生成 Error 部分
function generateError(errors) {
    if (!errors || errors.length === 0) {
        return '';
    }

    const errorLines = errors.map(error => ` * @apiError {${error.type}} ${error.name} ${error.description}`);
    const errorExampleLines = errors
        .filter(error => error.example)
        .map(error => ` * @apiErrorExample  {${error.type}} ${error.name}-example\n * ${JSON.stringify(error.example, null, 2)}`);

    return `${errorLines.join('\n')}\n${errorExampleLines.join('\n')}\n`;
}

// 辅助函数：生成 Examples 部分
function generateExamples(examples) {
    if (!examples || examples.length === 0) {
        return '';
    }

    const exampleLines = examples.map(example => {
        const contentLines = example.content.split('\n').map(line => ` * ${line}`);
        return ` * @apiExample {${example.type}} ${example.name}\n${contentLines.join('\n')}`;
    });

    return `${exampleLines.join('\n')}\n`;
}

// 辅助函数：生成 Success 部分
function generateSuccess(success) {
    if (!success || success.length === 0) {
        return '';
    }

    const successLines = success.map(item => ` * @apiSuccess {${item.type}} ${item.name} ${item.description}`);
    const successExampleLines = success
        .filter(item => item.example)
        .map(item => ` * @apiSuccessExample  {${item.type}} ${item.name}-example\n * ${JSON.stringify(item.example, null, 2)}`);

    return `${successLines.join('\n')}\n${successExampleLines.join('\n')}\n`;
}

// 辅助函数：生成 SuccessExample 部分
function generateSuccessExample(successExample) {
    if (!successExample) {
        return '';
    }

    return `
 * @apiSuccessExample ${successExample.name}
${JSON.stringify(successExample.content, null, 2)}
`;
}

// 辅助函数：生成 ErrorExample 部分
function generateErrorExample(errorExample) {
    if (!errorExample) {
        return '';
    }

    return `
 * @apiErrorExample ${errorExample.name}
${errorExample.content.split('\n').map(line => ` * ${line}`).join('\n')}
`;
}


module.exports = router