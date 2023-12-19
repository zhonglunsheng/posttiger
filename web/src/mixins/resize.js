// myResizeMixin.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

export const myResizeMixin = {
  setup() {
    const dialogResizeFlag = ref(true)

    const handleEditorResize = (event) => {
      dialogResizeFlag = false
      setTimeout(() => {
        dialogResizeFlag = true
      }, 10)
    }

    onMounted(() => {
      window.addEventListener('resize', handleEditorResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleEditorResize)
    })

    return {
      dialogResizeFlag,
      handleEditorResize,
    }
  },
}
