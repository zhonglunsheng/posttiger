export const getNestedValue = (obj, keyPath) => {
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

export const setValue = (obj, keyPath, newValue) => {
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
