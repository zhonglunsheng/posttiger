<template>
  <el-tabs
    v-model="editableTabsValue"
    type="card"
    editable
    class="demo-tabs"
    @edit="handleTabsEdit"
  >
    <el-tab-pane
      v-for="item in editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
    >
      <send-form :apiInfoProps="item.content"></send-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import SendForm from '@/views/send/index.vue'
let tabIndex = 2
const editableTabsValue = ref('2')
const editableTabs = ref([])

const handleTabsEdit = (targetName, action) => {
  if (action === 'add') {
    const newTabName = `${++tabIndex}`
    editableTabs.value.push({
      title: 'New Tab',
      name: newTabName,
      content: 'New Tab content',
    })
    editableTabsValue.value = newTabName
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

import bus from 'vue3-eventbus'
import { lib } from '@/utils/lib'
onMounted(() => {
  bus.on('openApiDetail', (node) => {
    let apiInfoItem = lib.config.getApiInfoById(node.id)
    // 判断是否存在 如果存在则不添加
    let existInfo = editableTabs.value.filter((item) => {
      return item.name == apiInfoItem.id
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

  bus.on('saveApi', (apiInfo) => {
    // 更新下标签名称
    let currentApiTabIndex = editableTabs.value.findIndex((item) => {
      return item.name == apiInfo.id
    })
    if (currentApiTabIndex > -1) {
      editableTabs.value[currentApiTabIndex]['title'] = apiInfo.label
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
})
</script>
