<script setup>
import { ref, reactive } from 'vue'

let swagger = window.localStorage.getItem('swagger')
  ? JSON.parse(window.localStorage.getItem('swagger'))
  : {}

const swaggerUrl = ref(swagger.url || '')

const apiSize = ref(0)
const syncSwaggerApiUrl = ref(swagger.server || '')
const syncSwaggerApiVar = ref(swagger.serverVar || '')
const syncHistorySwaggerApiUrl = ref(swagger.history || [])
const syncSwaggerApi = () => {
  window.axios
    .post(window.posttiger.appUrl + '/api/swagger/sync/url', {
      swaggerUrl: swaggerUrl.value,
    })
    .then((res) => {
      window.localStorage.setItem(
        'swagger',
        JSON.stringify({
          url: swaggerUrl.value,
          server: res.data.server,
          serverVar: syncSwaggerApiVar.value,
          history: syncHistorySwaggerApiUrl.value,
        }),
      )
      syncSwaggerApiUrl.value = res.data.server

      let historyItem = swaggerUrl.value + '@@' + syncSwaggerApiVar.value

      syncHistorySwaggerApiUrl.value = syncHistorySwaggerApiUrl.value.filter(
        (item) => item !== historyItem,
      )
      syncHistorySwaggerApiUrl.value.push(historyItem)
      console.log(res)
      apiSize.value = 0
      for (let item of res.data.apis) {
        apiSize.value += item[Object.keys(item)[0]].length
      }
      saveSwaggerApi(res.data.apis, res.data.project + '(swagger同步)')
    })
}

function saveSwaggerApi(apiInfoList, projectName) {
  console.log('savaApiInfo', apiInfoList)
  // 根据项目名称查找
  let projectInfo =
    window.posttiger.db('apiList').collection.findOne({ label: projectName }) ||
    undefined

  if (projectInfo) {
    // 删除项目下所有API
    window.bus.emit('REMOVE_ALL_API_BY_NODE_ID', projectInfo.id)
  }

  // 创建新的project
  let insertData = []
  // let apiInfo = {
  //   id: window.lib.uid(),
  //   headers: parseData.header
  //       ? JSON.stringify(parseData.header, null, 2)
  //       : '',
  //   label: parseData.url,
  //   nodeType: 'api',
  //   parentId: 0,
  //   requestBody: parseData.data
  //       ? JSON.stringify(parseData.data, null, 2)
  //       : '',
  //   queryParams: parseData.params
  //       ? JSON.stringify(parseData.params, null, 2)
  //       : '',
  //   requestHeader: '',
  //   method: parseData.method,
  //   url: parseData.url,
  //   children: [],
  // }
  let projectId = window.lib.uid()
  insertData.push({
    id: projectId,
    parentId: 0,
    children: [],
    nodeType: 'directory',
    label: projectName,
  })
  for (let tagInfo of apiInfoList) {
    for (let key in tagInfo) {
      let tagId = window.lib.uid()
      if (key) {
        // 如果存在 tag 则单独创建一个目录
        insertData.push({
          id: tagId,
          parentId: projectId,
          children: [],
          nodeType: 'directory',
          label: key,
        })
      }
      let tagApiInfoList = tagInfo[key]
      for (let item of tagApiInfoList) {
        insertData.push({
          id: window.lib.uid(),
          parentId: tagId,
          children: [],
          nodeType: 'api',
          label: item.label,
          url: syncSwaggerApiVar.value + item.url,
          method: item.method,
          queryParams: handleJsonStr(item.queryParams),
          requestBody: handleJsonStr(item.requestBody),
          headers: handleJsonStr(item.headers),
        })
      }
    }
  }

  for (let data of insertData) {
    window.posttiger.db('apiList').insert(data)
  }
  window.services.ui.ElMessage.success('同步成功')
  window.bus.emit('REFRESH_API_TREE_NODE', {})
}

/**
 * 处理json字符串，格式化显示优化
 * @param jsonStr
 */
function handleJsonStr(jsonStr) {
  try {
    if (jsonStr) {
      let prettyJsonStr = JSON.stringify(JSON.parse(jsonStr), null, 2)
      console.log(prettyJsonStr)
      return prettyJsonStr
    }
  } catch (e) {
    //ignore
    console.log(e)
  }
  return jsonStr
}
</script>

<template>
  <h1>同步swagger接口信息</h1>
  <el-row :gutter="20">
    <el-col :span="20">
      <el-input
        v-model="swaggerUrl"
        placeholder="请输入swagger地址，默认会覆盖所有数据，如需修改请移动接口到个人项目"
      ></el-input>
      <el-input
        v-model="syncSwaggerApiVar"
        placeholder="请输入接口服务请求前缀变量"
      ></el-input>
    </el-col>
    <el-col :span="4">
      <el-button @click="syncSwaggerApi">同步</el-button>
    </el-col>
  </el-row>

  <h1>
    获取到当前后端服务前缀地址信息为：{{ syncSwaggerApiUrl }}
    ，请手动配置全局变量
  </h1>
  <h1>共计同步 {{ apiSize }} 个接口</h1>

  <h2>历史同步URL列表</h2>
  <h3 v-for="(item, index) in syncHistorySwaggerApiUrl">
    <h4>swagger地址：{{ item.split('@@')?.[0] || '' }}</h4>

    <h4>请求前缀: {{ item.split('@@')?.[1] || '' }}</h4>
  </h3>
</template>

<style scoped></style>
