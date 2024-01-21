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

// 注册插件
window.posttiger.plugins = []
window.posttiger.register = (plugin) => {
  let plugins = window.posttiger.plugins
  // 判断当前plugins是否存在插件名称 存在则删除 重新注册
  let existPluginInfo = plugins.filter((p) => {
    return p.name === plugin.name
  })
  if (existPluginInfo.length > 0) {
    // 移除
    window.posttiger.plugins = window.posttiger.plugins.filter((p) => {
      return p.name !== plugin.name
    })
  }
  // 加入 判断是否启用
  if (plugin.enable) {
    console.log('注册插件', plugin)
    window.posttiger.plugins.push(plugin)
    // 排序
    window.posttiger.plugins.sort((a, b) => {
      // order越大优先级越大，没有设置默认最小
      let aOrder = a?.order || 1
      let bOrder = b?.order || 1
      return aOrder - bOrder
    })
  }
}

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
  // let plugins = window.posttiger
  //   .db(constant.COLLECTION.API_PLUGINS)
  //   .collection.find()
  // let pluginsPane = {
  //   id: '接口管理',
  //   title: '接口管理',
  //   children: [],
  // }
  // for (let item of plugins) {
  //   pluginsPane.children.push({
  //     id: item.id,
  //     title: item.name,
  //     handler: () => {
  //       loadingPlugin(item.id)
  //     },
  //   })
  // }
  // console.log(pluginsPane)
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

// document.documentElement.classList.add('dark')
// console.log(document.documentElement)
// setTimeout(() => {
//   document.documentElement.style.setProperty('--el-color-primary', 'red')
// }, 3000)

import jsf from 'json-schema-faker'
import JsonEditor from '@/components/JsonEditor.vue'
const schema = {
  title: 'Pet',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 25,
    },
    type: {
      type: 'string',
      enum: ['cat', 'dog', 'fish', 'bird'],
    },
    birthdate: {
      type: 'string',
      format: 'date',
    },
    owner: {
      title: 'Pet Owner',
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'object',
          required: ['first', 'last'],
          properties: {
            first: {
              type: 'string',
              minLength: 1,
              maxLength: 25,
            },
            last: {
              type: 'string',
              minLength: 1,
              maxLength: 25,
            },
          },
        },
        address: {
          title: 'Address',
          type: 'object',
          properties: {
            street1: {
              type: 'string',
            },
            street2: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            state: {
              type: 'string',
            },
            postalCode: {
              type: 'string',
            },
          },
        },
      },
    },
  },
}
const syncValue = jsf.generate(schema)
console.log('syncValue', syncValue)
const bodyJson = ref({})

import SfcPlugin from '@/views/plugin/index.vue'
const showPlugin = ref(false)

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
    <!-- <div v-for="(item, index) in enablePlugins" v-show="false">
      {{ item.name }}
      <custom-form :sfc="item.sfc"></custom-form>
    </div>
    <send-form></send-form> -->
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
