/**
 * 扩展方法
 */

export const services = () => {
  return {
    execCommand: (command) => {
      console.log(`execCommand: ${command}`)
      return command
    },

    sandBox: (command) => {
      console.log(`sandBox: ${command}`)
      return command
    },
    testCode: () => {
      console.log('testCode')
    },

    utools: {
      onPluginEnter: (callback) => {
        // 在这里触发 onPluginEnter 的逻辑
        // 例如，模拟调用 onPluginEnter 并传递一个对象
        const enterData = {
          code: 'testAdd',
          payload: '文件类型 - "file"、"directory" (可选)',
          type: 'over',
        }
        callback(enterData)
      },

      dbStorage: {
        getItem: (key) => {
          return window.localStorage.getItem(key)
        },
        setItem: (key, value) => {
          return window.localStorage.setItem(key, value)
        },
      },

      getFeatures: () => {
        return [
          { code: 'hosts', cmds: ['hosts'], explain: 'hosts切换' },
          {
            code: 'testAdd',
            cmds: [
              'testAdd',
              { type: 'img', label: 'testAdd测试img' },
              {
                type: 'over',
                label: 'testAdd测试 over',
                minLength: 1,
                maxLength: 500,
              },
            ],
            explain: 'testAdd',
          },
        ]
      },
    },
  }
}
