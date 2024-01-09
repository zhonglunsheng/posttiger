<script setup>
import { ref } from 'vue'

const curlData = ref('')

const curlParse = () => {
  window.axios
    .post(window.posttiger.appUrl + '/curlParse', {
      curl: curlData.value.replaceAll('\t', '  '),
    })
    .then((res) => {
      let parseData = res.data.data
      console.log(parseData)
      // 保存新的API
      let apiInfo = {
        id: window.lib.uid(),
        headers: parseData.header
          ? JSON.stringify(parseData.header, null, 2)
          : '',
        label: parseData.url,
        nodeType: 'api',
        parentId: 0,
        requestBody: parseData.data
          ? JSON.stringify(parseData.data, null, 2)
          : '',
        queryParams: parseData.params
          ? JSON.stringify(parseData.params, null, 2)
          : '',
        requestHeader: '',
        method: parseData.method,
        url: parseData.url,
        children: [],
      }
      console.log(apiInfo)
      window.posttiger
        .db('apiList')
        .insertOrUpdate({ url: apiInfo.url }, apiInfo)
      window.bus.emit('saveApi', apiInfo)
      window.services.ui.ElMessage.success('导入成功')
    })
}
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="20">
      <el-input
        v-model="curlData"
        :autosize="{ minRows: 20 }"
        type="textarea"
        placeholder="Please input"
      />
    </el-col>
    <el-col :span="4">
      <el-button type="primary" @click="curlParse">解析curl命令</el-button>
    </el-col>
  </el-row>
</template>

<style scoped></style>
