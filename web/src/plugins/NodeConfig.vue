<script setup>
import { ref, onMounted } from 'vue'

let directoryNode = window.posttiger.node.collection.find({
  nodeType: 'directory',
})

directoryNode = directoryNode.map((item) => {
  delete item.children
  return {
    id: item.id,
    label: item.label,
  }
})

const collections = ref(directoryNode || [])

const selectNodeName = ref(
  window.localStorage.getItem('selectNodeName') || null,
)

// 读取API
const editorContent = ref(
  JSON.stringify(
    window.posttiger
      .db('nodeConfig')
      .collection.findOne({ id: selectNodeName.value }) || {},
    null,
    2,
  ),
)

const showEditor = ref(false)
const changeSelectDbName = (value) => {
  editorContent.value = JSON.stringify(
    window.posttiger.db('nodeConfig').collection.findOne({ id: value })
      ?.headers || {},
    null,
    2,
  )
  window.localStorage.setItem('selectNodeName', selectNodeName.value)
  showEditor.value = false
  setTimeout(() => {
    showEditor.value = true
  }, 100)
}

if (selectNodeName.value) {
  changeSelectDbName(selectNodeName.value)
}

const saveVariable = () => {
  window.posttiger.db('nodeConfig').insertOrUpdate(
    { id: selectNodeName.value },
    {
      id: selectNodeName.value,
      headers: JSON.parse(editorContent.value),
    },
  )
  window.services.ui.ElMessage.success('保存成功')
}

let timer = null
const changeData = (value) => {
  editorContent.value = value
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
  timer = setTimeout(() => {
    // 保存配置
    saveVariable()
  }, 1000)
}

onMounted(() => {
  console.log('注册公共参数配置插件')
  window.posttiger.plugins.register({
    name: '公共参数配置插件',
    beforePost: (apiInfo) => {
      // 获取当前环境
      let envVariableJson = window.posttiger
        .db('VariablePlugin')
        .collection.findOne()
      if (!envVariableJson || !envVariableJson.globalEnv) {
        console.error(
          '从数据库VariablePlugin获取全局环境变量异常，请检查是否有全局变量内置插件',
        )
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

      // 根据当前节点ID获取父节点信息
      console.log(apiInfo.id)
      let parentIds = window.posttiger.node.findAllParentNodeById(apiInfo.id)
      //遍历父节点信息，优先找到以他为主
      for (let parentId of parentIds) {
        window.posttiger.node.collection.find({ id: parentId })
        let headers = window.posttiger
          .db('nodeConfig')
          .collection.findOne({ id: parentId })?.headers
        if (headers) {
          console.log(
            '当前父节点' +
              parentId +
              '配置了公共请求头参数，以父节点请求头为准',
          )
          apiInfo.headers = headers
          break
        }
      }
      // 替换url、支持mockjs使用
      for (let key in globalEnvData) {
        // 替换header信息
        for (let h in apiInfo.headers) {
          apiInfo.headers[h] = (apiInfo.headers[h] + '').replaceAll(
            '{{' + h + '}}',
            apiInfo.headers[h],
          )
          apiInfo.headers[h] = window.lib.Mock.mock(apiInfo.headers[h])
        }
      }
    },
    afterPost: (apiInfo) => {
      console.log(apiInfo)
    },
    enable: true,
  })
})
</script>

<template>
  <el-select v-model="selectNodeName" @change="changeSelectDbName" filterable>
    <el-option
      v-for="(item, index) in collections"
      :value="item.id"
      :label="item.label"
    ></el-option>
  </el-select>
  <el-button @click="saveVariable">保存</el-button>

  <h1>公共请求头参数</h1>

  <el-row :gutter="20" v-if="showEditor" style="margin-top: 5px">
    <el-col :span="24">
      <div style="height: 30vh">
        <Editor
          language="json"
          :code="editorContent"
          @changeData="changeData"
        ></Editor>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped></style>
