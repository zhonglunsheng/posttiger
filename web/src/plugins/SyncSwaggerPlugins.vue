<script setup>
import { ref, reactive } from 'vue'
import { json2schema } from '@wibetter/json-utils'
import Editor from '@/components/Editor.vue'
const jsonData = {
  a: 'text1',
  field_2: 'text2',
  field_3: 'text13',
}
const curJsonSchema = json2schema(jsonData)
console.log(curJsonSchema, 'curJsonSchema')
const generateLink = ref('')

// 获取当前api信息
let apiInfo =
  window.posttiger
    .db('apiTabConfig')
    .collection.find({ type: 'currentApiInfo' })[0]?.data?.content || {}

console.log(apiInfo, 'apiInfo')

const apiDocGenerate = () => {
  // 获取父级菜单信息
  let apiTree = window.services.lib.util.buildTree(
    window.posttiger.db('apiList').collection.find(),
    0,
  )

  console.log(apiInfo.parentId, apiTree, 'apiTree')

  let parentInfo = window.services.lib.util.findParentNodeByTree(
    apiTree,
    apiInfo.parentId,
  )
  console.log(parentInfo, 'parentInfo')

  parentInfo = parentInfo.length ? parentInfo : [apiInfo]

  let projectInfo =
    parentInfo.length > 1 ? parentInfo[parentInfo.length - 1] : parentInfo[0]

  // 处理headers信息
  let reqHeaders = []
  if (apiInfo.headers) {
    // json转jsonschema
    console.log(apiInfo.headers)
    let headersJson = apiInfo.headers ? JSON.parse(apiInfo.headers) : {}
    let headersJsonSchema = window.lib.jsonUtils.json2schema(headersJson)
    console.log(headersJsonSchema, 'headersJsonSchema')
    for (let key in headersJsonSchema.properties) {
      let item = headersJsonSchema.properties[key]
      reqHeaders.push({
        name: key,
        description: headersJson[key],
        type: item.type,
        defaultValue: headersJson[key],
      })
    }
  }

  function paresRequestBody(data) {
    let json = data ? JSON.parse(data) : {}
    let jsonSchema = window.lib.jsonUtils.json2schema(json)
    console.log(jsonSchema, 'jsonSchema', JSON.stringify(jsonSchema))

    function parseJsonSchema(schema, parentKey = '', data = {}) {
      let result = []

      if (schema.properties) {
        if (parentKey) {
          result.push({
            name: parentKey,
            description: schema.description || '',
            type: schema.type || '',
          })
        }

        for (let key in schema.properties) {
          let newKey = parentKey ? `${parentKey}.${key}` : key
          result = result.concat(
            parseJsonSchema(schema.properties[key], newKey, data),
          )
        }
      } else if (schema.items) {
        result.push({
          name: parentKey,
          description: schema.description || '',
          type: schema.type || '',
        })
        // Handle array properties
        if (schema.items.properties) {
          for (let key in schema.items.properties) {
            let newKey = parentKey ? `${parentKey}.${key}` : key
            result = result.concat(
              parseJsonSchema(schema.items.properties[key], newKey, data),
            )
          }
        }
      } else {
        result.push({
          name: parentKey,
          description:
            getValueByPath(data, parentKey, schema.type) ||
            schema.description ||
            '',
          type: schema.type || '',
        })
      }

      return result
    }

    function getValueByPath(data, path, expectedType) {
      const paths = path.split('.')

      // 遍历属性路径
      for (let p of paths) {
        // 处理数组情况，取第一个元素
        if (Array.isArray(data) && data.length > 0) {
          data = data[0][p]
        } else {
          data = data[p]
        }
      }

      // 根据预期类型进行处理
      if (expectedType === 'array' && Array.isArray(data)) {
        return '数组对象'
      } else {
        return data
      }
    }

    function setValueByPath(data, path, updateValue) {
      const paths = path.split('.')

      // 遍历属性路径
      for (let p of paths) {
        // 处理数组情况，取第一个元素
        if (Array.isArray(data) && data.length > 0) {
          if (typeof data !== 'object' && !Array.isArray(data)) {
            data[0][p] = updateValue
          }
        } else {
          if (typeof data !== 'object' && !Array.isArray(data)) {
            data = data[p]
          }
        }
      }
    }

    return parseJsonSchema(jsonSchema, '', json)
  }

  function handleReqApiDoc(data) {
    // 处理queryParams信息
    let reqInfo = []
    if (data) {
      // json转jsonschema
      console.log(data)
      let json = data ? JSON.parse(data) : {}
      let jsonSchema = window.lib.jsonUtils.json2schema(json)
      console.log(jsonSchema, 'jsonSchema', JSON.stringify(jsonSchema))
      for (let key in jsonSchema.properties) {
        let item = jsonSchema.properties[key]
        reqInfo.push({
          name: key,
          description: json[key],
          type: item.type,
          defaultValue: json[key],
        })
      }
    }
    return reqInfo
  }

  let reqBody = {
    project: {
      name: projectInfo.label,
      description: projectInfo.label,
      title: projectInfo.label,
      url: apiInfo.url.slice(0, apiInfo.url.indexOf('/', 8)),
    },
    apiDoc: {
      apiVersion: '0.0.0',
      method: 'GET',
      group: parentInfo[0].label,
      path: apiInfo.url.replace('http://').replace('https://'),
      title: apiInfo.label,
      description: apiInfo.label,
      headers: reqHeaders,
      queryParams: handleReqApiDoc(apiAnnotationInformation.queryParams),
      param: paresRequestBody(apiAnnotationInformation.requestBody),
      paramExample: apiInfo.requestBody ? JSON.parse(apiInfo.requestBody) : {},
      examples: [
        {
          name: 'bash',
          type: 'bash',
          content:
            'curl -H "Authorization: token 5f048fe" -i https://api.example.com/user/fr-par/4711',
        },
        {
          name: 'js',
          type: 'js',
          content:
            "const client = AcmeCorpApi('5f048fe');\nconst user = client.getUser(42);",
        },
        {
          name: 'python',
          type: 'python',
          content:
            "client = AcmeCorpApi.Client(token='5f048fe')\nuser = client.get_user(42)",
        },
      ],
      success: paresRequestBody(apiInfo.response),
      successExample: {
        name: '200',
        content: apiInfo.response ? JSON.parse(apiInfo.response) : {},
      },
      error: [
        {
          name: 'message',
          type: 'String',
          description: 'Error message',
        },
      ],
      errorExample: {
        name: 'Response (example)',
        content:
          'HTTP/1.1 401 Not Authenticated\n{\n  "error": "NoAccessRight"\n}',
      },
    },
  }
  // 发送生成文档请求
  window.axios
    .post(window.posttiger.appUrl + '/api/api-doc/generate', reqBody)
    .then((res) => {
      console.log(res)
      generateLink.value = res.data.success
      console.log(generateLink.value)
    })
}

