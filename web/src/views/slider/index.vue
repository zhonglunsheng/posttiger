<template>
  <div style="margin-bottom: 5px; display: flex; justify-content: flex-end">
    <el-button icon="CirclePlus" @click="addOrUpdateDirectory">
      添加项目
    </el-button>
  </div>
  <!-- <pre> {{ JSON.stringify(data, null, 2) }} </pre> -->
  <el-tree
    :allow-drag="
      () => {
        return true
      }
    "
    :allow-drop="allowDrop"
    :data="data"
    :default-expand-all="false"
    draggable
    :expand-on-click-node="true"
    @node-drag-end="handleDrag"
    @node-click="nodeClick"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    node-key="id"
    :default-expanded-keys="defaultExpandedKeys"
  >
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span>
          <el-icon v-if="node.data.nodeType === 'api'">
            <Document />
          </el-icon>
          <el-icon v-else>
            <Folder />
          </el-icon>

          <el-text truncated>
            <!--            如果字符过长则省略-->
          </el-text>

          {{
            node.label && node.label.length > 40
              ? node.label.substring(0, 40) + '...'
              : node.label
          }}

          <!--          <el-dropdown-->
          <!--            ref="dropdown1"-->
          <!--            trigger="hover"-->
          <!--            style="margin-right: 30px"-->
          <!--          >-->
          <!--            <span class="el-dropdown-link">-->
          <!--              {{-->
          <!--                node.label && node.label.length > 40-->
          <!--                  ? node.label.substring(0, 40) + '...'-->
          <!--                  : node.label-->
          <!--              }}-->
          <!--            </span>-->
          <!--            <template #dropdown>-->
          <!--              <el-dropdown-menu>-->
          <!--                <el-dropdown-item-->
          <!--                  icon="Collection"-->
          <!--                  @click="addOrUpdateDirectory(node.data)"-->
          <!--                  v-if="node.data.nodeType === 'directory'"-->
          <!--                >-->
          <!--                  编辑-->
          <!--                </el-dropdown-item>-->
          <!--                <el-dropdown-item-->
          <!--                  icon="DocumentAdd"-->
          <!--                  @click="append(data, 'api')"-->
          <!--                  v-if="node.data.nodeType !== 'api'"-->
          <!--                >-->
          <!--                  新增接口-->
          <!--                </el-dropdown-item>-->
          <!--                <el-dropdown-item-->
          <!--                  icon="Collection"-->
          <!--                  @click="append(data, 'directory')"-->
          <!--                  v-if="node.data.nodeType !== 'api'"-->
          <!--                >-->
          <!--                  新增目录-->
          <!--                </el-dropdown-item>-->
          <!--                <el-dropdown-item-->
          <!--                  icon="DeleteFilled"-->
          <!--                  @click="remove(node, data)"-->
          <!--                >-->
          <!--                  删除-->
          <!--                </el-dropdown-item>-->
          <!--              </el-dropdown-menu>-->
          <!--            </template>-->
          <!--          </el-dropdown>-->
        </span>
        <span>
          <el-dropdown>
            <span class="el-dropdown-link">
              ...
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  icon="Collection"
                  @click="addOrUpdateDirectory(node.data)"
                  v-if="node.data.nodeType === 'directory'"
                >
                  编辑
                </el-dropdown-item>
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
import { ref, reactive, onMounted } from 'vue'
import { lib } from '@/utils/lib'
import bus from 'vue3-eventbus'
import { constant } from '@/utils/constant.js'

let data = ref(
  lib.util.buildTree(
    window.posttiger.db(constant.COLLECTION.API_LIST).collection.find(),
    0,
  ),
)

const handleDrag = (draggingNod, dropNode, ev) => {
  if (dropNode && draggingNod.data.id !== dropNode.data.id) {
    draggingNod.data.parentId = dropNode.data.id
    updateApiList()
  }
}

