<template>
  <div v-if="showDetail">
    <el-row style="margin-bottom: 10px">
      <el-col :span="12">
        <el-input
          ref="apiNameRef"
          v-model="apiInfo.label"
          placeholder="Please input"
        >
          <template #prepend>接口名称</template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <node-directory-select></node-directory-select>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-row>
          <el-col :span="3">
            <el-select
              v-model="apiInfo.method"
              placeholder="请求方式"
              style="width: 100%"
            >
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-col>
          <el-col :span="21">
            <auto-complete
              :data="apiInfo.url"
              @change-data="
                (data) => {
                  apiInfo.url = data
                }
              "
            ></auto-complete>
          </el-col>
        </el-row>

        <!--        <el-input v-model="apiInfo.url" placeholder="接口请求地址">-->
        <!--          <template #prepend>-->
        <!--            <el-select-->
        <!--              v-model="apiInfo.method"-->
        <!--              placeholder="请求方式"-->
        <!--              style="width: 115px"-->
        <!--            >-->
        <!--              <el-option label="GET" value="GET" />-->
        <!--              <el-option label="POST" value="POST" />-->
        <!--              <el-option label="PUT" value="PUT" />-->
        <!--              <el-option label="DELETE" value="DELETE" />-->
        <!--            </el-select>-->
        <!--          </template>-->
        <!--        </el-input>-->
      </el-col>
      <el-col :span="8">
        <el-button type="success" @click="send">发送</el-button>
        <el-button type="primary" @click="savaApiInfo">保存</el-button>
        <el-button type="primary" @click="cloneApi">克隆</el-button>
        <el-button type="warning" @click="recyclingAPI">回收站</el-button>
        <el-dropdown style="margin-left: 5px">
          <el-button type="primary">
            更多
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="closeApiTabList">
                关闭所有标签
              </el-dropdown-item>
              <el-dropdown-item @click="addApiUseCases">
                新增用例
              </el-dropdown-item>
              <el-dropdown-item @click="removeCurrentApi">
                删除
              </el-dropdown-item>
              <el-dropdown-item @click="changeSliderShow">
                隐藏/显示侧边栏
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
    </el-row>

    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="请求头部" name="请求头部">
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            :code="apiInfo.headers"
            language="json"
            @changeData="
              (value) => {
                apiInfo.headers = value
              }
            "
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="请求体" name="请求体">
        仅支持JSON格式请求体
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            :code="apiInfo.requestBody"
            language="json"
            @changeData="
              (value) => {
                apiInfo.requestBody = value
              }
            "
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Query参数" name="Query参数">
        <div style="height: 40vh; margin-top: 10px; margin-bottom: 5px">
          <Editor
            :code="apiInfo.queryParams"
            language="json"
            @changeData="
              (value) => {
                apiInfo.queryParams = value
              }
            "
          ></Editor>
        </div>
      </el-tab-pane>
      <el-tab-pane label="插件扩展" name="插件扩展">
        <plugin-editor v-if="activeName === '插件扩展'"></plugin-editor>
      </el-tab-pane>
      <el-tab-pane label="插件开发" name="插件开发">
        <variable-plugin
          v-if="activeName === '插件开发'"
          :get-config-data-json="() => {}"
          dataKey="test-config"
        ></variable-plugin>
      </el-tab-pane>
    </el-tabs>

    <el-row v-if="activeName !== '插件开发' && activeName !== '插件扩展'">
      <el-col :span="24">
        <el-tabs v-model="activeResName" class="demo-tabs">
          <el-tab-pane :label="`响应内容`" name="响应内容">
            <div
              v-loading="loading"
              style="margin-top: 10px; margin-bottom: 5px"
              class="response-content"
            >
              <Editor
                v-if="showEditor"
                :code="apiInfo.response"
                language="json"
                @changeData="
                  (value) => {
                    apiInfo.response = value
                  }
                "
              ></Editor>
            </div>
          </el-tab-pane>
          <el-tab-pane label="响应可视化" name="响应可视化">
            <div>
              <json-editor
                v-model="jsonEditorContent"
                name="body"
                style="height: 80vh"
              ></json-editor>
            </div>
          </el-tab-pane>
          <!--          <el-tab-pane label="html内容预览" name="html内容预览">-->
          <!--            <div style="height: 40vh">-->
          <!--              <iframe-->
          <!--                style="-->
          <!--                  width: 100%;-->
          <!--                  height: 100%;-->
          <!--                  border: none;-->
          <!--                  background: #fff;-->
          <!--                "-->
          <!--              ></iframe>-->
          <!--            </div>-->
          <!--          </el-tab-pane>-->
          <el-tab-pane label="请求头" name="请求头">
            <pre class="pre-code">{{ apiInfo.requestHeader }}</pre>
          </el-tab-pane>
          <el-tab-pane label="响应头" name="响应头">
            <pre class="pre-code">{{ apiInfo.responseHeader }}</pre>

            <div>
              <el-text class="mx-1" type="primary">
                接口耗时：{{ coastTime }}ms
              </el-text>
              <br />
              <el-text class="mx-1" type="primary">
                返回大小：{{ contentSize }}
              </el-text>
              <br />
              <el-text class="mx-1" type="primary">
                响应状态码：{{ contentResponseStatus }}
              </el-text>
            </div>
          </el-tab-pane>
          <el-tab-pane label="请求快照" name="请求快照">
            请求地址：
            <pre class="pre-code">{{ apiRequestASnapshot.url }}</pre>
            请求头：
            <pre class="pre-code">{{ apiRequestASnapshot.headers }}</pre>
            查询参数：
            <pre class="pre-code">{{ apiRequestASnapshot.queryParams }}</pre>
            请求体：
            <pre class="pre-code">{{ apiRequestASnapshot.requestBody }}</pre>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watchEffect } from 'vue'
