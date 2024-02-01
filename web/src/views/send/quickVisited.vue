<script setup>
import { constant } from '@/utils/constant.js'
import { ref } from 'vue'
import bus from 'vue3-eventbus'

const globalConfig = window.posttiger
  .db(constant.COLLECTION.GLOBAL_CONFIG)
  .collection.findOne()

const data = ref(globalConfig?.pluginsQuickList || [])

const openPlugin = (key) => {
  window.bus.emit(constant.BUS.OPEN_PLUGIN_MODAL, { id: key })
}
</script>

<template>
  <div style="margin: 5px">
    <el-button
      v-for="button in data"
      :key="button.key"
      :type="button.type"
      @click="openPlugin(button.key)"
      link
    >
      {{ button.text }}
    </el-button>
  </div>
</template>

<style scoped></style>
