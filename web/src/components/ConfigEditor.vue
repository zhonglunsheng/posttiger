<template>
  <div>
    <div>
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

      <el-row>
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
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watchEffect, nextTick } from 'vue'
import Editor from '@/components/Editor.vue'
import { ElMessage } from 'element-plus'
import { getNestedValue, setValue } from '@/utils/obj'

const content = ref('')
const language = ref('json')
const currentLanguage = ref('json')
const editorStatus = ref(true)
let options = []

const props = defineProps({
  // 存储临时变量key
  dataKey: String,
  // 获取的数据源 传入函数
  getConfigDataJson: Function,
  // 保存数据 传入函数
  setConfigDataJson: Function,
})

console.log(props.dataKey)

const configKey = ref(window.localStorage.getItem(props.dataKey) || '')

function getConfigDataJson() {
  return props.getConfigDataJson()
}

function setConfigDataJson(configData) {
  return props.setConfigDataJson(configData)
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
    window.localStorage.setItem(props.dataKey, configKey.value)
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

let timer = null

const changeData = (value) => {
  content.value = value
}

if (configKey.value) {
  handlerLoading()
}
</script>