import Editor from '@/components/Editor.vue'
import NodeDirectorySelect from './nodeSelect.vue'
import Config from '@/views/config/index.vue'
import { sendApi } from '@/api/proxy'
import AutoComplete from '@/components/AutoComplete.vue'
import bus from 'vue3-eventbus'
// import VariablePlugin from '@/plugins/CurlImportPlugins.vue'
import VariablePlugin from '@/plugins/NodeConfig.vue'
// import VariablePlugin from '@/components/ConfigEditor.vue'
import PluginEditor from '@/views/plugin/manage.vue'
import { constant } from '@/utils/constant.js'
import JsonEditor from '@/components/JsonEditor.vue'

const props = defineProps({
  apiInfoProps: Object,
})

const apiNameRef = ref(null)

const activeName = ref('请求体')
const activeResName = ref('响应内容')

const coastTime = ref(0)
const contentSize = ref('')
const contentResponseStatus = ref(undefined)
const apiInfo = ref(props.apiInfoProps || {})
// 新增接口用例
const addApiUseCases = () => {
  bus.emit(constant.BUS.API_USE_CASE, () => {})
}

const changeSliderShow = () => {
  bus.emit(constant.BUS.CHANGE_SLIDER_STATUS, () => {})
}

const calculateTheResponseContentSize = (text) => {
  function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    if (bytes === 0) return '0 Byte'

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))

    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
  }

  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)
  const byteSize = bytes.length
  console.log(byteSize)
  return formatBytes(byteSize)
}

const apiRequestASnapshot = ref({})
const loading = ref(false)

