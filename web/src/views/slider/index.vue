<template>
  <el-row>
    <el-col :span="12">
      <el-input
        placeholder="输入接口名称或url进行搜索"
        clearable
        v-model="queryApiInfo"
        @keydown.enter="queryApi"
      ></el-input>
    </el-col>
    <el-col :span="12">
      <div style="margin-bottom: 5px; display: flex; justify-content: flex-end">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="批量操作"
          placement="top"
          v-if="checkNodeList.length > 0"
        >
          <a @click="OperationNode" style="cursor: pointer; margin-right: 5px">
            <el-icon size="20"><Operation /></el-icon>
          </a>
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="编辑"
          placement="top"
        >
          <a @click="editNode" style="cursor: pointer; margin-right: 5px">
            <el-icon size="20"><Edit /></el-icon>
          </a>
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="添加项目"
          placement="top"
        >
          <a @click="addOrUpdateDirectory" style="cursor: pointer">
            <el-icon size="20"><CirclePlus /></el-icon>
          </a>
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="Github"
          placement="top"
        >
          <a @click="goToGithub" style="cursor: pointer; margin-left: 5px">
            <el-icon size="20"><Promotion /></el-icon>
          </a>
        </el-tooltip>
      </div>
    </el-col>
  </el-row>

  <!-- <pre> {{ JSON.stringify(data, null, 2) }} </pre> -->
  <div style="height: 80vh; overflow-y: auto" class="el-scrollbar sidebar">
    <el-tree
      :allow-drag="
        () => {
          return true
        }
      "
      :allow-drop="allowDrop"
      :data="apiTreeNodeData"
      :default-expand-all="false"
      draggable
      :expand-on-click-node="true"
      @node-drag-end="handleDrag"
      @node-click="nodeClick"
      @node-expand="nodeExpand"
      @node-collapse="nodeCollapse"
      node-key="id"
      :default-expanded-keys="defaultExpandedKeys"
      :show-checkbox="showCheckbox"
      @check-change="multiCheck"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>
            <el-icon v-if="node.data.nodeType === 'api'">
              <Document />
            </el-icon>
            <el-icon v-else-if="node.data.nodeType === 'case'">
              <StarFilled />
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
                    v-if="node.data.nodeType === 'directory'"
                  >
                    新增接口
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="Collection"
                    @click="append(data, 'directory')"
                    v-if="node.data.nodeType === 'directory'"
                  >
                    新增目录
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="DeleteFilled"
                    @click="remove(data.id)"
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { lib } from '@/utils/lib'
import bus from 'vue3-eventbus'
import { constant } from '@/utils/constant.js'

const showCheckbox = ref(false)
const checkNodeList = ref([])
const multiCheck = (data, nodeCheckStatus) => {
  if (!nodeCheckStatus) {
    checkNodeList.value = checkNodeList.value.filter((item) => {
      return item !== data.id
    })
  } else {
    checkNodeList.value.push(data.id)
  }
  console.log(checkNodeList)
}

