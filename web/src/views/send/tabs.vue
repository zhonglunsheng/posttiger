<template>
  <el-tabs
    v-model="editableTabsValue"
    type="card"
    editable
    class="demo-tabs"
    @tab-remove="tabRemove"
    @edit="handleTabsEdit"
  >
    <el-tab-pane
      v-for="item in editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
    >
      <template #label>
        <span class="custom-tabs-label">
          <el-icon v-if="notSaveApi(item.name)">
            <WarningFilled color="#F56C6C" />
          </el-icon>
          <el-icon v-else-if="item.content?.nodeType === 'api'">
            <DocumentAdd />
          </el-icon>

          <span>&nbsp;{{ item.title }}</span>
        </span>
      </template>
      <send-form :apiInfoProps="item.content"></send-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import {
  computed,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watchEffect,
} from 'vue'
import bus from 'vue3-eventbus'
import { lib } from '@/utils/lib'
import SendForm from '@/views/send/index.vue'
import { uid } from 'uid'
import { constant } from '@/utils/constant.js'

let tabIndex = 2

const editableTabs = ref(window.posttiger.db('apiTabs').collection.find() || [])
const editableTabsValue = ref(
  window.posttiger
    .db('apiTabConfig')
    .collection.findOne({ type: 'currentActiveTabName' })?.data || '2',
)
function addNewApiTab() {
  const id = uid()
  editableTabs.value.push({
    title: '新增接口',
    name: id,
    content: {
      id: id,
      label: '新增接口',
      parentId: 0,
      children: [],
      method: 'POST',
      nodeType: 'api',
    },
  })
  editableTabsValue.value = id
}

const tabClick = (pane, ev) => {
  console.log(pane.paneName, 'tabChange')
  // 从tab列表中获取当前api信息

  console.log(pane.paneName)
  let currentApiInfo =
    editableTabs.value.filter((tab) => tab.name === pane.paneName)?.[0] ||
    undefined
  // let currentApiInfo = window.posttiger
  //   .db('apiList')
  //   .collection.findOne({ id: pane.paneName })

  if (!currentApiInfo) {
    currentApiInfo =
      window.posttiger.db('apiTabs').collection.findOne({ name: pane.paneName })
        ?.content || {}
  }
  console.log(currentApiInfo, 'currentApiInfo')
  window.posttiger
    .db('apiTabConfig')
    .insertOrUpdate(
      { type: 'currentApiInfo' },
      { type: 'currentApiInfo', data: currentApiInfo },
    )

  window.posttiger
    .db('apiTabConfig')
    .insertOrUpdate(
      { type: 'currentActiveTabName' },
      { type: 'currentActiveTabName', data: editableTabsValue.value },
    )
}

watchEffect(() => {
  const currentTabName = editableTabsValue.value
  console.log('当前激活tab名称', currentTabName)
  tabClick(
    {
      paneName: currentTabName,
    },
    null,
  )
})

const handleTabsEdit = (targetName, action) => {
  if (action === 'add') {
    addNewApiTab()
  } else if (action === 'remove') {
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }

    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
  }
}

const tabRemove = (tab) => {
  bus.emit('tabRemove', tab)
}

const notSaveApi = (apiId) => {
  return !window.posttiger.db('apiList').collection.findOne({ id: apiId })
}

onMounted(() => {
  bus.on('openApiDetail', (node) => {
    console.log(node, 'openApiDetail')
    let apiInfoItem = window.posttiger
      .db('apiList')
      .collection.findOne({ id: node.id })

    // 判断是否存在 如果存在则不添加
    let existInfo = editableTabs.value.filter((item) => {
      return item.name === apiInfoItem.id
    })
    if (!existInfo.length) {
      editableTabs.value.push({
        title: apiInfoItem.label,
        name: apiInfoItem.id,
        content: apiInfoItem,
      })
    }

    editableTabsValue.value = apiInfoItem.id
  })

  bus.on('*', (type, e) => {
    if (
      [
        'openApiDetail',
        'saveApi',
        'tabRemove',
        constant.BUS.NEW_API_TAB,
        constant.BUS.CLONE_API,
      ].includes(type)
    ) {
      console.log('监听到了')
      // 持久化editableTabs
      window.posttiger.db('apiTabs').cleanInsert(editableTabs.value)
    }
  })

  bus.on('saveApi', (apiInfo) => {
    // 更新下标签名称
    let currentApiTabIndex = editableTabs.value.findIndex((item) => {
      return item.name == apiInfo.id
    })
    if (currentApiTabIndex > -1) {
      editableTabs.value[currentApiTabIndex]['title'] = apiInfo.label
    } else {
      // 打开新的标签页
      editableTabs.value.push({
        title: apiInfo.label,
        name: apiInfo.id,
        content: apiInfo,
      })
      editableTabsValue.value = apiInfo.id
    }
  })

  bus.on('keymap-save-current-api-tabs', () => {
    console.log('recive keymap-save-current-api-tabs event')
    // 保存当前API
    try {
      bus.emit('test', editableTabsValue.value)
    } catch (error) {
      console.log(error)
    }
  })

  bus.on(constant.BUS.NEW_API_TAB, () => {
    addNewApiTab()
  })

  bus.on(constant.BUS.CLONE_API, () => {
    const id = uid()
    let currentApiInfo = window.posttiger
      .db('apiTabConfig')
      .collection.findOne({ type: 'currentApiInfo' })

    console.log(currentApiInfo)
    if (!currentApiInfo || !currentApiInfo.data) {
      return
    }

    currentApiInfo = currentApiInfo.data.content
    let copyCurrentApiInfo = JSON.parse(JSON.stringify(currentApiInfo))
    debugger
    copyCurrentApiInfo.label = copyCurrentApiInfo.label + '_copy'
    copyCurrentApiInfo.id = id

    editableTabs.value.push({
      title: copyCurrentApiInfo.label,
      name: id,
      content: copyCurrentApiInfo,
    })
    editableTabsValue.value = id
  })

  bus.on(constant.BUS.ADD_TO_THE_RECYCLE_BIN, (apiInfo) => {
    console.log('ADD_TO_THE_RECYCLE_BIN', apiInfo)
    // 添加到回收站，自动刷新当前tabs列表
    const id = apiInfo.id
    // 根据ID移除元素
    editableTabs.value = editableTabs.value.filter((tab) => tab.name !== id)
    // 当前激活tab为最后一个元素，如果tabs为空，则设置为空
    if (editableTabs.value.length === 0) {
      editableTabsValue.value = ''
      return
    }
    // 当前激活tab为最后一个元素
    editableTabsValue.value =
      editableTabs.value[editableTabs.value.length - 1]?.name
  })

  bus.on(constant.BUS.CLOSE_ALL_TAB_LIST, () => {
    // 未保存的api放入回收站
    editableTabs.value.forEach((tab) => {
      if (notSaveApi(tab.name)) {
        tab.content.parentId = constant.COMMON.RECYCLE_ID
        window.posttiger
          .db(constant.COLLECTION.API_LIST)
          .insertOrUpdate({ id: tab.content.id }, tab.content)
        bus.emit(constant.BUS.SAVE_API, tab.content)
      }
    })
    editableTabs.value = []
    editableTabsValue.value = ''
  })
})
</script>
