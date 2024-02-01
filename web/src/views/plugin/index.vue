<template>
  <!--  <el-button @click="visible = true">-->
  <!--    Open Dialog with customized header-->
  <!--  </el-button>-->
  <el-dialog
    v-model="visible"
    :fullscreen="fullscreen"
    draggable
    :close-on-click-modal="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">{{ apiPlugin.name }}</h4>
        <el-button
          @click="openFullScreen"
          size="small"
          text
          style="margin-right: 10px"
        >
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>
    </template>
    <!--    {{ apiPlugin.sfc }}-->
    <custom-form :sfc="apiPlugin.sfc"></custom-form>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import CustomForm from '@/components/CustomForm.vue'
import { ElButton, ElDialog } from 'element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { constant } from '@/utils/constant.js'
const props = defineProps({
  id: String,
})

console.log('props.id', props.id, typeof props.id)
// 获取插件
let pluginInfo = window.posttiger
  .db(constant.COLLECTION.API_PLUGINS)
  .collection.findOne({ id: props.id || 2 }) || {
  sfc: '<template>没有相关插件</template>',
  name: '插件错误',
}
console.log(
  'allPlugins',
  window.posttiger.db(constant.COLLECTION.API_PLUGINS).collection.find(),
)

console.log('pluginInfo', pluginInfo)

const apiPlugin = ref(pluginInfo)

const visible = ref(true)
const fullscreen = ref(true)
const openFullScreen = () => {
  fullscreen.value = !fullscreen.value
}
</script>

<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
