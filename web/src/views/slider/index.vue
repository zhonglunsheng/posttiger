<template>
  <!-- <pre> {{ JSON.stringify(data, null, 2) }} </pre> -->
  <el-tree
    :allow-drag="
      () => {
        return true
      }
    "
    :allow-drop="allowDrop"
    :data="data"
    :default-expand-all="true"
    draggable
    :expand-on-click-node="false"
    @node-drag-end="handleDrag"
    @node-click="nodeClick"
    node-key="id"
  >
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-dropdown>
            <span class="el-dropdown-link">
              ...
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  icon="DocumentAdd"
                  @click="append(data, 'api')"
                  v-if="node.data.nodeType !== 'api'"
                >
                  新增接口
                </el-dropdown-item>
                <el-dropdown-item
                  icon="Collection"
                  @click="append(data, 'directory')"
                  v-if="node.data.nodeType !== 'api'"
                >
                  新增目录
                </el-dropdown-item>
                <el-dropdown-item
                  icon="DeleteFilled"
                  @click="remove(node, data)"
                >
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- <a @click="append(data)">Append</a>
          <a style="margin-left: 8px" @click="remove(node, data)">Delete</a> -->
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { lib } from '@/utils/lib'

let apiInfoList = lib.config.getApiInfoList()

let data = reactive(lib.util.buildTree(apiInfoList, 0))

const handleDrag = (draggingNod, dropNode, ev) => {
  if (dropNode) {
    draggingNod.data.parentId = dropNode.data.id
    updateApiList()
  }
}

let id = 100
const append = (data, nodeType) => {
  let label = nodeType === 'api' ? '新增接口' : '新增目录'
  const newChild = {
    id: id++,
    label: label,
    parentId: data.id,
    children: [],
    nodeType: nodeType,
  }
  if (!data.children) {
    data.children = []
  }
  data.children.push(newChild)
  updateApiList()
}

import { ElMessage, ElMessageBox } from 'element-plus'
const remove = (node, data) => {
  ElMessageBox.alert('是否删除？', 'Title', {
    confirmButtonText: 'OK',
    callback: (action) => {
      console.log(action)
      if (action == 'confirm') {
        const parent = node.parent
        const children = parent.data.children || parent.data
        const index = children.findIndex((d) => d.id === data.id)
        children.splice(index, 1)
        updateApiList()
      }
    },
  })
}

const allowDrop = (draggingNode, dropNode, type) => {
  return dropNode.data.nodeType !== 'api'

  //   (
  //     (draggingNode.data.nodeType == 'api' && dropNode.data.nodeType == 'api') ||
  //     (draggingNode.data.nodeType == 'directory' &&
  //       dropNode.data.nodeType == 'api')
  //   )
}

import bus from 'vue3-eventbus'
const nodeClick = (node) => {
  if (node.nodeType === 'api') {
    bus.emit('openApiDetail', node)
  } else if (node.nodeType === 'directory') {
    bus.emit('openDirectoryDetail', node)
  }
}

onMounted(() => {
  bus.on('saveApi', (apiInfo) => {
    console.log('api保存事件', apiInfo)
    let apiInfoList = lib.config.getApiInfoList()
    console.log(apiInfoList)
    Object.assign(data, lib.util.buildTree(apiInfoList, 0))
  })
})

const updateApiList = () => {
  lib.config.updateApiInfoList(lib.util.treeToArray(data))
  let apiInfoList = lib.config.getApiInfoList()
  console.log(apiInfoList)
  Object.assign(data, lib.util.buildTree(apiInfoList, 0))
  console.log(data)
}
</script>
<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
