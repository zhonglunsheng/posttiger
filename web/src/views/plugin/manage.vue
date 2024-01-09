<template>
  <div v-if="refreshPage">
    <el-select
      placeholder="请选择插件"
      style="margin-right: 5px"
      v-model="currentSelectPlugin"
      @change="currentSelectPluginChange"
    >
      <el-option
        v-for="(item, index) in plugins"
        :value="item.id"
        :label="item.name"
      ></el-option>
    </el-select>
    <el-switch
      v-model="sfcModel"
      active-text="预览"
      inactive-text="开发"
      @change="sfcModelChange"
    />

    <el-button type="text" size="small" @click="addNewPlugin">
      新增插件
    </el-button>

    <div v-if="!sfcModel">
      <el-divider content-position="left">在线插件开发</el-divider>
      <el-autocomplete
        v-model="configKey"
        :fetch-suggestions="querySearch"
        clearable
        placeholder="Please Input"
        style="width: 50vh"
        @keyup.enter="handlerLoading"
        @select="handleSelect"
      />

      <el-button
        type="primary"
        @click="handlerLoading"
        style="margin-right: 5px; margin-left: 5px"
      >
        加载
      </el-button>
      <el-button
        type="primary"
        @click="handlerSubmit"
        style="margin-right: 5px"
      >
        保存
      </el-button>

      <el-switch
        v-model="sfcSwitch"
        active-text="开启sfc调试"
        inactive-text="关闭sfc调试"
        @change="showSfc"
      />

      <el-row v-if="!sfcSwitch">
        <el-col :span="24">
          <div style="height: 80vh; margin-top: 10px; margin-bottom: 5px">
            <Editor
              @changeData="
                (value) => {
                  content = value
                }
              "
              :language="language"
              :code="content"
              v-if="editorStatus"
            ></Editor>
          </div>
        </el-col>
      </el-row>

      <el-row v-else :gutter="20">
        <el-col :span="12">
          <div style="height: 80vh; margin-top: 10px; margin-bottom: 5px">
            <Editor
              @changeData="changeData"
              :language="language"
              :code="content"
              v-if="editorStatus"
            ></Editor>
          </div>
        </el-col>
        <el-col :span="12">
          <div v-if="sfcSwitch && refreshSfcSwitch">
            <custom-form :sfc="content"></custom-form>
          </div>
        </el-col>
      </el-row>
    </div>

    <div v-else>
      <el-divider content-position="left">
        {{ currentSelectPluginInfo.name }}
      </el-divider>
      <custom-form
        :sfc="currentSelectPluginInfo.sfc"
        v-if="showPluginView"
      ></custom-form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watchEffect, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Editor from '@/components/Editor.vue'
import { ElMessage } from 'element-plus'
import { getNestedValue, setValue } from '@/utils/obj'
import CustomForm from '@/components/CustomForm.vue'
import SfcPlugin from '@/views/plugin/index.vue'
// 插件模式
const sfcModel = ref(
  window.localStorage.getItem('select-plugin-model') != null
    ? window.localStorage.getItem('select-plugin-model') === 'true'
    : true,
)
const sfcModelChange = (data) => {
  console.log('sfcModelChange', data)
  window.localStorage.setItem('select-plugin-model', data)
}
// 输入框
const plugins = ref(
  window.posttiger.db(constant.COLLECTION.API_PLUGINS).collection.find(),
)

const configKey = ref(window.localStorage.getItem('json-configKey') || '')
const content = ref('')
const language = ref('json')
const currentLanguage = ref('json')
const editorStatus = ref(true)
let options = []
let showPluginView = ref(true)

const currentSelectPlugin = ref(
  window.localStorage.getItem('select-plugin-id') ||
    plugins.value?.[0].id ||
    '',
)

let pluginInfo = {
  sfc: '',
}
if (currentSelectPlugin.value) {
  pluginInfo = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.findOne({ id: currentSelectPlugin.value })
}

const currentSelectPluginInfo = ref(pluginInfo || {})

const currentSelectPluginChange = (pluginId) => {
  console.log('pluginInfo', pluginId)
  console.log(
    window.posttiger
      .db(constant.COLLECTION.API_PLUGINS)
      .collection.findOne({ id: pluginId }),
  )
  currentSelectPluginInfo.value = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.findOne({ id: pluginId })

  showPluginView.value = false
  setTimeout(() => {
    showPluginView.value = true
  }, 50)
  window.localStorage.setItem('select-plugin-id', pluginId)

  // 同步更新config.key
  let currentPluginIndex = plugins.value.findIndex((item) => {
    return item.id === pluginId
  })
  configKey.value = `plugin.${currentPluginIndex}.sfc`
  handlerLoading()

  sfcSwitch.value = false
  setTimeout(() => {
    sfcSwitch.value = true
  }, 300)
  // currentSelectPluginInfo.value = pluginInfo
}

