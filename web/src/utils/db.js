import { yamlToJson, jsonToYarn } from './yaml'

export const saveData = (data) => {
  window.services.utools.dbStorage.setItem('data', JSON.stringify(data))
}

export const getData = () => {
  return JSON.parse(window.services.utools.dbStorage.getItem('data'))
}

export const getConfigData = () => {
  return window.services.utools.dbStorage.getItem('configData')
}

export const setConfigData = (dataStr) => {
  window.services.utools.dbStorage.setItem('configData', dataStr)
  return true
}

export const getConfigDataJson = () => {
  let content = getConfigData()
  return content ? JSON.parse(content) : {}
}

export const setConfigDataJson = (dataJson) => {
  setConfigData(JSON.stringify(dataJson))
}

export const getScriptByCodeKey = (codeKey) => {
  let data = getConfigDataJson()
  // 获取所有脚本featur
  if (data && data['scriptManage'] && data['scriptManage']['list']) {
    let scripts = data['scriptManage']['list']
    for (let item of scripts) {
      if (item['features']['code'] === codeKey) {
        return item
      }
    }
  }
}

/**
 *
 * @returns 获取所有脚本
 */
export const getScriptList = () => {
  let data = getConfigDataJson()
  return data?.scriptManage?.list || []
}

/**
 *
 * @returns 新增或更新脚本
 */
export const updateScriptList = (updateData) => {
  let data = getConfigDataJson()
  data.scriptManage.list = [...updateData]
  // 保存配置
  setConfigDataJson(data)
}

/**
 *
 * @param {脚本名称} name
 * @returns false通过 true异常
 */
export const checkAddScriptParamException = (name) => {
  let data = getConfigDataJson()
  for (let item of data.scriptManage.list) {
    if (item.basicForm && item.basicForm.name && item.basicForm.name === name) {
      return true
    }
  }
  return false
}

/**
 *
 * @returns 获取表单配置
 */
export const getFormConfig = () => {
  let data = getConfigDataJson()
  return data?.scriptForm || {}
}

// =============== 处理新增函数相关API ==============
export const saveFunctionConfig = (name, code) => {
  let data = getConfigDataJson()
  if (data['functionManage']) {
    data['functionManage'][name] = code
  } else {
    data['functionManage'] = {
      name: code,
    }
  }
  setConfigDataJson(data)
}

export const getFunctionConfig = () => {
  let data = getConfigDataJson()
  if (data?.functionManage) {
    return data['functionManage']
  } else {
    return {}
  }
}

// ===== 通用修改key 父级key  值为数组 ====
export const updateOrSaveConfigyByKey = (key, callback) => {
  let data = getConfigDataJson()
  let res = {}
  if (data[key]) {
    res = data[key]
  }
  let updateData = callback(res)
  console.log('==============', updateData)
  data[key] = updateData
  setConfigDataJson(data)
}

export const getConfigTextByKey = (key) => {
  let res = ''
  let data = getConfigDataJson()
  if (data[key]) {
    res = data[key]
  }
  return res
}
//====================脚本执行动态表单
/**
 * {
    "paramsFormConfig": {
        "simpleForm": {
            "formProps": {

            },
            "schema": {
                
            }
        }
    }
}
 */
export const getParamFormConfig = () => {
  let data = getConfigDataJson()
  return data?.paramsFormConfig || {}
}
