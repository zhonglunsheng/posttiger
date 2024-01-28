<template>
  <el-autocomplete
    v-model="state"
    :fetch-suggestions="querySearch"
    popper-class="my-autocomplete"
    placeholder="Please input"
    @select="handleSelect"
    @click="clickInput"
    @keydown="clickInput"
    style="width: 100%"
  >
    <template #suffix>
      <el-icon class="el-input__icon" @click="handleIconClick">
        <edit />
      </el-icon>
    </template>
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
      <span class="link">{{ item.link }}</span>
    </template>
  </el-autocomplete>
</template>

<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import * as constants from 'constants'

const props = defineProps({
  data: String,
})

const state = ref(props.data)

const emit = defineEmits(['updateCurrentTabStatus'])
const change = (data) => {
  emit('updateCurrentTabStatus', data)
}
interface LinkItem {
  value: string
  link: string
}

watchEffect(() => {
  let changeValue = state.value
  emit('updateCurrentTabStatus', changeValue)
})
const links = ref<LinkItem[]>([])

let currentMouseClickPoint = 0
const clickInput = ($event) => {
  currentMouseClickPoint = $event.srcElement.selectionStart
  emit('updateCurrentTabStatus', state.value)
}

let currentInputValue = ''
const querySearch = (queryString: string, cb) => {
  // 使用正则表达式匹配 {{ 和 }}，并计数
  const openingBracketsCount = (queryString.match(/{/g) || []).length
  const closingBracketsCount = (queryString.match(/}/g) || []).length
  console.log(openingBracketsCount, closingBracketsCount)
  currentInputValue = state.value
  if (
    !queryString.includes('{') ||
    (openingBracketsCount == closingBracketsCount &&
      Math.abs(openingBracketsCount - closingBracketsCount) == 0)
  ) {
    cb([])
  } else {
    console.log(
      currentInputValue.slice(
        currentMouseClickPoint,
        currentMouseClickPoint + 1,
      ),
    )
    const results = queryString
      ? links.value.filter(
          createFilter(
            currentInputValue.slice(
              currentMouseClickPoint,
              currentMouseClickPoint + 1,
            ),
          ),
        )
      : links.value
    cb(results)
  }
}
const createFilter = (queryString) => {
  return (restaurant) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1
    )
  }
}
const loadAll = () => {
  let envVariableJson = window.posttiger
    .db('VariablePlugin')
    .collection.findOne()
  if (!envVariableJson || !envVariableJson.globalEnv) {
    return
  }
  let globalEnvKey = envVariableJson.globalEnv
  let globalEnvData = envVariableJson.envProps.globalEnv[globalEnvKey]

  let res = []
  for (let item in globalEnvData) {
    res.push({
      value: '{{' + item + '}}',
      link: globalEnvData[item],
    })
  }

  return res
}
const handleSelect = (item: LinkItem) => {
  console.log(
    'currentInputValue',
    currentInputValue,
    item.value,
    currentMouseClickPoint,
  )
  state.value =
    currentInputValue.slice(0, currentMouseClickPoint - 1) +
    item.value +
    currentInputValue.slice(currentMouseClickPoint)
}

const handleIconClick = (ev: Event) => {
  console.log(ev)
}

const loadingData = () => {
  links.value = loadAll()
}

import { constant } from '@/utils/constant.js'
onMounted(() => {
  loadingData()
  window.bus.on(constant.BUS.LOADING_VARIABLES, () => {
    console.log('constant.BUS.LOADING_VARIABLES')
    loadingData()
  })
})
</script>

<style>
.my-autocomplete li {
  line-height: normal;
  padding: 7px;
}
.my-autocomplete li .name {
  text-overflow: ellipsis;
  overflow: hidden;
}
.my-autocomplete li .addr {
  font-size: 12px;
  color: #b4b4b4;
}
.my-autocomplete li .highlighted .addr {
  color: #ddd;
}
</style>
