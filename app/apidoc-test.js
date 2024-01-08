const fs = require('fs');

// 读取 JSON 文件
const jsonData = fs.readFileSync('apiTemplate.json', 'utf-8');
const apiData = JSON.parse(jsonData);

// 生成注释文档
const apidocTest = `
/**
 * @apiVersion ${apiData.apiVersion}
 * @api {${apiData.method}} ${apiData.path} ${apiData.title}
 * @apiGroup ${apiData.group}
 * @apiDescription ${apiData.description}
${generateHeaders(apiData.headers)}
 * @apiParam {${apiData.param[0].type}} ${apiData.param[0].name} ${apiData.param[0].description}
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

// 辅助函数：生成 Headers 部分
function generateHeaders(headers) {
    if (!headers || headers.length === 0) {
        return '';
    }

    const headerLines = headers.map(header => ` * @apiHeader {${header.type}} ${header.name} ${header.description}`);
    const defaultValueLines = headers
        .filter(header => header.defaultValue)
        .map(header => ` * @apiHeaderExample {${header.type}} ${header.name}-Example\n *     "${header.name}: ${header.defaultValue}"`);

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