import { uid } from 'uid'
const append = (data, nodeType) => {
  let label = nodeType === 'api' ? '新增接口' : '新增目录'
  const newChild = {
    id: uid(),
    label: label,
    parentId: data.id,
    children: [],
    method: 'POST',
    nodeType: nodeType,
  }
  if (!data.children) {
    data.children = []
  }
  console.log(newChild)
  console.log(data)
  data.children.push(newChild)
  updateApiList()
}

const allowDrop = (draggingNode, dropNode, type) => {
  return dropNode.data.nodeType !== 'api'
}

const nodeClick = (node) => {
  if (node.nodeType === 'api') {
    bus.emit('openApiDetail', node)
  } else if (node.nodeType === 'directory') {
    bus.emit('openDirectoryDetail', node)
  }
}

function loadTreeDataFromDb() {
  data.value = lib.util.buildTree(
    window.posttiger.db(constant.COLLECTION.API_LIST).collection.find(),
    0,
  )
}

onMounted(() => {
  bus.on(constant.BUS.SAVE_API, () => {
    loadTreeDataFromDb()
  })
})

const updateApiList = () => {
  let copyData = JSON.parse(JSON.stringify(data.value))
  let convertArr = lib.util.treeToArray(copyData)
  console.log(data.value, 'convertArr')
  window.posttiger.db(constant.COLLECTION.API_LIST).cleanInsert(convertArr)
  let apiInfoList = window.posttiger
    .db(constant.COLLECTION.API_LIST)
    .collection.find()
  data.value = lib.util.buildTree(apiInfoList, 0)
}

// 增加添加项目弹框
import { ElMessage, ElMessageBox } from 'element-plus'
const remove = (node, data) => {
  ElMessageBox.alert('是否删除？', 'Title', {
    confirmButtonText: 'OK',
    callback: (action) => {
      console.log(action)
      if (action === 'confirm') {
        const parent = node.parent
        const children = parent.data.children || parent.data
        const index = children.findIndex((d) => d.id === data.id)
        children.splice(index, 1)
        updateApiList()
      }
    },
  })
}
const addOrUpdateDirectory = (itemInfo) => {
  console.log(itemInfo, 'itemInfo')
  ElMessageBox.prompt('请输入需要新增的目录名称', 'Tip', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
  })
    .then(({ value }) => {
      let newDirectory = {
        nodeType: 'directory',
        label: value,
        id: uid(),
        parentId: 0,
        children: [],
      }

      if (itemInfo?.id) {
        newDirectory = itemInfo
        newDirectory.label = value
      }
      window.posttiger
        .db(constant.COLLECTION.API_LIST)
        .insertOrUpdate({ id: newDirectory.id }, newDirectory)
      loadTreeDataFromDb()
      ElMessage({
        type: 'success',
        message: `操作成功`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
}

const defaultExpandedKeys = ref(
  window.localStorage.getItem('defaultExpandedKeys')
    ? JSON.parse(window.localStorage.getItem('defaultExpandedKeys'))
    : [1],
)

const nodeExpand = (data, node) => {
  // 节点展开时加入默认展开节点数组
  if (!defaultExpandedKeys.value.includes(node.data.id)) {
    defaultExpandedKeys.value.push(node.data.id)
  }
  console.log(data, defaultExpandedKeys.value)
  // 保存到localstorge
  window.localStorage.setItem(
    'defaultExpandedKeys',
    JSON.stringify(defaultExpandedKeys.value),
  )
}

const nodeCollapse = (data, node) => {
  // 节点关闭时删除默认展开节点数组
  let index = defaultExpandedKeys.value.indexOf(node.data.id)
  if (index > -1) {
    defaultExpandedKeys.value.splice(index, 1)
  }
  console.log(data, node)
  // 保存到localstorge
  window.localStorage.setItem(
    'defaultExpandedKeys',
    JSON.stringify(defaultExpandedKeys.value),
  )
}
</script>
<style>
.custom-tree-node {
  flex: 1;
  //border: #6c6c6c solid 1px;
  //height: 50px;
  //line-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  //font-weight: bold;
  //color: #409eff;
  padding-right: 8px;
}

.el-tree {
  --el-tree-node-content-height: 30px !important;
}

#shadow-root {
  --ninja-z-index: 9999 !important;
}
</style>
