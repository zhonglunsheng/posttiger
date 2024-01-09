<template>
  <el-card style="margin: 5px">
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
    <el-button type="primary" @click="handlerSubmit" style="margin-right: 5px">
      保存
    </el-button>

    <el-select
      v-model="currentLanguageType"
      placeholder="语法高亮"
      @change="changeLanaguage"
    >
      <el-option
        v-for="item in currentLanguageTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

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
  </el-card>
</template>

<script setup>
import { computed, ref, reactive, watchEffect, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Editor from '@/components/Editor.vue'
import { ElMessage } from 'element-plus'
import { getConfigDataJson, setConfigDataJson } from '@/utils/db'
import { getNestedValue, setValue } from '@/utils/obj'

// 输入框

const configKey = ref(window.localStorage.getItem('json-configKey') || '')
const content = ref('')
const language = ref('json')
const currentLanguage = ref('json')
const editorStatus = ref(true)
let options = []

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
}

const handlerSubmit = () => {
  try {
    if (configKey.value) {
      let configData = getConfigDataJson()
      if (
        currentLanguageType.value === 'json' ||
        currentLanguage.value == 'json'
      ) {
        setValue(configData, configKey.value, JSON.parse(content.value))
      } else {
        setValue(configData, configKey.value, content.value)
      }

      setConfigDataJson(configData)
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

import CustomForm from '@/components/CustomForm.vue'
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
