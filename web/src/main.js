import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import ElementPlus from 'element-plus'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/dist/index.css'
import { lib } from './utils/lib.js'
import { constant } from './utils/constant.js'
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import VConsole from 'vconsole'
import eruda from 'eruda'
// console.log('format', a)
// 或者使用配置参数来初始化，详情见文档
// import VConsole from 'vconsole'
// new VConsole({ theme: 'dark' })
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'jsoneditor/dist/jsoneditor.min.css'
// 设置monaco编辑器提示

import { services } from '@/utils/ext'
import { init } from '@/utils/init'

if (!window.services) {
  window.services = services()
  window.services.lib = lib
}

if (!window.serviceApi) {
  window.serviceApi = {}
}

init()

// setTimeout(() => {
//   // console.log(
//   //   typeof lib.config.getConfigDataJson(),
//   //   lib.config.getConfigNestedValue(window.services.constant.MONACO_COMPLETION),
//   // )
//
//   // 是否开启调试
//   if (lib.config.getConfigNestedValue(constant.ENABLE_DEBUG)) {
//     new VConsole({ theme: 'dark' })
//   }
//
//   if (lib.config.getConfigNestedValue('ENABLE_ERUDA_DEBUG')) {
//     eruda.init()
//   }
//
//   // 初始化编辑器提示
//   try {
//
//     let MONACO_COMPLETION = lib.config.getConfigNestedValue(
//       constant.MONACO_COMPLETION,
//     )
//     for (let item in MONACO_COMPLETION) {
//       // console.log(item, MONACO_COMPLETION[item].suggestions)
//
//       monaco.languages.registerCompletionItemProvider(item, {
//         provideCompletionItems(model, position) {
//           var word = model.getWordUntilPosition(position)
//           var range = {
//             startLineNumber: position.lineNumber,
//             endLineNumber: position.lineNumber,
//             startColumn: word.startColumn,
//             endColumn: word.endColumn,
//           }
//           console.log(MONACO_COMPLETION[item])
//           let suggestions = MONACO_COMPLETION[item].suggestions
//           suggestions.map((item) => {
//             ;(item['range'] = range),
//               (item['insertTextRules'] =
//                 monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet)
//           })
//           console.log(suggestions)
//           return {
//             suggestions: suggestions,
//           }
//         },
//       })
//     }
//   } catch (error) {
//     console.error('处理编辑器提示报错', error)
//   }
// }, 300)
const app = createApp(App)
//引入路由
import router from './router'
//注册模板路由
app.use(router)

app.use(ElementPlus, {
  locale: zhCn,
})

import eventBus from 'vue3-eventbus'
// 全局广播
app.use(eventBus)
import Editor from '@/components/Editor.vue'
app.component('Editor', Editor)
// import Vue3Jsoneditor from 'v3-jsoneditor/src/Vue3Jsoneditor.vue'
// app.component('vue3-jsoneditor', Vue3Jsoneditor)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
import 'vditor/dist/index.css'
import VueVditor from 'vue-vditor'
app.use(VueVditor)

import Markdown from '@/components/Markdown.vue'
app.component('Markdown', Markdown)
app.mount('#app')