const OperationNode = () => {
  ElMessageBox.confirm('是否批量删除接口，不删除目录？', 'Title', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
  })
    .then(() => {
      checkNodeList.value.forEach((item) => {
        let apiInfo = window.posttiger
          .db(constant.COLLECTION.API_LIST)
          .collection.findOne({ id: item })
        if (apiInfo.nodeType === 'api') {
          window.posttiger
            .db(constant.COLLECTION.API_LIST)
            .collection.remove(apiInfo)
        }
      })
      checkNodeList.value = []
      apiTreeNodeData.value = window.posttiger.node.getTreeNode()
    })
    .catch((e) => {
      console.log(e)
      ElMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
}

const editNode = () => {
  showCheckbox.value = !showCheckbox.value
}

const queryApiInfo = ref('')

let apiTreeNodeData = ref(
  lib.util.buildTree(
    window.posttiger.db(constant.COLLECTION.API_LIST).collection.find(),
    0,
  ),
)

const queryApi = (value) => {
  value = queryApiInfo.value
  if (!value) {
    apiTreeNodeData.value = window.posttiger.node.getTreeNode()
    return
  }
  let filterData = [
    ...window.posttiger
      .db(constant.COLLECTION.API_LIST)
      .collection.find()
      .filter((item) => {
        return item.label.includes(value) || item.url?.includes(value)
      }),
  ]

  // 搜索结果的父节点也要展示
  let totalParentIds = []
  function findTotalParentIds(totalParentIds, filterData) {
    filterData.forEach((item) => {
      console.log(item)
      if (!item.parentId || item.parentId === 0) {
        return
      }
      let parentData = [
        ...window.posttiger
          .db(constant.COLLECTION.API_LIST)
          .collection.find({ id: item.parentId }),
      ]
      if (!parentData || !parentData.length) {
        return
      }
      totalParentIds.push(item.parentId)
      findTotalParentIds(totalParentIds, parentData)
    })
  }

  findTotalParentIds(totalParentIds, filterData)
  let allApiIdInfo = [...totalParentIds]
  allApiIdInfo = allApiIdInfo.concat(filterData.map((item) => item.id))
  filterData = JSON.parse(
    JSON.stringify(
      window.posttiger
        .db(constant.COLLECTION.API_LIST)
        .collection.find()
        .filter((item) => {
          return allApiIdInfo.includes(item.id)
        }),
    ),
  )
  apiTreeNodeData.value = lib.util.buildTree(filterData, 0)
}

const handleDrag = (draggingNod, dropNode, ev) => {
  if (dropNode && draggingNod.data.id !== dropNode.data.id) {
    draggingNod.data.parentId = dropNode.data.id
    updateApiList()
  }
}

import { uid } from 'uid'
const append = (data, nodeType) => {
  let label = nodeType === 'api' ? '新增接口' : '新增目录'

  function addData(label) {
    let id = uid()
    const newChild = {
      id: id,
      label: label,
      parentId: data.id,
      children: [],
      method: 'POST',
      nodeType: nodeType,
    }
    if (!data.children) {
      data.children = []
    }
    window.posttiger
      .db(constant.COLLECTION.API_LIST)
      .insertOrUpdate({ id: id }, newChild)
    updateApiList()
    // 新增接口后默认打开详情页面
    nodeClick({ nodeType: nodeType })
  }

  if (label === '新增目录') {
    ElMessageBox.prompt('请输入目录名称', 'Tip', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    })
      .then(({ value }) => {
        addData(value)
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Input canceled',
        })
      })
  } else {
    addData(label)
  }
}

const allowDrop = (draggingNode, dropNode, type) => {
  return dropNode.data.nodeType !== 'api'
}

const nodeClick = (node) => {
  if (node.nodeType === 'api') {
    bus.emit(constant.BUS.OPEN_API_DETAIL, { id: node.id })
  } else if (node.nodeType === 'directory') {
    bus.emit('openDirectoryDetail', node)
  }
}

function loadTreeDataFromDb() {
  apiTreeNodeData.value = window.posttiger.node.getTreeNode()
}

onMounted(() => {
  bus.on(constant.BUS.SAVE_API, () => {
    loadTreeDataFromDb()
  })

  bus.on(constant.BUS.REMOVE_API_ACTION, (node) => {
    // 获取节点ID信息
    remove(node.id)
  })

  bus.on(constant.BUS.REMOVE_API_EVENT, (node) => {
    // 获取节点ID信息
    window.posttiger.node.deleteAllNodeById(node.id)
  })

  bus.on(constant.BUS.REFRESH_API_TREE_NODE, () => {
    console.log('start refresh node')
    loadTreeDataFromDb()
    console.log('end refresh node')
  })

  bus.on(constant.BUS.REMOVE_ALL_API_BY_NODE_ID, (nodeId) => {
    // 获取节点ID信息
    window.posttiger.node.deleteAllNodeById(nodeId)
  })
})

/**
 * 重新从数据库api列表获取到所有数据，然后构建一颗树型结构
 */
const updateApiList = () => {
  apiTreeNodeData.value = window.posttiger.node.getTreeNode()
}

// 增加添加项目弹框
import { ElMessage, ElMessageBox } from 'element-plus'
const remove = (apiId) => {
  ElMessageBox.alert('是否删除？', 'Title', {
    confirmButtonText: 'OK',
    callback: (action) => {
      console.log(action)
      if (action === 'confirm') {
        window.posttiger.node.deleteAllNodeById(apiId)
        apiTreeNodeData.value = window.posttiger.node.getTreeNode()
        bus.emit(constant.BUS.REMOVE_API_EVENT, { id: apiId })
      }
    },
  })
}

const goToGithub = () => {
  window.open('https://github.com/zhonglunsheng/posttiger', '_blank')
}
const addOrUpdateDirectory = (itemInfo) => {
  console.log(itemInfo, 'itemInfo')
  ElMessageBox.prompt('请输入目录名称', 'Tip', {
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
