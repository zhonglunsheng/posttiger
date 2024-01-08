<template>
  <div id="vditorContainer">
    <VueVditor
      :options="options"
      @after="handleAfter"
      class="editor"
      @input="changeData"
    ></VueVditor>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  options: Object,
})
const state = ref(props.data)
const options = ref({
  height: '70vh',
  theme: 'dark',
  cache: {
    enable: false,
    id: '1111',
  },
  upload: {
    url: window.posttiger.appUrl + '/upload/images',
    linkToImgUrl: window.posttiger.appUrl + '/upload/images',
    linkToImgCallback: (responseText) => {
      console.log(responseText)
    },
    success: (editor, msg) => {
      console.log('success', editor, msg)
      console.log(vueEditor)
      let res = JSON.parse(msg)
      let succMap = res.data.succMap
      for (let fileName in succMap) {
        vueEditor.insertValue(`![${fileName}](${succMap[fileName]})`)
      }

      return true
    },
  },
  cdn: window.posttiger.appUrl + '/vditor@3.8.18',
  ...props.options,
})

const emit = defineEmits(['changeData'])

let vueEditor = null
function handleAfter(editor) {
  vueEditor = editor
  changeData()
}

/**
 * 回调文本内容和实例方法给子组件
 */
const changeData = () => {
  emit('changeData', vueEditor)
}
</script>

<style>
.vditor-reset {
  color: #e8ebee !important;
}
</style>