const apiAnnotationInformation = reactive({
  requestBody: '',
  response: '',
  queryParams: '',
  headers: '',
})

setTimeout(() => {
  apiAnnotationInformation.requestBody = apiInfo.requestBody
  apiAnnotationInformation.response = apiInfo.response
  apiAnnotationInformation.queryParams = apiInfo.queryParams
  apiAnnotationInformation.headers = apiInfo.headers
  changeSelectKey()
}, 100)

const apiAnnotationInformationKey = ref('requestBody')

const editorStatus = ref(true)
const loading = ref(false)

const changeSelectKey = () => {
  editorStatus.value = false
  loading.value = true
  setTimeout(() => {
    editorStatus.value = true
    loading.value = false
  }, 100)
}
</script>

<template>
  <h1>接口文档基本信息</h1>
  <el-select v-model="apiAnnotationInformationKey" @change="changeSelectKey">
    <el-option
      :label="key"
      :value="key"
      v-for="(key, index) in Object.keys(apiAnnotationInformation)"
    ></el-option>
  </el-select>
  <el-row>
    <el-col :span="18">
      <div style="height: 50vh" v-loading="loading">
        <Editor
          v-if="editorStatus"
          language="json"
          :code="apiAnnotationInformation[apiAnnotationInformationKey]"
          @changeData="
            (data) => {
              apiAnnotationInformation[apiAnnotationInformationKey] = data
            }
          "
        ></Editor>
      </div>
    </el-col>
    <el-col :span="6">
      <el-button
        type="primary"
        @click="apiDocGenerate"
        style="margin-left: 5px"
      >
        分享
      </el-button>
    </el-col>
  </el-row>

  {{ generateLink }}
</template>

<style scoped></style>
