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
  },
  NODE_TYPE: {
    API: "api",
    DIR: "directory",
    USER_CASE: "case"
  },
  COLLECTION: {
    // 用于保存当前打开的标签页接口相关信息，关闭后浏览器后还能复原
    API_TABS: 'apiTabs',
    API_LIST: 'apiList',
    API_PLUGINS: 'apiPlugins',
  },
  COMMON: {
    RECYCLE_ID: 999999,
  },
}
