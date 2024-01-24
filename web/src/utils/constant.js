import Enum from 'enum'
export const constant = {
  MONACO_COMPLETION: 'MONACO_COMPLETION',
  ENABLE_DEBUG: 'ENABLE_DEBUG',
  BUS: {
    NEW_API_TAB: 'NEW_API_TAB',
    CLONE_API: 'CLONE_API',
    API_USE_CASE: 'API_USE_CASE',
    SAVE_API: 'saveApi',
    IMPORT_API: 'IMPORT_API',
    // 加入回收站
    ADD_TO_THE_RECYCLE_BIN: 'ADD_TO_THE_RECYCLE_BIN',
    CLOSE_ALL_TAB_LIST: 'CLOSE_ALL_TAB_LIST',
    LOADING_VARIABLES: 'LOADING_VARIABLES',
    // 刷新树结构
    REFRESH_API_TREE_NODE: 'REFRESH_API_TREE_NODE',
    REMOVE_ALL_API_BY_NODE_ID: 'REMOVE_ALL_API_BY_NODE_ID',
    // 显示或隐藏侧边栏
    CHANGE_SLIDER_STATUS: 'CHANGE_SLIDER_STATUS',
    OPEN_API_DETAIL: 'openApiDetail',
    // api删除后触发事件
    REMOVE_API_EVENT: 'REMOVE_API_EVENT',
    // 执行api删除操作
    REMOVE_API_ACTION: 'REMOVE_API_ACTION',
    // 键盘监听广播事件
    KEYDOWN_ACTION: 'KEYDOWN_ACTION',
  },
  NODE_TYPE: {
    API: 'api',
    DIR: 'directory',
    USER_CASE: 'case',
  },
  COLLECTION: {
    // 用于保存当前打开的标签页接口相关信息，关闭后浏览器后还能复原
    API_TABS: 'apiTabs',
    API_LIST: 'apiList',
    API_PLUGINS: 'apiPlugins',
    API_TAB_CONFIG: 'apiTabConfig',
  },
  COMMON: {
    RECYCLE_ID: 999999,
  },
  KEYDOWN: createEnum({
    SEND_API: 'ctrl+enter',
  }),
}

function createEnum(definition) {
  const strToValueMap = {}
  const numToDescMap = {}
  let enumObj = {}
  for (const enumName of Object.keys(definition)) {
    enumObj[enumName] = enumObj?.enumName || {}
    enumObj[enumName]['NAME'] = enumName
    enumObj[enumName]['VALUE'] = definition[enumName]
  }
  return enumObj
}
