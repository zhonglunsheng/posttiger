<template>
  <VueForm
    v-model="paramsForm"
    :schema="paramsFormSchema"
    :formProps="formProps"
    @submit="handlerSubmit"
    @cancel="goHome"
    :ui-schema="uiSchema"
    v-if="
      visitedForm &&
      currentLayout !== 'editorLayout' &&
      currentLayout !== 'customLayout'
    "
  ></VueForm>

  <div v-else-if="visitedForm && currentLayout === 'customLayout'">
    <custom-form :sfc="sfc"></custom-form>
  </div>

  <!-- 动态表单布局组件加载 -->
  <div
    style="height: 80vh; margin-top: 10px; margin-bottom: 5px"
    v-else-if="
      visitedForm && currentLayout === 'editorLayout' && dialogResizeFlag
    "
  >
    <el-select
      v-model="currentLanguageType"
      placeholder="语法高亮"
      @change="changeLanaguage"
      style="margin: 5px"
    >
      <el-option
        v-for="item in currentLanguageTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <el-button type="primary" @click="goHome">返回</el-button>

    <Editor
      @changeData="
        (value) => {
          enterContent = value
        }
      "
      :language="language"
      :code="enterContent"
    ></Editor>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getParamFormConfig, getConfigDataJson } from '@/utils/db'
import { run, runJavaScript, getScriptInfo } from '@/utils/common'
import Editor from '@/components/Editor.vue'
import CustomForm from '@/components/CustomForm.vue'
import { getNestedValue } from '@/utils/obj'
import { lib } from '@/utils/lib'
// https://vue-json-schema-form.lljj.me/zh/guide/
// https://form.lljj.me/schema-generator.html#/index 表单设计
import VueForm from '@lljj/vue3-form-element'
const props = defineProps({
  schemaKey: String,
  codeKey: String,
})

const visitedForm = ref(true)

const route = useRoute() // 第一步
console.log(route) // 第二步
let schemaKey = route.query.schemaKey || props.schemaKey
let codeKey = route.query.codeKey || props.codeKey
let paramsForm = reactive({})
console.log(schemaKey)
console.log(getParamFormConfig())
console.log(getParamFormConfig()[schemaKey])
let schema = getParamFormConfig()[schemaKey]?.schema || {}
let formProp = getParamFormConfig()[schemaKey]?.formProps || {}
const paramsFormSchema = reactive(schema)
const formProps = reactive(formProp)

// 动态布局显示
const currentLayout = ref('form')
currentLayout.value = schemaKey
console.log(currentLayout.value)

const enterContent = ref('223')
const language = ref('text')
if (currentLayout.value === 'editorLayout') {
  if (window.services.ENTER.type === 'files') {
    let filePath = window.services.ENTER.payload[0]['path']
    enterContent.value = window.services.sandbox.fs.readFileSync(
      filePath,
      'utf8',
    )
  } else {
    enterContent.value = window.services.ENTER.payload
  }

  try {
    enterContent.value = JSON.stringify(JSON.parse(enterContent.value), null, 2)
    language.value = 'json'
  } catch (error) {
    // ignore
  }
  //
}
// const paramsFormSchema = reactive(getParamFormConfig())
// const formProps = reactive(getParamFormConfig())
// 增加全局监听器

const handleKeyDown = (event) => {
  // 获取按下的键
  const key = event.key
  // 例如，你可以检查按下的键是否是某个特定的快捷键
  if (key === 's' && event.ctrlKey) {
    // 在这里执行你的逻辑
    console.log('Ctrl + S 被按下')
    handlerSubmit()
  }
}

onMounted(() => {
  // 监听键盘按下事件
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  // 在组件销毁前移除事件监听器，以防止内存泄漏
  window.removeEventListener('keydown', handleKeyDown)
})

const handlerSubmit = () => {
  // 保存表单内容到 系统存储里面
  console.log('paramsForm', paramsForm)
  let localResultFilePath =
    getNestedValue(getConfigDataJson(), 'localResultFilePath') ||
    'D:/tmp/result.txt'
  window.services.saveExecuteResult(paramsForm, localResultFilePath)
  // 执行脚本
  run()
  console.log('执行脚本完成')
  visitedForm.value = false
}

const dialogResizeFlag = ref(true)

const handleEditorResize = (event) => {
  dialogResizeFlag.value = false
  setTimeout(() => {
    dialogResizeFlag.value = true
  }, 10)
}

onMounted(() => {
  window.addEventListener('resize', handleEditorResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleEditorResize)
})

// 语言切换
// 语法高亮 选择
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
  handleEditorResize()
}

// 动态修改表单内容
const uiSchema = reactive({})

try {
  let uiSchemaResult = runJavaScript()
  if (uiSchemaResult && uiSchemaResult) {
    Object.assign(uiSchema, uiSchemaResult)
  }
} catch (error) {
  console.log('处理前置脚本异常', error)
}

import bus from 'vue3-eventbus'

let $router = useRouter()

const goHome = () => {
  bus.emit('goHome', { status: true })
  $router.push('/')
}
if (!window.serviceApi.goHome) {
  window.serviceApi.goHome = goHome
}
if (!window.serviceApi.run) {
  window.serviceApi.run = run
}

// 动态组件
let scriptInfo = getScriptInfo()
let sfcContent = '<template><h1>当前脚本未配置sfc内容</h1></template>'
if (scriptInfo?.basicForm?.sfc) {
  sfcContent =
    lib.config.getConfigNestedValue('SFC_MANAGE.' + scriptInfo.basicForm.sfc) ||
    sfcContent
}
const sfc = ref(sfcContent)
</script>
