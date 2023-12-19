<script setup>
import Editor from '@/components/Editor.vue'
import { setConfigData, getConfigDataJson } from '@/utils/db'
import { yamlToJson, jsonToYarn } from '@/utils/yaml'
import { ref, reactive, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

// 获取数据
const editorConfig = reactive({
  code: jsonToYarn(getConfigDataJson()),
  language: 'yaml',
})

const saveOk = () => {
  let success = false
  console.log(editorConfig.language)
  if (editorConfig.language === 'json') {
    success = setConfigData(editorConfig.code)
  } else {
    success = setConfigData(JSON.stringify(yamlToJson(editorConfig.code)))
  }
  if (!success) {
    ElMessage.error('yaml配置文件格式异常，请检查！！')
    return
  }
  changeDataFlag = false
  ElMessage.success('保存成功')
}

onBeforeUnmount(() => {
  if (changeDataFlag) {
    ElMessage('当前插件配置未保存，请手动保存！')
    // setConfigData(codeContent)
  }
})

let changeDataFlag = false
const changeData = (data) => {
  editorConfig.code = data
  changeDataFlag = true
}

const switchShowFormat = ref(true)

const changeShowFormat = (value) => {
  console.log(value, editorConfig)
  if (value) {
    // yarml格式
    editorConfig.code = jsonToYarn(JSON.parse(editorConfig.code))
    editorConfig.language = 'yaml'
  } else {
    editorConfig.code = JSON.stringify(yamlToJson(editorConfig.code), null, 2)
    editorConfig.language = 'json'
  }
  refreshEditor()
}

const showEditor = ref(true)
const refreshEditor = () => {
  showEditor.value = false
  setTimeout(() => {
    showEditor.value = true
  }, 100)
}
</script>

<template>
  <div style="height: 80vh">
    <el-button @click="saveOk" style="margin: 5px" type="primary">
      保存配置
    </el-button>
    <el-switch
      v-model="switchShowFormat"
      size="large"
      active-text="YAML"
      inactive-text="JSON"
      @change="changeShowFormat"
    />
    {{ code }}
    <Editor
      v-bind="editorConfig"
      @changeData="changeData"
      v-if="showEditor"
    ></Editor>
  </div>
</template>
