import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import Mock from 'mockjs'
import * as jsonUtils from '@wibetter/json-utils'
import { lib } from './lib.js'
import { constant } from './constant.js'
import Loki from 'lokijs'
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter'
import { posttiger } from '@/utils/posttiger.js'
import bus from 'vue3-eventbus'
import * as monaco from 'monaco-editor'
import { uid } from 'uid'
import { pluginsData } from '@/utils/initData/plugins.js'
import EvaLight from '@/themes/EvaLight.json'
import AtlanticNight from '@/themes/AtlanticNight.json'
import AtomOneDark from '@/themes/AtomOneDark.json'
import AuroraX from '@/themes/AuroraX.json'
import AyuDark from '@/themes/AyuDark.json'
import AyuLight from '@/themes/AyuLight.json'
import BlulocoLight from '@/themes/BlulocoLight.json'
import BracketsLightPro from '@/themes/BracketsLightPro.json'
import CodeSandBox from '@/themes/CodeSandBox.json'
import Darktooth from '@/themes/Darktooth.json'
import Dracula from '@/themes/Dracula.json'
import FlatUI from '@/themes/FlatUI.json'
import Hopscotch from '@/themes/Hopscotch.json'
import HorlaLightTheme from '@/themes/HorlaLightTheme.json'
import HybridNext from '@/themes/HybridNext.json'
import KimbieDark from '@/themes/KimbieDark.json'
import LaserWave from '@/themes/LaserWave.json'
import Lucario from '@/themes/Lucario.json'
import themeLucario from '@/themes/Lucario.json'
import Min from '@/themes/Min.json'
import MonokaiDimmed from '@/themes/MonokaiDimmed.json'
import MonokaiPro from '@/themes/MonokaiPro.json'
import Nebula from '@/themes/Nebula.json'
import NoctisAzureus from '@/themes/NoctisAzureus.json'
import NoctisBordo from '@/themes/NoctisBordo.json'
import NoctisLux from '@/themes/NoctisLux.json'
import OneDarkPro from '@/themes/OneDarkPro.json'
import OneMonokai from '@/themes/OneMonokai.json'
import Panda from '@/themes/Panda.json'
import RemedyDark from '@/themes/RemedyDark.json'
import ReUI from '@/themes/ReUI.json'
import ShadesOfPurple from '@/themes/ShadesOfPurple.json'
import SnazzyLight from '@/themes/SnazzyLight.json'
import SnazzyOperator from '@/themes/SnazzyOperator.json'
import SublimeMaterialThemeDark from '@/themes/SublimeMaterialThemeDark.json'
import SynthWave84 from '@/themes/SynthWave84.json'
import TokyoNightStorm from '@/themes/TokyoNightStorm.json'
import TomorrowNightBlue from '@/themes/TomorrowNightBlue.json'
import Twilight from '@/themes/Twilight.json'
import WinterIsComing from '@/themes/WinterIsComing.json'

