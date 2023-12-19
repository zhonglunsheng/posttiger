<template>
  <div class="box-card" style="margin-top: 10px">
    <el-input
      v-model="queryName"
      placeholder="关键字搜索"
      clearable
      style="width: 200px; margin: 5px"
    />

    <el-button type="primary" @click="add">新增脚本</el-button>

    <el-button type="primary" @click="addFunc">新增函数</el-button>
    <div class="margin-top">
      <el-row :gutter="20">
        <el-col :span="12" v-for="(item, index) in filterData" :key="index">
          <el-card style="margin-top: 10px">
            <el-button type="warning" @click="edit(item)">编辑</el-button>
            <el-button type="primary" @click="copy(item)">复制</el-button>
            <el-popconfirm
              title="Are you sure to delete this?"
              @confirm="deleteData(item)"
            >
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>
            <el-button type="success" @click="onRun(item)">运行</el-button>
            <br />
            <p>序号：{{ item.id }}</p>
            <p>名称：{{ item.basicForm.name }}</p>
            <p>描述：{{ item.basicForm.desc }}</p>
            <p>类型：{{ item.basicForm.codeType }}</p>
            <p v-if="item.createTime">
              创建时间：{{ lib.util.getDateTimeStr(item.createTime) }}
            </p>
            <p v-if="item.updateTime">
              更新时间：{{ lib.util.getDateTimeStr(item.updateTime) }}
            </p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>

  <el-dialog
    v-model="dialogFormVisible"
    :fullscreen="true"
    @close="refresh"
    v-if="dialogResizeFlag"
  >
    <el-row :gutter="20">
      <el-col :span="18">
        <el-divider content-position="center">
          {{ scriptLanguage }}脚本编写
        </el-divider>
        <div style="height: 70vh" v-if="codeEditorFlag">
          <Editor
            @changeData="changeData"
            :language="scriptLanguage"
            :code="codeForm.code"
            v-if="dialogFormVisible"
          ></Editor>
        </div>

        <el-row :gutter="20">
          <el-col :span="24" v-if="layoutConfig.preScriptWindow">
            <el-divider content-position="center">前置脚本</el-divider>

            <div
              style="
                height: 50vh;
                width: 100%;
                margin-top: 10px;
                margin-bottom: 5px;
              "
            >
              <Editor
                @changeData="
                  (value) => {
                    codeForm.preScriptContent = value
                  }
                "
                language="javascript"
                :code="codeForm.preScriptContent"
              ></Editor>
            </div>
          </el-col>

          <el-col :span="24" v-if="layoutConfig.debugWindow">
            <el-row>
              <el-col :span="24">
                <el-button
                  @click="debugCode"
                  type="warning"
                  style="float: right; margin: 5px"
                >
                  运行调试
                </el-button>
              </el-col>
            </el-row>
            <div
              style="
                height: 50vh;
                width: 100%;
                margin-top: 10px;
                margin-bottom: 5px;
              "
            >
              <Editor
                language="text"
                :code="codeRunResult"
                v-if="editorVisitor"
              ></Editor>
            </div>
          </el-col>

          <el-col :span="24" v-if="layoutConfig.apiWindow">
            <el-divider content-position="center">API文档</el-divider>

            <div
              style="
                height: 50vh;
                width: 100%;
                margin-top: 10px;
                margin-bottom: 5px;
              "
            >
              <Editor
                @changeData="
                  (value) => {
                    codeApi = value
                  }
                "
                language="text"
                :code="codeApi"
                v-if="customEditor"
              ></Editor>
            </div>
            >
          </el-col>

          <el-col :span="24" v-if="layoutConfig.hotKeyWindow">
            <el-divider content-position="center">绑定热key</el-divider>
            <div style="height: 80vh">
              <Editor
                @changeData="changeHotKeyData"
                language="json"
                :code="codeForm.hostKey"
                v-if="dialogFormVisible"
              ></Editor>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="6">
        <el-divider content-position="center">基础配置</el-divider>

        <VueForm
          v-model="basicForm"
          :schema="basicSchema"
          @change="handlerChange($event)"
          :formProps="formProps"
          @submit="handlerSubmit"
          @cancel="handlerCancel"
        ></VueForm>
      </el-col>
    </el-row>
  </el-dialog>

  <!--新增函数-->
  <el-dialog v-model="addFuncDialog" :fullscreen="true">
    <el-input
      placeholder="函数名称"
      v-model="customFunctionName"
      style="width: 200px; margin-right: 10px"
      :disabled="selectFunName !== ''"
    ></el-input>

    <el-select
      v-model="selectFunName"
      placeholder="选中要修改的函数"
      size="large"
      @change="selectFunNameEvent"
      clearable
    >
      <el-option
        v-for="key in Object.keys(customFunctionObj)"
        :key="key"
        :label="key"
        :value="key"
      />
    </el-select>

    <div
      style="height: 50vh; margin-top: 10px; margin-bottom: 5px"
      v-if="customFunctionEditorFlag"
    >
      <Editor
        @changeData="
          (value) => {
            customFunctionCode = value
          }
        "
        language="javascript"
        :code="customFunctionCode"
        v-if="addFuncDialog"
      ></Editor>
    </div>

    <el-button @click="saveFunctionData" type="primary">保存</el-button>
  </el-dialog>
