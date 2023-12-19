<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import CustomForm from '@/components/CustomForm.vue'
import SendForm from '@/views/send/index.vue'
import SendFormTabs from '@/views/send/tabs.vue'
import Slider from '@/views/slider/index.vue'
import bus from 'vue3-eventbus'

const sfc = ref(`
<template>
  <div>

  </div>
</template>
<script>
  export default {
    components: {},
    props: [],
    data() {
      return {
      }
    },
    computed: {},
    watch: {
    },
    created() {},
    mounted() {
      window.posttiger = {}
      window.posttiger.plugins = {
        't1': {
          execute: () => {
            console.log('t1 plugins')
          }
        }
      }
    },
    unmounted () {
        
    },
    methods: {

    },
  }

`)

const sfc2 = ref(`
<template>
  <div>
sfcssdd
  </div>
</template>
<script>
  export default {
    components: {},
    props: [],
    data() {
      return {
      }
    },
    computed: {},
    watch: {
    },
    created() {},
    mounted() {
      window.posttiger = {}
      window.posttiger.plugins = {
        't2': {
          execute: (cb) => {
            console.log('t1 plugins')
            return 'res t1 plugins'
          }
        }
      }
    },
    unmounted () {
      window.posttiger = {}
    },
    methods: {

    },
  }
`)

const pluginsConfigSwitch = () => {
  status.value = !status.value
  // delete window.posttiger.plugins['t1']

  // 模拟发送请求事件
  let plugins = window.posttiger.plugins
  for (let plugin in plugins) {
    let res = plugins[plugin]['execute']()
    console.log(res)
  }
}

const status = ref(true)

// 初始化插件
if (!window.posttiger) {
  window.posttiger = {}
}
if (!window.posttiger.plugins) {
  window.posttiger.plugins = []
}

// 注册插件
import { lib } from '@/utils/lib'
let plugins = lib.config.getConfigNestedValue('plugins') || []
console.log(plugins)
const enablePlugins = reactive([])
window.posttiger.plugins = []
window.posttiger.register = (plugin) => {
  // 判断当前plugins是否存在插件名称 存在则删除 重新注册
  let dbPluginInfo = plugins.filter((p) => {
    return p.name === plugin.name
  })
  if (!dbPluginInfo.length) {
    return
  }
  let existPluginInfo = window.posttiger.plugins.filter((p) => {
    return p.name === plugin.name
  })
  if (existPluginInfo.length) {
    // 移除
    window.posttiger.plugins = window.posttiger.plugins.filter((p) => {
      return p.name !== plugin.name
    })
  }
  // 加入 判断是否启用
  if (dbPluginInfo[0].enable) {
    window.posttiger.plugins.push(plugin)
  }
}

for (let item of plugins) {
  if (item?.enable) {
    window.posttiger.plugins.push(item)
  }
}

import 'ninja-keys'
const hotkeys = ref([
  {
    id: '保存当前API',
    title: '保存当前API',
    hotkey: 'ctrl+s',
    handler: () => {
      console.log('保存当前API')
      bus.emit('keymap-save-current-api-tabs', {})
    },
  },
  {
    id: 'Open Projects',
    title: 'Open Projects',
    hotkey: 'ctrl+shift+w+q',
    handler: () => {
      console.log('navigation to projects')
    },
  },
  {
    id: 'Theme',
    title: 'Change theme...',
    children: [
      {
        id: 'Light Theme',
        title: 'Change theme to Light',
        handler: () => {
          console.log('theme light')
        },
      },
      {
        id: 'Dark Theme',
        title: 'Change theme to Dark',
        keywords: 'lol',
        handler: () => {
          console.log('theme dark')
        },
      },
    ],
  },
])
</script>

<template>
  <div>
    <ninja-keys
      @selected="selected"
      @change="change"
      :placeholder="placeholder"
      :data="hotkeys"
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
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <Slider></Slider>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <!-- <send-form></send-form> -->
          <send-form-tabs></send-form-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
