import yaml from 'js-yaml'
import dayjs from 'dayjs'
const getNestedValue = (obj, keyPath) => {
  const keys = keyPath.split('.')
  return keys.reduce((nestedObj, currentKey) => {
    if (nestedObj && typeof nestedObj === 'object') {
      if (Array.isArray(nestedObj) && !isNaN(currentKey)) {
        // 处理数组的情况
        const index = parseInt(currentKey, 10)
        return nestedObj[index]
      } else if (currentKey in nestedObj) {
        return nestedObj[currentKey]
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }, obj)
}

const setNestedValue = (obj, keyPath, newValue) => {
  const keys = keyPath.split('.')
  const lastKey = keys.pop()

  const targetObj = keys.reduce((nestedObj, currentKey) => {
    if (nestedObj && typeof nestedObj === 'object') {
      if (Array.isArray(nestedObj) && !isNaN(currentKey)) {
        const index = parseInt(currentKey, 10)
        return nestedObj[index]
      } else if (currentKey in nestedObj) {
        return nestedObj[currentKey]
      } else {
        // 如果嵌套的键不存在，则创建一个新的对象
        nestedObj[currentKey] = {}
        return nestedObj[currentKey]
      }
    } else {
      return undefined
    }
  }, obj)

  // 设置新值
  if (targetObj && typeof targetObj === 'object') {
    targetObj[lastKey] = newValue
  }
}

const getConfigDataJson = () => {
  let configData = window.services.utools.dbStorage.getItem('configData')
  return JSON.parse(configData)
}

const setConfigDataJson = (json) => {
  try {
    window.services.utools.dbStorage.setItem('configData', JSON.stringify(json))
  } catch (e) {
    console.log(e)
    return false
  }
  return true
}

const getConfigNestedValue = (keyPath, defaultValue) => {
  return getNestedValue(getConfigDataJson(), keyPath) || defaultValue
}

const setConfigNestedValue = (updateValue, keyPath) => {
  let configData = getConfigDataJson()
  setNestedValue(configData, keyPath, updateValue)
  console.log(configData)
  return setConfigDataJson(configData)
}

/**
 * 获取api接口列表信息
 * @param {接口id} id
 * @returns
 */
const getApiInfoList = () => {
  return getConfigNestedValue('API_LIST', [])
}

/**
 * 获取api接口信息
 * @param {接口id} id
 * @returns
 */
const getApiInfoById = (id) => {
  let apiList = getConfigNestedValue('API_LIST', [])
  let apiInfo = apiList.filter((item) => {
    return item['id'] === id
  })
  return apiInfo.length > 0 ? apiInfo[0] : {}
}

/**
 * 更新接口信息
 * @param {接口信息} apiInfo
 * @returns
 */
const updateApiInfoById = (apiInfo) => {
  let id = apiInfo.id
  let apiList = getConfigNestedValue('API_LIST', [])
  let index = apiList.findIndex((item) => {
    return item['id'] === id
  })
  if (index > -1) {
    apiList[index] = { ...apiInfo }
    console.log(apiList)
    setConfigNestedValue(apiList, 'API_LIST')
    return true
  }
  return false
}

/**
 * 更新接口信息
 * @param {接口信息} apiInfo
 * @returns
 */
const updateApiInfoList = (apiInfoList) => {
  setConfigNestedValue(apiInfoList, 'API_LIST')
}

const buildTree = (nodes, parentId) => {
  const tree = []

  nodes.forEach((node) => {
    if (node.parentId === parentId) {
      const children = buildTree(nodes, node.id)
      if (children.length > 0) {
        node.children = children
      }
      tree.push(node)
    }
  })

  return tree
}

const treeToArray = (tree) => {
  const array = []

  function traverse(node) {
    let children = undefined
    if (node.children) {
      children = JSON.parse(JSON.stringify(node['children']))
      delete node['children']
    }
    array.push(node)

    if (children) {
      children.forEach((child) => traverse(child))
    }
  }

  if (tree && tree.length > 0) {
    tree.forEach((node) => traverse(node))
  }

  return array
}

const findParentNodeByTree = (tree, targetId, parents = []) => {
  for (const node of tree) {
    if (node.id === targetId) {
      let nodeCopyInfo = { ...node }
      delete nodeCopyInfo['children']
      parents.push(nodeCopyInfo)
      return parents
    } else if (node.children) {
      console.log('递归查找子节点')
      // 如果有子节点，则递归查找子节点
      const found = findParentNodeByTree(node.children, targetId, parents)
      if (found.length > 0) {
        // 如果找到目标节点，返回当前父节点
        let nodeCopyInfo = { ...node }
        delete nodeCopyInfo['children']
        parents.push(nodeCopyInfo)
        return parents
      }
    }
  }
  return parents
}

const findParentNodeByTreeByNodeType = (tree, targetId, nodeType) => {
  let parents = []
  parents = findParentNodeByTree(tree, targetId, parents)
  console.log(parents)
  // 遍历parents 获取对应的类型
  let parent = parents.find((item) => {
    return item['nodeType'] === nodeType
  })
  return parent
}

const func = {
  util: {
    getScriptNextId: () => {
      let scriptManage = getConfigNestedValue('scriptManage.list')
      if (scriptManage) {
        let maxId = 0
        for (let item of scriptManage) {
          if (item?.id && item?.id > maxId) {
            maxId = item.id
          }
        }
        return maxId + 1
      }
      return 1
    },
    getDateTimeStr: (timestamp) => {
      if (!timestamp) {
        return dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    buildTree: buildTree,

    treeToArray: treeToArray,

    findParentNodeByTreeByNodeType: findParentNodeByTreeByNodeType,

    findParentNodeByTree: findParentNodeByTree,
  },
}

export const lib = {
  config: {
    getConfigNestedValue: getConfigNestedValue,
    getConfigDataJson: getConfigDataJson,
    setConfigDataJson: setConfigDataJson,
    setConfigNestedValue: setConfigNestedValue,
    getApiInfoById: getApiInfoById,
    updateApiInfoById: updateApiInfoById,
    getApiInfoList: getApiInfoList,
    updateApiInfoList: updateApiInfoList,
  },
  util: func.util,
}