const addNewPlugin = () => {
  let allPlugins = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.find()
  allPlugins.push({
    id: window.lib.uid(),
    name: '新增插件',
    sfc:
      "<template>\r\n\r\n</template>\r\n\r\n<script setup>\r\nimport { ref } from 'vue'\r\n" +
      '<' +
      '/script>\r\n',
  })
  window.posttiger.db(constant.COLLECTION.API_PLUGINS).cleanInsert(allPlugins)

  // 开启开发模式
  sfcModel.value = false
  configKey.value = 'plugin.' + (allPlugins.length - 1)
  refreshPageData()
}

/**
 * 刷新页面加载数据
 */
const refreshPage = ref(true)
const refreshPageData = () => {
  plugins.value = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.find()
}
function getConfigDataJson() {
  return {
    plugin: plugins.value,
  }
}

function setConfigDataJson(configData) {
  return window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .cleanInsert(configData)
}

const getKeys = () => {
  if (configKey.value) {
    let keys = getNestedValue(getConfigDataJson(), configKey.value)
    if (keys) {
      return Object.keys(keys).map((key) => {
        return {
          value: configKey.value + '.' + key,
          label: configKey.value + '.' + key,
        }
      })
    } else {
      return options
    }
  } else {
    return Object.keys(getConfigDataJson() || {}).map((key) => {
      return {
        value: key,
        label: key,
      }
    })
  }
}
options = getKeys()

const querySearch = (queryString, cb) => {
  options = getKeys()
  console.log(options)
  const results = queryString
    ? options.filter((item) => {
        return item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      })
    : options
  // call callback function to return suggestions
  cb(results)
}

const handleSelect = () => {
  options = getKeys()
  handlerLoading()
}

const handlerSubmit = () => {
  try {
    if (configKey.value) {
      let configData = getConfigDataJson()
      console.log(configData)
      if (
        currentLanguageType.value === 'json' ||
        currentLanguage.value == 'json'
      ) {
        setValue(configData, configKey.value, JSON.parse(content.value))
      } else {
        setValue(configData, configKey.value, content.value)
      }
      console.log(configData, configKey.value, content.value)
      setConfigDataJson(configData.plugin)
    }
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败，不满足json格式' + e.message)
  }
}

const handlerLoading = () => {
  if (configKey.value) {
    let configData = getConfigDataJson()
    let value = getNestedValue(configData, configKey.value)
    if (typeof value === 'object') {
      content.value = JSON.stringify(value, null, 2)
      currentLanguage.value = 'json'
      currentLanguageType.value = 'json'
      language.value = 'json'
    } else {
      content.value = value
      currentLanguage.value = 'text'
      currentLanguageType.value = 'text'
      language.value = 'text'
    }
    editorRefresh()
    window.localStorage.setItem('json-configKey', configKey.value)
  }
}

const editorRefresh = () => {
  editorStatus.value = false
  setTimeout(() => {
    editorStatus.value = true
  }, 100)
}

// 语法高亮 选择
const currentLanguageType = ref('')
const currentLanguageTypeOptions = getNestedValue(
  getConfigDataJson(),
  'switchLanguage',
) || [
  {
    value: 'python',
    label: 'python',
  },
  {
    value: 'javascript',
    label: 'javascript',
  },
  {
    value: 'json',
    label: 'json',
  },
  {
    value: 'text',
    label: 'text',
  },
]

const changeLanaguage = (value) => {
  language.value = value
  editorRefresh()
}

import { constant } from '@/utils/constant.js'
const sfcSwitch = ref(
  JSON.parse(window.localStorage.getItem('json-sfcSwitch')) || false,
)
const refreshSfcSwitch = ref(true)

const showSfc = (value) => {
  window.localStorage.setItem('json-sfcSwitch', value)
}

let timer = null

const changeData = (value) => {
  content.value = value
  console.log(value)

  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
  refreshSfcSwitch.value = false
  timer = setTimeout(() => {
    refreshSfcSwitch.value = true
  }, 300)
}

console.log('hello11111', configKey.value)
if (configKey.value) {
  handlerLoading()
}
</script>
