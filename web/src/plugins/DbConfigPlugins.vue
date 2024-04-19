<script setup>
import { ref, onMounted } from 'vue'

const collections = ref(window.db.collections.map((item) => item.name) || [])

const selectDbName = ref(window.localStorage.getItem('selectDbName') || null)

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
  window.localStorage.setItem('selectDbName', selectDbName.value)
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

if (selectDbName.value) {
  changeSelectDbName(selectDbName.value)
}

const saveVariable = () => {
  window.posttiger
    .db(selectDbName.value)
    .cleanInsert(JSON.parse(editorContent.value))
  window.services.ui.ElMessage.success('保存成功')
}

const removeDb = () => {
  window.services.ui.ElMessageBox.confirm(
    '是否删除当前数据库节点' + selectDbName.value + '，请删除前进行备份',
    'Title',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    },
  )
    .then(() => {
      window.db.removeCollection(selectDbName.value)
      // 更新列表
      collections.value = window.db.collections.map((item) => item.name) || []
      setTimeout(() => {
        if (collections.value.length) {
          selectDbName.value = collections.value[0]
          changeSelectDbName(selectDbName.value)
        } else {
          selectDbName.value = ''
        }
      }, 1000)
    })
    .catch((e) => {
      console.log(e)
      window.services.ui.ElMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
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
  <el-button
    @click="removeDb"
    type="danger"
    style="margin-left: 5px"
    v-if="selectDbName"
  >
    删除数据库
  </el-button>

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