const send = () => {
  let apiInfoCopy = JSON.parse(JSON.stringify(apiInfo.value))
  apiInfoCopy.headers = apiInfoCopy.headers
    ? JSON.parse(apiInfoCopy.headers)
    : {}
  try {
    loading.value = true
    apiInfoCopy.requestBody = apiInfoCopy.requestBody
      ? JSON.parse(apiInfoCopy.requestBody)
      : {}
  } catch (e) {
    // ignore
  }
  apiInfoCopy.queryParams = apiInfoCopy.queryParams
    ? JSON.parse(apiInfoCopy.queryParams)
    : {}
  console.log(apiInfoCopy)
  // 接口发送前处理插件扩展函数
  window.posttiger.plugins.data.forEach((plugin) => {
    plugin.beforePost(apiInfoCopy)
  })
  apiRequestASnapshot.value = apiInfoCopy
  let start = new Date().getTime()
  sendApi(apiInfoCopy)
    .then((res) => {
      coastTime.value = new Date().getTime() - start
      console.log(res)
      console.log(res.headers)
      apiInfo.value.response =
        typeof res.data === 'object'
          ? JSON.stringify(res.data, null, 2)
          : res.data
      // 计算大小
      contentSize.value = calculateTheResponseContentSize(
        apiInfo.value.response,
      )
      // 响应状态码
      contentResponseStatus.value = res.status
      apiInfo.value.requestHeader = JSON.stringify(res.config.headers, null, 2)
      apiInfo.value.responseHeader = JSON.stringify(res.headers, null, 2)
      refreshEditor()
      loading.value = false
    })
    .catch((error) => {
      loading.value = false
      if (!error.response?.data) {
        window.services.ui.ElMessage.error(
          '接口异常，无数据返回，请查看控制台！！！',
        )
        return
      }
      console.log(error)
      contentResponseStatus.value = error.response.status
      apiInfo.value.response =
        typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data, null, 2)
          : error.response.data + ''

      apiInfo.value.requestHeader = JSON.stringify(
        error.config.headers,
        null,
        2,
      )
      apiInfo.value.responseHeader = JSON.stringify(
        error.response.headers,
        null,
        2,
      )
      refreshEditor()
    })
}

const showEditor = ref('true')
const refreshEditor = () => {
  showEditor.value = false
  setTimeout(() => {
    showEditor.value = true
  }, 100)
}

const recyclingAPI = () => {
  console.log(apiInfo.value)
  let copyApiInfo = apiInfo.value
  // // 判断是否存在api 如果不存在 则保存
  // let findOne = window.posttiger
  //   .db(constant.COLLECTION.API_LIST)
  //   .collection.findOne({ id: copyApiInfo.id })
  // 修改parentId 然后保存
  copyApiInfo.parentId = constant.COMMON.RECYCLE_ID
  savaApiInfo()
  // 发布加入回收站事件
  bus.emit(constant.BUS.ADD_TO_THE_RECYCLE_BIN, copyApiInfo)
}

const closeApiTabList = () => {
  // 关闭所有标签列表
  bus.emit(constant.BUS.CLOSE_ALL_TAB_LIST, {})
}
const cloneApi = () => {
  bus.emit(constant.BUS.CLONE_API, () => {})
}
onMounted(() => {
  bus.on('test', (apiId) => {
    console.log('recive keymap-save-current-api-tabs-action event', apiId)
    if (apiInfo.value.id === apiId) {
      savaApiInfo()
    }
  })
  bus.on(constant.BUS.KEYDOWN_ACTION, (data) => {
    console.log(constant.KEYDOWN.SEND_API.NAME, data)
    if (constant.KEYDOWN.SEND_API.NAME === data.type) {
      // 判断当前激活面板
      let activeApi = window.posttiger.node.getCurrentActiveApi()
      if (apiInfo.value.id === activeApi.id) {
        console.log('发送API请求')
        send()
      }
    }
  })
  // nextTick(() => {
  //   console.log('进入')
  //   apiNameRef.value.focus()
  //   console.log('apiNameRef', apiNameRef)
  // })
})

const showDetail = ref(true)
const reloadPage = () => {
  showDetail.value = false
  setTimeout(() => {
    showDetail.value = true
  }, 100)
}

const savaApiInfo = () => {
  console.log('savaApiInfo', apiInfo.value)
  window.posttiger
    .db('apiList')
    .insertOrUpdate({ id: apiInfo.value.id }, apiInfo.value)
  bus.emit('saveApi', apiInfo.value)
  window.services.ui.ElMessage.success('保存成功')
}

const removeCurrentApi = () => {
  bus.emit(constant.BUS.REMOVE_API_ACTION, { id: apiInfo.value.id })
}

const jsonEditorContent = ref({})

watchEffect(() => {
  let responseData = apiInfo.value.response
  let data = ''
  try {
    data = JSON.parse(responseData)
  } catch (e) {
    //ignore
  }
  if (data) {
    jsonEditorContent.value = JSON.stringify(data)
  }
})

const responseViewHeight = ref('80vh')
</script>
<style scoped>
.pre-code {
  white-space: pre-wrap !important;
}
.response-content {
  height: v-bind(responseViewHeight);
}
</style>
