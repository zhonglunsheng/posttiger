import { ElMessage, ElMessageBox, ElNotification } from "element-plus"
import { lib } from "./lib.js"
import { constant } from "./constant.js"

export const init = () => {
  if (window.services) {
    if (!window.services.ui) {
      window.services.ui = {
        ElMessage,
        ElMessageBox,
        ElNotification,
      }
    }

    if (!window.services.constant) {
      window.services.constant = constant
    }
  }
}
