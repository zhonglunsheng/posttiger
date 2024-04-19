<script setup>
const backData = () => {
  window.axios
    .post('http://localhost:3000/backup', {
      data: window.db.serialize(),
    })
    .then((res) => {
      window.services.ui.ElMessage.success('数据备份云端成功')
    })
}

const syncData = () => {
  window.axios.get('http://localhost:3000/syncData').then((res) => {
    window.db.loadJSON(res.data)
    window.db.saveDatabase()
    window.services.ui.ElMessage.success('同步数据成功，刷新浏览器生效')
  })
}
</script>

<template>
  <el-button @click="backData">备份数据</el-button>
  <el-button @click="syncData">同步最新数据</el-button>
</template>

<style scoped></style>
