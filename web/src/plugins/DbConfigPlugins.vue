<script setup>
import { ref, onMounted } from 'vue'
import { constant } from '@/utils/constant.js'

const collections = ref(window.db.collections.map((item) => item.name) || [])

const selectDbName = ref(null)

// 读取API
const editorContent = ref(
  JSON.stringify(
    window.posttiger.db('VariablePlugin').collection.findOne() || {},
    null,
    2,
  ),
)

const showEditor = ref(false)
const changeSelectDbName = (value) => {
  editorContent.value = JSON.stringify(
    window.posttiger.db(value).collection.find() || {},
    null,
    2,
  )
  showEditor.value = false
  setTimeout(() => {
    showEditor.value = true
  }, 100)
}

const saveVariable = () => {
  window.posttiger
    .db(selectDbName.value)
    .cleanInsert(JSON.parse(editorContent.value))
  window.services.ui.ElMessage.success('保存成功')
}
</script>

<template>
  <el-alert
    title="修改数据前，请先使用数据备份插件备份数据或者手动备份数据！！！"
    type="error"
    effect="dark"
  ></el-alert>
  <br />
  <el-select v-model="selectDbName" @change="changeSelectDbName">
    <el-option v-for="(item, index) in collections" :value="item">
      {{ item }}
    </el-option>
  </el-select>
  <el-button @click="saveVariable">保存</el-button>

  <el-row :gutter="20" v-if="showEditor" style="margin-top: 5px">
    <el-col :span="24">
      <div style="height: 80vh">
        <Editor
          language="json"
          :code="editorContent"
          @changeData="
            (value) => {
              editorContent = value
            }
          "
        ></Editor>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped></style>
