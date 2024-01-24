<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import CustomForm from '@/components/CustomForm.vue'
import SendForm from '@/views/send/index.vue'
import SendFormTabs from '@/views/send/tabs.vue'
import Slider from '@/views/slider/index.vue'
import bus from 'vue3-eventbus'
import { constant } from '@/utils/constant.js'
//
// const pluginsConfigSwitch = () => {
//   status.value = !status.value
//   // delete window.posttiger.plugins['t1']
//
//   // 模拟发送请求事件
//   let plugins = window.posttiger.plugins
//   for (let plugin in plugins) {
//     let res = plugins[plugin]['execute']()
//     console.log(res)
//   }
// }
//
// const status = ref(true)
//
// // 初始化插件
// if (!window.posttiger) {
//   window.posttiger = {}
// }
// if (!window.posttiger.plugins) {
//   window.posttiger.plugins = []
// }

// 加载插件列表

import 'ninja-keys'
const hotkeys = ref([
  {
    id: '保存当前API',
    title: '保存当前API',
    hotkey: 'ctrl+s',
    handler: () => {
      bus.emit('keymap-save-current-api-tabs', {})
    },
  },
  {
    id: '新建接口',
    title: '新建接口',
    hotkey: 'ctrl+u',
    handler: () => {
      bus.emit(constant.BUS.NEW_API_TAB, {})
    },
  },
])

// 注册全局快捷键
import hotkeysJs from 'hotkeys-js'
let keydownData = constant.KEYDOWN || {}
for (let keydownDataItemKey in keydownData) {
  console.log(
    '注册全局快捷键',
    keydownDataItemKey,
    keydownData[keydownDataItemKey].VALUE,
  )
  hotkeysJs(keydownData[keydownDataItemKey].VALUE, function (event, handler) {
    console.log('发送快捷键事件', handler.key)
    bus.emit(constant.BUS.KEYDOWN_ACTION, {
      type: keydownDataItemKey,
      event: handler,
    })
  })
}

// 改变布局
const apiColSize = ref(18)

// Import component
import Loading from 'vue3-loading-overlay'
// Import stylesheet
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css'

const dbLoadingFinish = ref(false)
onMounted(() => {
  bus.on('dbLoadingFinish', () => {
    console.log('dbLoadingFinish')
    dbLoadingFinish.value = true
    initElementUiCss()
    loadDbPlugins()
    loadApiList()
    registerPlugins()
  })
  bus.on('themePlugin:changeTheme', (data) => {
    if (data[0] === 'reset') {
      // 重置样式
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.remove('default')
      document.documentElement.classList.add(data[1])
      let cssDict = data[2]
      for (let item in cssDict) {
        document.documentElement.style.removeProperty(item)
        document.documentElement.style.setProperty(item, cssDict[item])
      }
      return
    }
    if (data[0] === 'themeName') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.remove('default')
      document.documentElement.classList.add(data[1])
      return
    }
    console.log('themePlugin:changeTheme')
    document.documentElement.style.setProperty(data[0], data[1])
  })

  bus.on(constant.BUS.CHANGE_SLIDER_STATUS, () => {
    if (apiColSize.value === 24) {
      // 当前为隐藏侧边栏状态
      apiColSize.value = 18
    } else {
      apiColSize.value = 24
    }
  })
})

const finishRegisterPlugins = ref(false)
function registerPlugins() {
  enablePlugins.value = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.find()
  console.log('enablePlugins', enablePlugins.value)
  setTimeout(() => {
    finishRegisterPlugins.value = true
  }, 3000)
}
function loadDbPlugins() {
  let plugins = window.posttiger
    .db(constant.COLLECTION.API_PLUGINS)
    .collection.find()
  let pluginsPane = {
    id: '插件管理',
    title: '插件管理',
    children: [],
  }
  for (let item of plugins) {
    pluginsPane.children.push({
      id: item.id,
      title: item.name,
      handler: () => {
        loadingPlugin(item.id)
      },
    })
  }
  console.log(pluginsPane)
  hotkeys.value.push(pluginsPane)
}

function loadApiList() {
  hotkeys.value.push({
    id: '接口管理',
    title: '接口管理',
    children: [],
  })
}

const openModal = (data) => {
  console.log(data)
}

function initElementUiCss() {
  let elementCss = window.posttiger
    .db('ElementUiThemePlugins')
    .collection.findOne({ type: 'element-ui' })
  console.log('elementCss', elementCss)
  if (elementCss) {
    document.documentElement.classList.add(elementCss.themeName)
    document.documentElement.classList.add(elementCss.themeName)
    let cssDict = elementCss.cssVariableList
    console.log(
      ' document.documentElement.style',
      document.documentElement.style,
    )
    for (let item in cssDict) {
      document.documentElement.style.removeProperty(item)
      document.documentElement.style.setProperty(item, cssDict[item])
    }
  }
}

import SfcPlugin from '@/views/plugin/index.vue'
const showPlugin = ref(false)

const enablePlugins = ref([])
const currentPluginId = ref('')
const loadingPlugin = (id) => {
  currentPluginId.value = id
  showPlugin.value = false
  setTimeout(() => {
    showPlugin.value = true
  }, 50)
}

// let shiftPressed = false
// let shiftCount = 0
//
// document.addEventListener('keydown', function (event) {
//   if (event.key === 'Shift') {
//     shiftPressed = true
//     shiftCount++
//
//     if (shiftCount === 2) {
//       // 弹出提示，可以使用自定义的提示框或者浏览器原生的alert
//       const ninja = document.querySelector('ninja-keys')
//       ninja.open()
//       // alert('Shift键被按了两次！')
//       shiftCount = 0 // 重置计数
//     }
//   }
// })
//
// document.addEventListener('keyup', function (event) {
//   if (event.key === 'Shift') {
//     shiftPressed = false
//   }
// })
</script>

<template>
  <loading :active="!dbLoadingFinish"></loading>

  <div v-if="dbLoadingFinish">
    <div>
      <div
        v-for="(item, index) in enablePlugins"
        v-show="false"
        v-if="!finishRegisterPlugins"
      >
        <custom-form :sfc="item.sfc"></custom-form>
      </div>
    </div>

    <sfc-plugin :id="currentPluginId" v-if="showPlugin"></sfc-plugin>

    <ninja-keys
      id="ninja-keys"
      @selected="selected"
      @change="change"
      :placeholder="placeholder"
      openHotkey="ctrl+k"
      :data="hotkeys"
      @open="openModal"
    ></ninja-keys>

    <!-- <router-view></router-view> -->
    <!-- 测试sfc
    <el-button @click="pluginsConfigSwitch">关闭</el-button>
    <div v-if="status">
      test
      <custom-form :sfc="sfc2"></custom-form>
    </div> -->
    <!-- <send-form></send-form> -->
    <!--    <el-row>-->
    <!--      <el-col :span="24" style="margin-bottom: 5px">-->
    <!--        <el-card>-->
    <!--          <el-button type="primary">插件面板</el-button>-->
    <!--        </el-card>-->
    <!--      </el-col>-->
    <!--    </el-row>-->
    <el-row :gutter="20">
      <el-col :span="24 - apiColSize">
        <el-card>
          <Slider></Slider>
        </el-card>
      </el-col>
      <el-col :span="apiColSize">
        <el-card>
          <!-- <send-form></send-form> -->
          <send-form-tabs></send-form-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style>
ninja-keys {
  --ninja-z-index: 999;
}
</style>
