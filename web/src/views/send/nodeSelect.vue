<script setup>
import { ref, onMounted } from 'vue'
import { constant } from '@/utils/constant.js'

const currentActiveApiId = window.posttiger
  .db('apiTabConfig')
  .collection.findOne({ type: 'currentActiveTabName' })?.data

const currentActiveApiParentId = window.posttiger.node.collection.findOne({
  id: currentActiveApiId,
})?.parentId

const selectDirectoryNodeName = ref(currentActiveApiParentId || null)

let directoryNode = window.posttiger.node.collection.find({
  nodeType: 'directory',
})

directoryNode = directoryNode.map((item) => {
  delete item.children
  return {
    id: item.id,
    label: item.label,
  }
})

const collections = ref(directoryNode || [])

const changeSelect = (value) => {
  console.log(value)
  window.bus.emit(constant.BUS.NODE_REMOVE_DIRECTORY, { parentId: value })
}
</script>

<template>
  <el-select
    v-model="selectDirectoryNodeName"
    @change="changeSelect"
    style="width: 100%"
    filterable
    clearable
  >
    <el-option
      v-for="(item, index) in collections"
      :value="item.id"
      :label="item.label"
    ></el-option>
  </el-select>
</template>

<style scoped></style>