</template>

<script setup>
import {
  computed,
  ref,
  reactive,
  watchEffect,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import {
  getScriptList,
  getFormConfig,
  updateScriptList,
  checkAddScriptParamException,
  saveFunctionConfig,
  getFunctionConfig,
  updateOrSaveConfigyByKey,
  getConfigTextByKey,
} from '@/utils/db'
import { run } from '@/utils/common'
import { lib } from '@/utils/lib'
import VueForm from '@lljj/vue3-form-element'
import { ElMessage } from 'element-plus'

let data = reactive(getScriptList())
let queryName = ref('')
// console.log(data)
const filterData = computed(() => {
  let value = queryName.value
  let res = []
  if (!value) {
    res = [...data]
  }
  res = data.filter((item) => {
    if (
      item.basicForm &&
      item.basicForm.name &&
      item.basicForm.name.includes(value)
    ) {
      return true
    }
    if (
      item.basicForm &&
      item.basicForm.codeType &&
      item.basicForm.codeType.includes(value)
    ) {
      return true
    }
    if (
      item.basicForm &&
      item.basicForm.desc &&
      item.basicForm.desc.includes(value)
    ) {
      return true
    }
    return false
  })

  res.sort((a, b) => {
    let aUpdateTime = a.updateTime || 0
    let bUpdateTime = b.updateTime || 0
    return bUpdateTime - aUpdateTime
  })
  return res
})

import { useRouter } from 'vue-router'
//获取路由器对象
let $router = useRouter()
const refresh = () => {
  $router.push('/redirect')
}

// ===============处理编辑或新增======================
let saveOrUpdateData = {
  isAdd: false,
  isEdit: false,
  editItemInfo: {},
}

const copy = (item) => {
  let copyItem = JSON.parse(JSON.stringify(item))
  dialogFormVisible.value = true
  saveOrUpdateData.isEdit = false
  saveOrUpdateData.isAdd = true

  basicForm = copyItem?.basicForm || {}
  codeForm = {
    hostKey: copyItem.features
      ? JSON.stringify(copyItem.features, null, 2)
      : copyItem.features,
    code: copyItem.code,
  }
  basicForm['name'] = basicForm['name'] + '_copy'
}

const edit = (item) => {
  dialogFormVisible.value = true
  saveOrUpdateData.isEdit = true
  saveOrUpdateData.editItemInfo = { ...item }

  basicForm = item?.basicForm || {}
  codeForm = {
    id: item.id,
    hostKey: item.features
      ? JSON.stringify(item.features, null, 2)
      : item.features,
    code: item.code,
    preScriptContent: item.preScriptContent,
    createTime: item.createTime,
  }
}

const add = (item) => {
  dialogFormVisible.value = true
  saveOrUpdateData.isAdd = true

  basicForm = {}
  codeForm = {
    hostKey: '',
    code: '',
  }
}

const deleteData = (deleteItem) => {
  // 根据名称进行删除
  let scriptList = getScriptList()
  scriptList = scriptList.filter((item) => {
    return item.basicForm.name !== deleteItem.basicForm.name
  })
  updateScriptList([...scriptList])
  refresh()
}

// ==============处理新增函数 =============
let addFuncDialog = ref(false)
let customFunctionName = ref('')
let customFunctionCode = ref('')
let selectFunName = ref('')
let customFunctionObj = reactive(getFunctionConfig())
let customFunctionEditorFlag = ref(true)

const addFunc = () => {
  addFuncDialog.value = true
  customFunctionName.value = ''
  customFunctionCode.value = ''
}

const saveFunctionData = () => {
  saveFunctionConfig(customFunctionName.value, customFunctionCode.value)
  ElMessage.success('新增自定义函数成功')
  addFuncDialog.value = false
  selectFunName.value = ''
}

const selectFunNameEvent = (value) => {
  selectFunName.value = value
  customFunctionName.value = value
  customFunctionCode.value = getFunctionConfig()[value]
  console.log(customFunctionCode)
  customFunctionEditorFlag.value = false
  setTimeout(() => {
    customFunctionEditorFlag.value = true
  }, 100)
}

// ===============处理动态表单======================
import Editor from '@/components/Editor.vue'

let dialogFormVisible = ref(false)

let codeForm = reactive({
  hostKey: '',
  code: '',
  preScriptContent: '',
})
let scriptLanguage = ref('javascript')

const changeData = (value) => {
  codeForm.code = value
}

const changeHotKeyData = (value) => {
  codeForm.hostKey = value
}

let formFooter = reactive({
  show: false, // 是否显示默认底部
  okBtn: '保存', // 确认按钮文字
  okBtnProps: { type: 'primary' }, // 传递确认按钮的 props，例如配置按钮 loading 状态 okBtnProps: { loading: true }
  cancelBtn: '取消', // 取消按钮文字

  // 透传给formFooter 中的formItem组件的参数
  // 例如 vue3-ant 配置wrapperCol  formItemAttrs = { wrapperCol: { span: 10, offset: 5 }}
  formItemAttrs: {},
})

let formProps = reactive(getFormConfig()['formProps'])

let basicForm = reactive({})
const basicSchema = reactive(getFormConfig()['basicSchema'])

const handlerSubmit = () => {
  console.log('basicForm', basicForm)
  let dataItem = {
    basicForm: basicForm,
    features: codeForm.hostKey,
    code: codeForm.code,
    preScriptContent: codeForm.preScriptContent,
    ...codeForm,
    updateTime: new Date().getTime(),
  }
  console.log('dataItem', dataItem)
  if (codeForm.hostKey) {
    dataItem['features'] = JSON.parse(codeForm.hostKey)
  }

  if (saveOrUpdateData.isAdd) {
    if (checkAddScriptParamException(basicForm.name)) {
      ElMessage.error('当前脚本名称存在，请勿重复添加！！')
      return
    }
    dataItem['createTime'] = new Date().getTime()
    dataItem['id'] = lib.util.getScriptNextId()
    data.push(dataItem)
    updateScriptList([...data])
    ElMessage.success('添加成功')
  } else if (saveOrUpdateData.isEdit) {
    let scriptList = getScriptList()
    let editItemInfo = saveOrUpdateData.editItemInfo
    if (editItemInfo.basicForm.name !== dataItem.basicForm.name) {
      // 修改名称了 需要先删除后新增
      scriptList = scriptList.filter((item) => {
        return item.basicForm.name !== editItemInfo.basicForm.name
      })
      scriptList.push(dataItem)
      updateScriptList([...scriptList])
    } else {
      for (let i = 0; i < scriptList.length; i++) {
        let item = scriptList[i]
        if (item.basicForm.name == dataItem.basicForm.name) {
          scriptList[i] = { ...dataItem }
        }
      }
    }
    updateScriptList([...scriptList])
    saveCodeApi()
    ElMessage.success('更新成功')
  }
  window.services.sandbox.registerHotKey()
}
const handlerCancel = () => {
  dialogFormVisible.value = false
  refresh()
}

const codeEditorFlag = ref(false)
const handlerChange = ({ oldValue, newValue, type }) => {
  setTimeout(() => {
    if (
      newValue &&
      newValue.codeType &&
      scriptLanguage.value != newValue.codeType
    ) {
      scriptLanguage.value = newValue.codeType
    }
    codeEditorFlag.value = true
  }, 50)

  // 布局配置
  layoutConfig.debugWindow = newValue?.debugWindow
  layoutConfig.apiWindow = newValue?.apiWindow
  layoutConfig.hotKeyWindow = newValue?.hotKeyWindow
  layoutConfig.preScriptWindow = newValue?.preScriptWindow
}

//  =================== 代码运行调试 ==============
const codeRunResult = ref('')
const editorVisitor = ref('true')
const debugCode = () => {
  if (basicForm.codeType === 'javascript') {
    let result = window.services.sandBox(codeForm.code)
    console.log(result)
    codeRunResult.value =
      typeof result == 'object' ? JSON.stringify(result) : result + ''
    editorVisitor.value = false
    setTimeout(() => {
      editorVisitor.value = true
    }, 200)
  } else if (basicForm.codeType === 'python') {
    window.services.PythonShell.runString(codeForm.code, null)
      .then((messages) => {
        ElMessage.success('执行成功')
        console.log(messages)
        // 保存执行结果
        window.services.saveExecuteResult(messages)
        // 使用正则表达式匹配包裹的代码块
        let match = codeForm.code.match(/"""([\s\S]*?)"""/)

        if (match) {
          // 获取匹配到的代码块
          let codeBlock = match[1].trim()
          console.log(codeBlock)
          messages = messages + '\n\n' + window.services.sandBox(codeBlock)
        } else {
          console.log('未找到匹配的代码块')
        }

        codeRunResult.value =
          typeof messages == 'object' ? JSON.stringify(messages) : messages + ''
        editorVisitor.value = false
        setTimeout(() => {
          editorVisitor.value = true
        }, 200)
        console.log(codeForm.code)
      })
      .catch((e) => {
        console.log(e)
        ElMessage.error('执行失败')
        codeRunResult.value = e + ''
        editorVisitor.value = false
        setTimeout(() => {
          editorVisitor.value = true
        }, 200)
      })
  }
}

// ===================== 监听
watchEffect(() => {
  const dialogFlag = dialogFormVisible.value
  // console.log(dialogFlag)
  if (!dialogFlag) {
    //关闭清空数据
    codeRunResult.value = ''
    // 刷新页面
    //   refresh()
  }
})

// =================== api文档
let codeApi = ref(getConfigTextByKey('codeApi'))
const saveCodeApi = () => {
  updateOrSaveConfigyByKey('codeApi', (data) => {
    return codeApi.value
  })
}

// ====== 自定义编辑器
let customEditor = ref(true)
const customEditorRefresh = () => {
  customEditor.value = true
  setTimeout(() => {
    customEditor.value = false
  }, 100)
}

// 窗口监听
// 增加全局监听器
const dialogResizeFlag = ref(true)
const handleEditorResize = (event) => {
  if (dialogFormVisible) {
    dialogResizeFlag.value = false
    setTimeout(() => {
      dialogResizeFlag.value = true
    }, 10)
  }
}

onMounted(() => {
  // 监听窗口大小
  window.addEventListener('resize', handleEditorResize)
})

onBeforeUnmount(() => {
  // 在组件销毁前移除事件监听器，以防止内存泄漏
  window.removeEventListener('resize', handleEditorResize)
})

// 编辑布局显示控制
/**
 * debugWindow:
        type: boolean
        title: 开启调试窗口
      apiWindow:
        type: boolean
        title: 开启文档窗口
      hotKeyWindow:
        type: boolean
        title: 开启热键窗口
 */
const layoutConfig = reactive({
  debugWindow: false,
  apiWindow: false,
  hotKeyWindow: false,
  preScriptWindow: false,
  postScriptWindow: false,
})

// 初始化
if (saveOrUpdateData?.editItemInfo?.basicForm) {
  layoutConfig.debugWindow =
    saveOrUpdateData?.editItemInfo?.basicForm.debugWindow
  layoutConfig.apiWindow = saveOrUpdateData?.editItemInfo?.basicForm.apiWindow
  layoutConfig.hotKeyWindow =
    saveOrUpdateData?.editItemInfo?.basicForm.hotKeyWindow
}

// 直接运行
const onRun = (item) => {
  run(
    item,
    null,
    (error) => {
      let msg = typeof error === 'object' ? JSON.stringify(error) : error
      console.log(msg)
      ElMessage.error('运行失败：' + msg)
    },
    () => {
      ElMessage.info('运行完成')
    },
  )
}
</script>
