<template>
  <div v-if="showDetail">
    <el-row style="margin-bottom: 10px">
      <el-col :span="6">
        <el-input v-model="apiInfo.label" placeholder="Please input">
          <template #prepend>接口名称</template>
        </el-input>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="18">
        <el-input
          v-model="apiInfo.url"
          placeholder="接口请求地址"
          style="width:"
        >
          <template #prepend>
            <el-select
              v-model="apiInfo.method"
              placeholder="请求方式"
              style="width: 115px"
            >
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </template>
        </el-input>
      </el-col>
      <el-col :span="6">
        <el-button type="success" @click="send">发送</el-button>
        <el-button type="primary" @click="savaApiInfo">保存</el-button>
        <el-button type="primary">保存副本</el-button>
      </el-col>
    </el-row>

    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="请求头部" name="请求头部">
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            @changeData="
              (value) => {
                apiInfo.headers = value
              }
            "
            language="json"
            :code="apiInfo.headers"
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="请求体" name="请求体">
        仅支持JSON格式请求体
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            @changeData="
              (value) => {
                apiInfo.requestBody = value
              }
            "
            language="json"
            :code="apiInfo.requestBody"
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Query参数" name="Query参数">
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            @changeData="
              (value) => {
                apiInfo.queryParams = value
              }
            "
            language="json"
            :code="apiInfo.queryParams"
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="插件管理" name="插件管理">
        <config-editor v-if="activeName === '插件管理'"></config-editor>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="配置管理">
        <config v-if="activeName === '配置管理'"></config>
      </el-tab-pane>
    </el-tabs>

    <el-row>
      <el-col :span="24">
        <el-tabs
          v-model="activeResName"
          class="demo-tabs"
          @tab-click="handleClick"
        >
          <el-tab-pane label="返回值" name="返回值">
            <div
              style="height: 40vh; margin-top: 10px; margin-bottom: 5px"
              v-if="showEditor"
            >
              <Editor
                @changeData="
                  (value) => {
                    apiInfo.response = value
                  }
                "
                language="json"
                :code="apiInfo.response"
              ></Editor>
            </div>
          </el-tab-pane>
          <el-tab-pane label="请求头" name="请求头">
            <pre>{{ apiInfo.requestHeader }}</pre>
          </el-tab-pane>
          <el-tab-pane label="响应头" name="响应头">
            <pre>{{ apiInfo.responseHeader }}</pre>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import Editor from '@/components/Editor.vue'
import ConfigEditor from '@/views/json/index.vue'
import Config from '@/views/config/index.vue'
import { sendApi } from '@/api/proxy'
const props = defineProps({
  apiInfoProps: Object,
})
const enterContent = ref('223')
const apiMethod = ref('GET')
const activeName = ref('请求体')
const activeResName = ref('返回值')
// const apiInfo = ref({
//   id: 1000,
//   parentId: 0,
//   label: '',
//   method: 'POST',
//   url: 'https://api.juejin.cn/content_api/v2/article/column?aid=2608&uuid=7167611863961699873&spider=0',
//   headers: '{}',
//   response: '',
//   requestBody: '{"article_id":"7073764210039062559","cursor":"0","limit":10}',
//   queryParams: '{}',
//   requestHeader: {},
//   responseHeader: {},
// })
const apiInfo = ref(
  props.apiInfoProps || {
    id: 1000,
    parentId: 0,
    label: '',
    method: 'POST',
    url: 'https://api.juejin.cn/content_api/v2/article/column?aid=2608&uuid=7167611863961699873&spider=0',
    headers: '{}',
    response: '',
    requestBody: '{"article_id":"7073764210039062559","cursor":"0","limit":10}',
    queryParams: '{}',
    requestHeader: {},
    responseHeader: {},
  },
)
const send = () => {
  let apiInfoCopy = JSON.parse(JSON.stringify(apiInfo.value))
  apiInfoCopy.headers = apiInfoCopy.headers
    ? JSON.parse(apiInfoCopy.headers)
    : {}
  apiInfoCopy.requestBody = apiInfoCopy.requestBody
    ? JSON.parse(apiInfoCopy.requestBody)
    : {}
  apiInfoCopy.queryParams = apiInfoCopy.queryParams
    ? JSON.parse(apiInfoCopy.queryParams)
    : {}
  sendApi(apiInfoCopy)
    .then((res) => {
      console.log(res)
      console.log(res.headers)
      apiInfo.value.response =
        typeof res.data === 'object'
          ? JSON.stringify(res.data, null, 2)
          : res.data
      apiInfo.value.requestHeader = JSON.stringify(res.config.headers, null, 2)
      apiInfo.value.responseHeader = JSON.stringify(res.headers, null, 2)
      refreshEditor()
    })
    .catch((e) => {
      console.log(e)
    })
}

const showEditor = ref('true')
const refreshEditor = () => {
  showEditor.value = false
  setTimeout(() => {
    showEditor.value = true
  }, 100)
}

import bus from 'vue3-eventbus'
import { lib } from '@/utils/lib'
onMounted(() => {
  bus.on('openApiDetail', (node) => {
    console.log('收到api打开广播')
    // let apiInfoItem = lib.config.getApiInfoById(node.id)
    // console.log(apiInfoItem)
    // apiInfo.value = { ...apiInfoItem }
    // reloadPage()
  })

  bus.on('test', (apiId) => {
    console.log('recive keymap-save-current-api-tabs-action event', apiId)
    if (apiInfo.value.id === apiId) {
      savaApiInfo()
    }
  })
})

const showDetail = ref(true)
const reloadPage = () => {
  showDetail.value = false
  setTimeout(() => {
    showDetail.value = true
  }, 100)
}

const savaApiInfo = () => {
  console.log(apiInfo.value)
  lib.config.updateApiInfoById({ ...apiInfo.value })
  bus.emit('saveApi', apiInfo.value)
}
</script>
