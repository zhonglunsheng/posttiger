export const pluginsData = [
  {
    name: '测试插件',
    sfc: '<template>hello 测试插件 12232 </template>',
    id: 'abc',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 1,
  },
  {
    name: '修改网站主题',
    sfc: "<script setup>\r\nimport { ref } from 'vue'\r\n\r\nconst defaultTheme = {\r\n  '--el-color-white': '#ffffff',\r\n  '--el-color-black': '#000000',\r\n  '--el-color-primary': '#409eff',\r\n  '--el-color-success': '#67c23a',\r\n  '--el-color-warning': '#e6a23c',\r\n  '--el-color-danger': '#f56c6c',\r\n  '--el-color-error': '#f56c6c',\r\n  '--el-color-info': '#909399',\r\n  // '--el-color-primary-light-3': '#79bbff',\r\n  // '--el-color-primary-light-5': '#a0cfff',\r\n  // '--el-color-primary-light-7': '#c6e2ff',\r\n  // '--el-color-primary-light-8': '#d9ecff',\r\n  // '--el-color-primary-light-9': '#ecf5ff',\r\n  // '--el-color-primary-dark-2': '#337ecc',\r\n  // '--el-color-success': '#67c23a',\r\n  // '--el-color-success-light-3': '#95d475',\r\n  // '--el-color-success-light-5': '#b3e19d',\r\n  // '--el-color-success-light-7': '#d1edc4',\r\n  // '--el-color-success-light-8': '#e1f3d8',\r\n  // '--el-color-success-light-9': '#f0f9eb',\r\n  // '--el-color-success-dark-2': '#529b2e',\r\n  // '--el-color-warning': '#e6a23c',\r\n  // '--el-color-warning-light-3': '#eebe77',\r\n  // '--el-color-warning-light-5': '#f3d19e',\r\n  // '--el-color-warning-light-7': '#f8e3c5',\r\n  // '--el-color-warning-light-8': '#faecd8',\r\n  // '--el-color-warning-light-9': '#fdf6ec',\r\n  // '--el-color-warning-dark-2': '#b88230',\r\n  // '--el-color-danger': '#f56c6c',\r\n  // '--el-color-danger-light-3': '#f89898',\r\n  // '--el-color-danger-light-5': '#fab6b6',\r\n  // '--el-color-danger-light-7': '#fcd3d3',\r\n  // '--el-color-danger-light-8': '#fde2e2',\r\n  // '--el-color-danger-light-9': '#fef0f0',\r\n  // '--el-color-danger-dark-2': '#c45656',\r\n  // '--el-color-error': '#f56c6c',\r\n  // '--el-color-error-light-3': '#f89898',\r\n  // '--el-color-error-light-5': '#fab6b6',\r\n  // '--el-color-error-light-7': '#fcd3d3',\r\n  // '--el-color-error-light-8': '#fde2e2',\r\n  // '--el-color-error-light-9': '#fef0f0',\r\n  // '--el-color-error-dark-2': '#c45656',\r\n  // '--el-color-info': '#909399',\r\n  // '--el-color-info-light-3': '#b1b3b8',\r\n  // '--el-color-info-light-5': '#c8c9cc',\r\n  // '--el-color-info-light-7': '#dedfe0',\r\n  // '--el-color-info-light-8': '#e9e9eb',\r\n  // '--el-color-info-light-9': '#f4f4f5',\r\n  // '--el-color-info-dark-2': '#73767a',\r\n  // '--el-bg-color': '#ffffff',\r\n  // '--el-bg-color-page': '#f2f3f5',\r\n  // '--el-bg-color-overlay': '#ffffff',\r\n  // '--el-text-color-primary': '#303133',\r\n  // '--el-text-color-regular': '#606266',\r\n  // '--el-text-color-secondary': '#909399',\r\n  // '--el-text-color-placeholder': '#a8abb2',\r\n  // '--el-text-color-disabled': '#c0c4cc',\r\n  // '--el-border-color': '#dcdfe6',\r\n  // '--el-border-color-light': '#e4e7ed',\r\n  // '--el-border-color-lighter': '#ebeef5',\r\n  // '--el-border-color-extra-light': '#f2f6fc',\r\n  // '--el-border-color-dark': '#d4d7de',\r\n  // '--el-border-color-darker': '#cdd0d6',\r\n  // '--el-fill-color': '#f0f2f5',\r\n  // '--el-fill-color-light': '#f5f7fa',\r\n  // '--el-fill-color-lighter': '#fafafa',\r\n  // '--el-fill-color-extra-light': '#fafcff',\r\n  // '--el-fill-color-dark': '#ebedf0',\r\n  // '--el-fill-color-darker': '#e6e8eb',\r\n  // '--el-fill-color-blank': '#ffffff',\r\n}\r\n\r\nconst cssVariableList = ref(\r\n  window.posttiger\r\n    .db('ElementUiThemePlugins')\r\n    .collection.findOne({ type: 'element-ui' })?.cssVariableList || {\r\n    ...defaultTheme,\r\n  },\r\n)\r\n\r\nconst themeName = ref(\r\n  window.posttiger\r\n    .db('ElementUiThemePlugins')\r\n    .collection.findOne({ type: 'element-ui' })?.themeName || 'default',\r\n)\r\nconst changeThemeColor = (color, themeKey) => {\r\n  console.log('changeThemeColor', color, themeKey)\r\n  cssVariableList.value[themeKey] = color\r\n  saveElementCss()\r\n  // 发布主题改变事件\r\n  window.bus.emit('themePlugin:changeTheme', [themeKey, color])\r\n}\r\n\r\nconst resetElementCss = () => {\r\n  cssVariableList.value = defaultTheme\r\n  saveElementCss()\r\n  window.bus.emit('themePlugin:changeTheme', ['reset', 'default', defaultTheme])\r\n}\r\n\r\nconst saveElementCss = () => {\r\n  window.posttiger.db('ElementUiThemePlugins').insertOrUpdate(\r\n    { type: 'element-ui' },\r\n    {\r\n      type: 'element-ui',\r\n      themeName: themeName.value,\r\n      cssVariableList: cssVariableList.value,\r\n    },\r\n  )\r\n}\r\n\r\nconst vsCodeThemeName = ref(\r\n  window.posttiger\r\n    .db('ElementUiThemePlugins')\r\n    .collection.findOne({ type: 'vscodeTheme' })?.data || 'EvaLight',\r\n)\r\n\r\nconst changeThemeName = (data) => {\r\n  console.log('changeThemeName', data)\r\n  changeThemeColor(data, 'themeName')\r\n  saveElementCss()\r\n}\r\n\r\nconst vsCodeThemeList = ref([\r\n  'AtlanticNight',\r\n  'AtomOneDark',\r\n  'AuroraX',\r\n  'AyuDark',\r\n  'AyuLight',\r\n  'BlulocoLight',\r\n  'BracketsLightPro',\r\n  'CodeSandBox',\r\n  'Darktooth',\r\n  'Dracula',\r\n  'EvaLight',\r\n  'FlatUI',\r\n  'Hopscotch',\r\n  'HorlaLightTheme',\r\n  'HybridNext',\r\n  'KimbieDark',\r\n  'LaserWave',\r\n  'Lucario',\r\n  'Min',\r\n  'MonokaiDimmed',\r\n  'MonokaiPro',\r\n  'Nebula',\r\n  'NoctisAzureus',\r\n  'NoctisBordo',\r\n  'NoctisLux',\r\n  'OneDarkPro',\r\n  'OneMonokai',\r\n  'Panda',\r\n  'RemedyDark',\r\n  'ReUI',\r\n  'ShadesOfPurple',\r\n  'SnazzyLight',\r\n  'SnazzyOperator',\r\n  'SublimeMaterialThemeDark',\r\n  'SynthWave84',\r\n  'TokyoNightStorm',\r\n  'TomorrowNightBlue',\r\n  'Twilight',\r\n  'WinterIsComing',\r\n])\r\nconst changeVsCodeThemeName = (data) => {\r\n  console.log('changeVsCodeThemeName', data)\r\n  // window.bus.emit('themePlugin:changeVsCodeThemeName', data)\r\n  window.posttiger\r\n    .db('ElementUiThemePlugins')\r\n    .insertOrUpdate(\r\n      { type: 'vscodeTheme' },\r\n      { type: 'vscodeTheme', data: data },\r\n    )\r\n}\r\n</script>\r\n\r\n<template>\r\n  VsCode主题：\r\n  <el-select v-model=\"vsCodeThemeName\" @change=\"changeVsCodeThemeName\">\r\n    <el-option\r\n      :value=\"item\"\r\n      :label=\"item\"\r\n      v-for=\"(item, index) in vsCodeThemeList\"\r\n    ></el-option>\r\n  </el-select>\r\n  <br />\r\n  <br />\r\n  网站主题样式：\r\n  <el-select v-model=\"themeName\" @change=\"changeThemeName\">\r\n    <el-option value=\"default\" label=\"默认主题\"></el-option>\r\n    <el-option value=\"dark\" label=\"暗黑模式\"></el-option>\r\n  </el-select>\r\n\r\n  <el-button @click=\"resetElementCss\">重置</el-button>\r\n\r\n  <el-row v-for=\"(item, index) in Object.keys(cssVariableList)\">\r\n    {{ item }} {{ cssVariableList[item] }}\r\n    <el-color-picker\r\n      v-model=\"cssVariableList[item]\"\r\n      @change=\"changeThemeColor($event, item)\"\r\n    ></el-color-picker>\r\n  </el-row>\r\n</template>\r\n\r\n<style scoped></style>\r\n",
    id: 'def',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 2,
  },
  {
    name: '备份数据',
    sfc: "<script setup>\r\nconst backData = () => {\r\n  window.axios\r\n    .post(window.posttiger.appUrl + '/backup', {\r\n      data: window.db.serialize(),\r\n    })\r\n    .then((res) => {\r\n      window.services.ui.ElMessage.success('数据备份云端成功')\r\n    })\r\n}\r\n\r\nconst syncData = () => {\r\n  window.axios\r\n    .get(window.posttiger.appUrl + '/syncData')\r\n    .then((res) => {\r\n      window.db.loadJSON(res.data)\r\n      window.db.saveDatabase()\r\n      window.services.ui.ElMessage.success('同步数据成功，刷新浏览器生效')\r\n    })\r\n}\r\n</script>\r\n\r\n<template>\r\n  <el-button @click=\"backData\">备份数据</el-button>\r\n  <el-button @click=\"syncData\">同步最新数据</el-button>\r\n</template>\r\n\r\n<style scoped></style>",
    id: 'innerC',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 3,
  },
  {
    name: '全局变量管理',
    sfc: '<script setup>\r\nimport { ref, onMounted } from \'vue\'\r\n// 读取API\r\nconst envVariable = ref(\r\n  JSON.stringify(\r\n    window.posttiger.db(\'VariablePlugin\').collection.findOne() || {},\r\n    null,\r\n    2,\r\n  ),\r\n)\r\n\r\nconst saveVariable = () => {\r\n  window.posttiger\r\n    .db(\'VariablePlugin\')\r\n    .cleanInsert(JSON.parse(envVariable.value))\r\n  window.services.ui.ElMessage.success(\'保存成功\')\r\n}\r\n\r\nonMounted(() => {\r\n  console.log(\'注册插件\')\r\n  window.posttiger.register({\r\n    name: \'变量替换插件\',\r\n    beforePost: (apiInfo) => {\r\n      // 获取当前环境\r\n      let envVariableJson = window.posttiger\r\n        .db(\'VariablePlugin\')\r\n        .collection.findOne()\r\n      if (!envVariableJson || !envVariableJson.globalEnv) {\r\n        return\r\n      }\r\n      /**\r\n       * {\r\n       *   "globalEnv": "dev",\r\n       *   "envProps": {\r\n       *     "globalEnv": {\r\n       *       "dev": {\r\n       *         "url": "http://localhost:8080/",\r\n       *         "token": "123"\r\n       *       },\r\n       *       "test": {\r\n       *         "url": "http://localhost:8081/",\r\n       *         "token": "123"\r\n       *       }\r\n       *     }\r\n       *   }\r\n       * }\r\n       */\r\n      let globalEnvKey = envVariableJson.globalEnv\r\n      let globalEnvData = envVariableJson.envProps.globalEnv[globalEnvKey]\r\n\r\n      // 替换url、支持mockjs使用\r\n      for (let key in globalEnvData) {\r\n        apiInfo.url = apiInfo.url.replaceAll(\r\n          \'{{\' + key + \'}}\',\r\n          globalEnvData[key],\r\n        )\r\n        apiInfo.url = window.lib.Mock.mock(apiInfo.url)\r\n        // 替换header信息\r\n        for (let h in apiInfo.headers) {\r\n          apiInfo.headers[h] = apiInfo.headers[h].replaceAll(\r\n            \'{{\' + h + \'}}\',\r\n            apiInfo.headers[h],\r\n          )\r\n          apiInfo.headers[h] = window.lib.Mock.mock(apiInfo.headers[h])\r\n        }\r\n\r\n        // 替换body信息\r\n        for (let h in apiInfo.requestBody) {\r\n          if (typeof apiInfo.requestBody[h] !== \'string\') {\r\n            continue\r\n          }\r\n          apiInfo.requestBody[h] = apiInfo.requestBody[h].replaceAll(\r\n            \'{{\' + h + \'}}\',\r\n            apiInfo.requestBody[h],\r\n          )\r\n          apiInfo.requestBody[h] = window.lib.Mock.mock(apiInfo.requestBody[h])\r\n        }\r\n\r\n        // 替换请求参数信息\r\n        for (let h in apiInfo.queryParams) {\r\n          if (typeof apiInfo.queryParams[h] !== \'string\') {\r\n            continue\r\n          }\r\n          apiInfo.queryParams[h] = apiInfo.queryParams[h].replaceAll(\r\n            \'{{\' + h + \'}}\',\r\n            apiInfo.queryParams[h],\r\n          )\r\n          apiInfo.queryParams[h] = window.lib.Mock.mock(apiInfo.queryParams[h])\r\n        }\r\n      }\r\n      console.log(apiInfo)\r\n    },\r\n    afterPost: (apiInfo) => {\r\n      console.log(apiInfo)\r\n    },\r\n    enable: true,\r\n  })\r\n})\r\n\r\nlet timer = null\r\nconst changeData = (value) => {\r\n  envVariable.value = value\r\n  if (timer != null) {\r\n    clearTimeout(timer)\r\n    timer = null\r\n  }\r\n  timer = setTimeout(() => {\r\n    // 保存配置\r\n    saveVariable()\r\n  }, 5000)\r\n}\r\n</script>\r\n\r\n<template>\r\n  <el-row :gutter="20">\r\n    <el-col :span="24">\r\n      <div style="height: 80vh">\r\n        <Editor\r\n          language="json"\r\n          :code="envVariable"\r\n          @changeData="changeData"\r\n        ></Editor>\r\n      </div>\r\n    </el-col>\r\n    <!--    <el-col :span="12">-->\r\n    <!--      <el-button @click="saveVariable">保存</el-button>-->\r\n    <!--    </el-col>-->\r\n  </el-row>\r\n</template>\r\n\r\n<style scoped></style>\r\n',
    id: 'innerD',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 4,
  },
  {
    name: 'curl导入',
    sfc: "<script setup>\r\nimport { ref } from 'vue'\r\n\r\nconst curlData = ref('')\r\n\r\nconst curlParse = () => {\r\n  window.axios\r\n    .post(window.posttiger.appUrl + '/curlParse', {\r\n      curl: curlData.value.replaceAll('\\t', '  '),\r\n    })\r\n    .then((res) => {\r\n      let parseData = res.data.data\r\n      console.log(parseData)\r\n      // 保存新的API\r\n      let apiInfo = {\r\n        id: window.lib.uid(),\r\n        headers: parseData.header\r\n          ? JSON.stringify(parseData.header, null, 2)\r\n          : '',\r\n        label: parseData.url,\r\n        nodeType: 'api',\r\n        parentId: 0,\r\n        requestBody: parseData.data\r\n          ? JSON.stringify(parseData.data, null, 2)\r\n          : '',\r\n        queryParams: parseData.params\r\n          ? JSON.stringify(parseData.params, null, 2)\r\n          : '',\r\n        requestHeader: '',\r\n        method: parseData.method,\r\n        url: parseData.url,\r\n        children: [],\r\n      }\r\n      console.log(apiInfo)\r\n      window.posttiger\r\n        .db('apiList')\r\n        .insertOrUpdate({ url: apiInfo.url }, apiInfo)\r\n      window.bus.emit('saveApi', apiInfo)\r\n      window.services.ui.ElMessage.success('导入成功')\r\n    })\r\n}\r\n</script>\r\n\r\n<template>\r\n  <el-row :gutter=\"20\">\r\n    <el-col :span=\"20\">\r\n      <div style=\"height: 80vh\">\r\n        <Editor\r\n          language=\"curl\"\r\n          :code=\"curlData\"\r\n          @changeData=\"(data) => {curlData = data}\"\r\n        ></Editor>\r\n      </div>\r\n    </el-col>\r\n    <el-col :span=\"4\">\r\n      <el-button type=\"primary\" @click=\"curlParse\">解析curl命令</el-button>\r\n    </el-col>\r\n  </el-row>\r\n</template>\r\n\r\n<style scoped></style>\r\n",
    id: 'innerE',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 5,
  },
  {
    id: '50249d18b95',
    name: '接口文档记录',
    sfc: '<script setup>\r\nimport { ref, onMounted } from \'vue\'\r\n// 读取API\r\nconst envVariable = ref(\r\n  window.posttiger.db(\'ApiDocPlugin\').collection.findOne()?.data || \'\'\r\n)\r\n\r\nconst saveVariable = () => {\r\n  window.posttiger\r\n    .db(\'ApiDocPlugin\')\r\n    .cleanInsert({data: envVariable.value})\r\n  window.services.ui.ElMessage.success(\'保存成功\')\r\n}\r\n\r\nlet timer = null\r\nconst changeData = (value) => {\r\n  envVariable.value = value\r\n  if (timer != null) {\r\n    clearTimeout(timer)\r\n    timer = null\r\n  }\r\n  timer = setTimeout(() => {\r\n    // 保存配置\r\n    saveVariable()\r\n  }, 5000)\r\n}\r\n</script>\r\n\r\n<template>\r\n  <el-row :gutter="20">\r\n    <el-col :span="24">\r\n      <div style="height: 80vh">\r\n        <Editor\r\n          language="text"\r\n          :code="envVariable"\r\n          @changeData="changeData"\r\n        ></Editor>\r\n      </div>\r\n  </el-row>\r\n</template>\r\n\r\n<style scoped></style>\r\n\r\n',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 6,
  },
  {
    id: '17e29cb956f',
    name: '新增插件',
    sfc: '<template>\n  <div style="height: 80vh">\n\n    <VueVditor v-model="content" :options="options" @after="handleAfter" class="editor"></VueVditor>\n\n  </div>\n</template>\n\n<script setup>\n  import { ref } from \'vue\'\n\n  const options = ref({\n    height: \'60vh\'\n  })\n</script>\n',
    meta: {
      revision: 0,
      created: 1703676104282,
      version: 0,
    },
    $loki: 7,
  },
]