const initService = () => {
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

const initTreeParent = () => {
  let parentNode = window.posttiger
    .db('apiList')
    .collection.findOne({ label: '个人项目' })
  let recycleBin = window.posttiger
    .db('apiList')
    .collection.findOne({ label: '回收站' })
  if (!recycleBin) {
    window.posttiger.db('apiList').insert({
      parentId: 0,
      id: 999999,
      label: '回收站',
    })
  }
  if (!parentNode) {
    window.posttiger.db('apiList').insert({
      parentId: 0,
      id: 1,
      label: '个人项目',
    })
  }
}

const initDb = () => {
  // https://techfort.github.io/LokiJS/ 官网APi文档地址
  // 常用API https://www.cnblogs.com/Grewer/p/13507197.html
  const db = new Loki('posttiger', {
    adapter: new LokiIndexedAdapter(),
    autoload: true, // 是否自动加载数据库
    autoloadCallback: databaseInitialize, // 自动加载完成后的回调函数
    autosave: true, // 是否自动保存数据库
    // autosaveInterval: 60000, // 自动保存的时间间隔（毫秒）
    autosaveInterval: 1000, // 自动保存的时间间隔（毫秒）
  })
  //
  // // 自动加载完成后的回调函数
  function databaseInitialize() {
    console.log('databaseInitialize')
    // 在这里可以执行初始化操作
    initTreeParent()
    initPosttiger()
    // 是否有内置插件，没有则初始化
    let pluginInner = window.posttiger.db('apiPlugins').collection.find()
    if (pluginInner.length === 0) {
      console.warn(
        '%c 检测当前插件为空，开始初始化内置插件 %c',
        'background-color: #f56c6c; color: #fff;padding:3px;box-sizing: border-box;border-radius: 3px;',
        '',
      )
      window.posttiger.db('apiPlugins').cleanInsert(pluginsData)
    }
    bus.emit('dbLoadingFinish', {})
  }

  // 挂载db函数
  window.db = db
}

const initPosttigerPlugins = () => {
  return {
    data: [],
    register: (plugin) => {
      let plugins = window.posttiger.plugins.data
      // 判断当前plugins是否存在插件名称 存在则删除 重新注册
      let existPluginInfo = plugins.filter((p) => {
        return p.name === plugin.name
      })
      if (existPluginInfo.length > 0) {
        // 移除
        window.posttiger.plugins.data = window.posttiger.plugins.data.filter(
          (p) => {
            return p.name !== plugin.name
          },
        )
      }
      // 加入 判断是否启用
      if (plugin.enable) {
        console.log('注册插件', plugin)
        window.posttiger.plugins.data.push(plugin)
        // 排序
        window.posttiger.plugins.data.sort((a, b) => {
          // order越大优先级越大，没有设置默认最小
          let aOrder = a?.order || 1
          let bOrder = b?.order || 1
          return aOrder - bOrder
        })
      }
    },
  }
}

const initPosttigerNode = () => {
  return {
    ...posttiger.db(constant.COLLECTION.API_LIST),
    /**
     * 递归删除当前节点以及子节点
     * @param nodeId
     */
    deleteAllNodeById: (nodeId) => {
      function deleteNode(children) {
        if (children && children.length) {
          for (let item of children) {
            posttiger
              .db(constant.COLLECTION.API_LIST)
              .removeByCondition({ id: item.id })
            deleteNode(item.children)
          }
        }
      }
      let nodeInfo = posttiger
        .db(constant.COLLECTION.API_LIST)
        .collection.findOne({ id: nodeId })
      posttiger
        .db(constant.COLLECTION.API_LIST)
        .removeByCondition({ id: nodeId })
      return deleteNode(nodeInfo?.children || [])
    },
    /**
     * 获取当前节点所有父节点ID集合，如果没有则返回为空
     * @param nodeId
     */
    findAllParentNodeById: (nodeId) => {
      let nodeList = []
      function findNode(nodeId, nodeList) {
        let nodeInfo = posttiger
          .db(constant.COLLECTION.API_LIST)
          .collection.findOne({ id: nodeId })
        if (nodeInfo) {
          nodeList.push(nodeInfo.id)
          findNode(nodeInfo.parentId, nodeList)
        }
      }
      let nodeInfo = posttiger
        .db(constant.COLLECTION.API_LIST)
        .collection.findOne({ id: nodeId })
      findNode(nodeInfo.parentId, nodeList)
      return nodeList
    },
    findAllChildrenNodeById: (nodeId) => {
      let res = []
      function findChildrenNode(children, res) {
        debugger
        for (let nodeInfo of children) {
          if (nodeInfo) {
            let children = nodeInfo.children || []
            delete nodeInfo.children
            res.push(nodeInfo)
            findChildrenNode(children, res)
          }
        }
      }
      let nodeInfo = posttiger
        .db(constant.COLLECTION.API_LIST)
        .collection.findOne({ id: nodeId })
      findChildrenNode(nodeInfo?.children || [], res)
      return res
    },
    getTreeNode: () => {
      let apiInfoList = posttiger
        .db(constant.COLLECTION.API_LIST)
        .collection.find()
      return lib.util.buildTree(JSON.parse(JSON.stringify(apiInfoList)), 0)
    },
    /**
     * 获取当前激活的api信息，返回api数据结构
     * @returns {*|{}}
     */
    getCurrentActiveApi: () => {
      return (
        posttiger
          .db(constant.COLLECTION.API_TAB_CONFIG)
          .collection.findOne({ type: 'currentApiInfo' })?.data?.content || {}
      )
    },
  }
}

const initPosttiger = () => {
  /**
   * node节点操作API
   */
  function node() {}

  // 挂载封装好的函数
  window.posttiger = {
    // api节点操作
    node: initPosttigerNode(),
    ...posttiger,
    plugins: initPosttigerPlugins(),
  }
  let posttigerAppUrl = window.localStorage.getItem('posttigerAppUrl')
  if (posttigerAppUrl) {
    window.posttiger.appUrl = posttigerAppUrl
    console.log(
      '%c 当前后端接口路径地址为：' + posttigerAppUrl + ' %c ',
      'background-color: #67c23a; color: #fff; padding:3px;box-sizing: border-box;border-radius: 3px;',
      '',
    )
  } else {
    window.posttiger.appUrl = 'http://localhost:3000'
    console.warn(
      '%c 当前没有配置后端接口路径，使用默认请求地址：http://localhost:3000 如需配置请添加localStorage [posttigerAppUrl: http://服务器IP:3000] %c',
      'background-color: #f56c6c; color: #fff;padding:3px;box-sizing: border-box;border-radius: 3px;',
      '',
    )
  }
}

const initLib = () => {
  // 公共方法、函数挂载
  // if (!window.lib) {
  //   window.lib = {}
  // }
  window.lib = {
    uid: uid,
    Mock: Mock,
    jsonUtils: jsonUtils,
  }
}
/**
 * 设置编辑器主题样式
 */
const initMonacoEditor = () => {
  monaco.editor.defineTheme('myCustomTheme', themeLucario)
  monaco.editor.defineTheme('AtlanticNight', AtlanticNight)
  monaco.editor.defineTheme('AtomOneDark', AtomOneDark)
  monaco.editor.defineTheme('AuroraX', AuroraX)
  monaco.editor.defineTheme('AyuDark', AyuDark)
  monaco.editor.defineTheme('AyuLight', AyuLight)
  monaco.editor.defineTheme('BlulocoLight', BlulocoLight)
  monaco.editor.defineTheme('BracketsLightPro', BracketsLightPro)
  monaco.editor.defineTheme('CodeSandBox', CodeSandBox)
  monaco.editor.defineTheme('Darktooth', Darktooth)
  monaco.editor.defineTheme('Dracula', Dracula)
  monaco.editor.defineTheme('EvaLight', EvaLight)
  monaco.editor.defineTheme('FlatUI', FlatUI)
  monaco.editor.defineTheme('Hopscotch', Hopscotch)
  monaco.editor.defineTheme('HorlaLightTheme', HorlaLightTheme)
  monaco.editor.defineTheme('HybridNext', HybridNext)
  monaco.editor.defineTheme('KimbieDark', KimbieDark)
  monaco.editor.defineTheme('LaserWave', LaserWave)
  monaco.editor.defineTheme('Lucario', Lucario)
  monaco.editor.defineTheme('Min', Min)
  monaco.editor.defineTheme('MonokaiDimmed', MonokaiDimmed)
  monaco.editor.defineTheme('MonokaiPro', MonokaiPro)
  monaco.editor.defineTheme('Nebula', Nebula)
  monaco.editor.defineTheme('NoctisAzureus', NoctisAzureus)
  monaco.editor.defineTheme('NoctisBordo', NoctisBordo)
  monaco.editor.defineTheme('NoctisLux', NoctisLux)
  monaco.editor.defineTheme('OneDarkPro', OneDarkPro)
  monaco.editor.defineTheme('OneMonokai', OneMonokai)
  monaco.editor.defineTheme('Panda', Panda)
  monaco.editor.defineTheme('RemedyDark', RemedyDark)
  monaco.editor.defineTheme('ReUI', ReUI)
  monaco.editor.defineTheme('ShadesOfPurple', ShadesOfPurple)
  monaco.editor.defineTheme('SnazzyLight', SnazzyLight)
  monaco.editor.defineTheme('SnazzyOperator', SnazzyOperator)
  monaco.editor.defineTheme(
    'SublimeMaterialThemeDark',
    SublimeMaterialThemeDark,
  )
  monaco.editor.defineTheme('SynthWave84', SynthWave84)
  monaco.editor.defineTheme('TokyoNightStorm', TokyoNightStorm)
  monaco.editor.defineTheme('TomorrowNightBlue', TomorrowNightBlue)
  monaco.editor.defineTheme('Twilight', Twilight)
  monaco.editor.defineTheme('WinterIsComing', WinterIsComing)
}

/**
 * 挂载消息总线
 */
const initBus = () => {
  window.bus = bus
}
export const init = () => {
  initLib()
  initBus()
  initMonacoEditor()
  initService()
  initDb()
  initPosttiger()
}
