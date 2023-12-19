import { getScriptByCodeKey } from './db'

/**
 * 运行代码
 */
export const runCode = (
  scriptInfo,
  codeType,
  successcb = () => {},
  errorcb = () => {},
) => {
  if (!scriptInfo || !scriptInfo.basicForm || codeType) {
    console.log('入参异常')
    return
  }

  if (codeType === 'javascript') {
    let result = window.services.sandBox(scriptInfo.code)
    console.log(result)
  } else if (codeType === 'python') {
    window.services.PythonShell.runString(scriptInfo.code, null)
      .then((messages) => {
        console.log(messages)
        // 保存执行结果
        window.services.saveExecuteResult(messages)
        // 使用正则表达式匹配包裹的代码块
        let match = scriptInfo.code.match(/"""([\s\S]*?)"""/)

        if (match) {
          // 获取匹配到的代码块
          let codeBlock = match[1].trim()
          console.log(codeBlock)
          window.services.sandBox(codeBlock)
        } else {
          console.log('未找到匹配的代码块')
        }
        successcb()
      })
      .catch((e) => {
        console.error(e)
        errorcb()
      })
  }
}

export const run = (scriptInfo, scb, ecb, fcb) => {
  console.log('开始运行脚本', scriptInfo)
  if (!scriptInfo && window.services.ENTER) {
    let enter = window.services.ENTER
    scriptInfo = getScriptByCodeKey(enter['code'])
  }

  if (!scriptInfo || !scriptInfo?.basicForm) {
    console.warn('当前运行脚本相关信息为空')
    return
  }

  let basicForm = scriptInfo.basicForm
  const debugCode = () => {
    if (basicForm.codeType === 'javascript') {
      let result = window.services.sandBox(scriptInfo.code)
      console.log(result)
      if (typeof result == 'object' && result?.error) {
        if (ecb) {
          ecb(result)
        }
      } else {
        if (fcb) {
          fcb(result)
        }
      }
    } else if (basicForm.codeType === 'python') {
      window.services.PythonShell.runString(scriptInfo.code, null)
        .then((messages) => {
          console.log(messages)
          // 保存执行结果
          window.services.saveExecuteResult(messages)
          // 使用正则表达式匹配包裹的代码块
          let match = scriptInfo.code.match(/"""([\s\S]*?)"""/)

          if (match) {
            // 获取匹配到的代码块
            let codeBlock = match[1].trim()
            console.log(codeBlock)
            window.services.sandBox(codeBlock)
          } else {
            console.log('未找到匹配的代码块')
          }
          if (fcb) {
            fcb(messages)
          }
        })
        .catch((e) => {
          console.log(e)
          if (ecb) {
            ecb(e)
          }
        })
    }
  }

  debugCode()

  let command = scriptInfo?.command || ''
  if (command) {
    window.services.execCommand(command)
  }
}

export const runJavaScript = () => {
  if (window.services.ENTER) {
    let enter = window.services.ENTER
    if (enter?.code) {
      let scriptInfo = getScriptByCodeKey(enter['code'])
      if (scriptInfo && scriptInfo?.preScriptContent) {
        return window.services.sandBox(scriptInfo.preScriptContent)
      }
    }
  }
}

export const getScriptInfo = () => {
  if (window.services.ENTER) {
    let enter = window.services.ENTER
    let scriptInfo = getScriptByCodeKey(enter['code'])
    return scriptInfo
  }
  return null
}
