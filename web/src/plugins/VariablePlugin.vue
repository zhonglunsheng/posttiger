<script setup>
import { ref, onMounted } from 'vue'
import { constant } from '@/utils/constant.js'
// 读取API
const envVariable = ref(
  JSON.stringify(
    window.posttiger.db('VariablePlugin').collection.findOne() || {},
    null,
    2,
  ),
)

const saveVariable = () => {
  window.posttiger
    .db('VariablePlugin')
    .cleanInsert(JSON.parse(envVariable.value))
  window.bus.emit('LOADING_VARIABLES', {})
  window.services.ui.ElMessage.success('保存成功')
}

onMounted(() => {
  console.log('注册插件')
  window.posttiger.register({
    name: '变量替换插件',
    beforePost: (apiInfo) => {
      // 获取当前环境
      let envVariableJson = window.posttiger
        .db('VariablePlugin')
        .collection.findOne()
      if (!envVariableJson || !envVariableJson.globalEnv) {
        return
      }
      /**
       * {
       *   "globalEnv": "dev",
       *   "envProps": {
       *     "globalEnv": {
       *       "dev": {
       *         "url": "http://localhost:8080/",
       *         "token": "123"
       *       },
       *       "test": {
       *         "url": "http://localhost:8081/",
       *         "token": "123"
       *       }
       *     }
       *   }
       * }
       */
      let globalEnvKey = envVariableJson.globalEnv
      let globalEnvData = envVariableJson.envProps.globalEnv[globalEnvKey]

      // 替换url、支持mockjs使用
      for (let key in globalEnvData) {
        apiInfo.url = apiInfo.url.replaceAll(
          '{{' + key + '}}',
          globalEnvData[key],
        )
        apiInfo.url = window.lib.Mock.mock(apiInfo.url)
        // 替换header信息
        for (let h in apiInfo.headers) {
          apiInfo.headers[h] = apiInfo.headers[h].replaceAll(
            '{{' + h + '}}',
            apiInfo.headers[h],
          )
          apiInfo.headers[h] = window.lib.Mock.mock(apiInfo.headers[h])
        }

        // 替换body信息
        for (let h in apiInfo.requestBody) {
          if (typeof apiInfo.requestBody[h] !== 'string') {
            continue
          }
          apiInfo.requestBody[h] = apiInfo.requestBody[h].replaceAll(
            '{{' + h + '}}',
            apiInfo.requestBody[h],
          )
          apiInfo.requestBody[h] = window.lib.Mock.mock(apiInfo.requestBody[h])
        }

        // 替换请求参数信息
        for (let h in apiInfo.queryParams) {
          if (typeof apiInfo.queryParams[h] !== 'string') {
            continue
          }
          apiInfo.queryParams[h] = apiInfo.queryParams[h].replaceAll(
            '{{' + h + '}}',
            apiInfo.queryParams[h],
          )
          apiInfo.queryParams[h] = window.lib.Mock.mock(apiInfo.queryParams[h])
        }
      }
      console.log(apiInfo)
    },
    afterPost: (apiInfo) => {
      console.log(apiInfo)
    },
    enable: true,
  })
})

let timer = null
const changeData = (value) => {
  envVariable.value = value
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
  timer = setTimeout(() => {
    // 保存配置
    saveVariable()
  }, 5000)
}
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <div style="height: 80vh">
        <Editor
          language="json"
          :code="envVariable"
          @changeData="changeData"
        ></Editor>
      </div>
    </el-col>
    <!--    <el-col :span="12">-->
    <!--      <el-button @click="saveVariable">保存</el-button>-->
    <!--    </el-col>-->
  </el-row>
</template>

<style scoped></style>
