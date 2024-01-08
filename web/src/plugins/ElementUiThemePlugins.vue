<script setup>
import { ref } from 'vue'

const defaultTheme = {
  '--el-color-white': '#ffffff',
  '--el-color-black': '#000000',
  '--el-color-primary': '#409eff',
  '--el-color-success': '#67c23a',
  '--el-color-warning': '#e6a23c',
  '--el-color-danger': '#f56c6c',
  '--el-color-error': '#f56c6c',
  '--el-color-info': '#909399',
  // '--el-color-primary-light-3': '#79bbff',
  // '--el-color-primary-light-5': '#a0cfff',
  // '--el-color-primary-light-7': '#c6e2ff',
  // '--el-color-primary-light-8': '#d9ecff',
  // '--el-color-primary-light-9': '#ecf5ff',
  // '--el-color-primary-dark-2': '#337ecc',
  // '--el-color-success': '#67c23a',
  // '--el-color-success-light-3': '#95d475',
  // '--el-color-success-light-5': '#b3e19d',
  // '--el-color-success-light-7': '#d1edc4',
  // '--el-color-success-light-8': '#e1f3d8',
  // '--el-color-success-light-9': '#f0f9eb',
  // '--el-color-success-dark-2': '#529b2e',
  // '--el-color-warning': '#e6a23c',
  // '--el-color-warning-light-3': '#eebe77',
  // '--el-color-warning-light-5': '#f3d19e',
  // '--el-color-warning-light-7': '#f8e3c5',
  // '--el-color-warning-light-8': '#faecd8',
  // '--el-color-warning-light-9': '#fdf6ec',
  // '--el-color-warning-dark-2': '#b88230',
  // '--el-color-danger': '#f56c6c',
  // '--el-color-danger-light-3': '#f89898',
  // '--el-color-danger-light-5': '#fab6b6',
  // '--el-color-danger-light-7': '#fcd3d3',
  // '--el-color-danger-light-8': '#fde2e2',
  // '--el-color-danger-light-9': '#fef0f0',
  // '--el-color-danger-dark-2': '#c45656',
  // '--el-color-error': '#f56c6c',
  // '--el-color-error-light-3': '#f89898',
  // '--el-color-error-light-5': '#fab6b6',
  // '--el-color-error-light-7': '#fcd3d3',
  // '--el-color-error-light-8': '#fde2e2',
  // '--el-color-error-light-9': '#fef0f0',
  // '--el-color-error-dark-2': '#c45656',
  // '--el-color-info': '#909399',
  // '--el-color-info-light-3': '#b1b3b8',
  // '--el-color-info-light-5': '#c8c9cc',
  // '--el-color-info-light-7': '#dedfe0',
  // '--el-color-info-light-8': '#e9e9eb',
  // '--el-color-info-light-9': '#f4f4f5',
  // '--el-color-info-dark-2': '#73767a',
  // '--el-bg-color': '#ffffff',
  // '--el-bg-color-page': '#f2f3f5',
  // '--el-bg-color-overlay': '#ffffff',
  // '--el-text-color-primary': '#303133',
  // '--el-text-color-regular': '#606266',
  // '--el-text-color-secondary': '#909399',
  // '--el-text-color-placeholder': '#a8abb2',
  // '--el-text-color-disabled': '#c0c4cc',
  // '--el-border-color': '#dcdfe6',
  // '--el-border-color-light': '#e4e7ed',
  // '--el-border-color-lighter': '#ebeef5',
  // '--el-border-color-extra-light': '#f2f6fc',
  // '--el-border-color-dark': '#d4d7de',
  // '--el-border-color-darker': '#cdd0d6',
  // '--el-fill-color': '#f0f2f5',
  // '--el-fill-color-light': '#f5f7fa',
  // '--el-fill-color-lighter': '#fafafa',
  // '--el-fill-color-extra-light': '#fafcff',
  // '--el-fill-color-dark': '#ebedf0',
  // '--el-fill-color-darker': '#e6e8eb',
  // '--el-fill-color-blank': '#ffffff',
}

const cssVariableList = ref(
  window.posttiger
    .db('ElementUiThemePlugins')
    .collection.findOne({ type: 'element-ui' })?.cssVariableList || {
    ...defaultTheme,
  },
)

const themeName = ref(
  window.posttiger
    .db('ElementUiThemePlugins')
    .collection.findOne({ type: 'element-ui' })?.themeName || 'default',
)
const changeThemeColor = (color, themeKey) => {
  console.log('changeThemeColor', color, themeKey)
  cssVariableList.value[themeKey] = color
  saveElementCss()
  // 发布主题改变事件
  window.bus.emit('themePlugin:changeTheme', [themeKey, color])
}

const resetElementCss = () => {
  cssVariableList.value = defaultTheme
  saveElementCss()
  window.bus.emit('themePlugin:changeTheme', ['reset', 'default', defaultTheme])
}

const saveElementCss = () => {
  window.posttiger.db('ElementUiThemePlugins').insertOrUpdate(
    { type: 'element-ui' },
    {
      type: 'element-ui',
      themeName: themeName.value,
      cssVariableList: cssVariableList.value,
    },
  )
}

const vsCodeThemeName = ref(
  window.posttiger
    .db('ElementUiThemePlugins')
    .collection.findOne({ type: 'vscodeTheme' })?.data || 'EvaLight',
)

const changeThemeName = (data) => {
  console.log('changeThemeName', data)
  changeThemeColor(data, 'themeName')
  saveElementCss()
}

const vsCodeThemeList = ref([
  'AtlanticNight',
  'AtomOneDark',
  'AuroraX',
  'AyuDark',
  'AyuLight',
  'BlulocoLight',
  'BracketsLightPro',
  'CodeSandBox',
  'Darktooth',
  'Dracula',
  'EvaLight',
  'FlatUI',
  'Hopscotch',
  'HorlaLightTheme',
  'HybridNext',
  'KimbieDark',
  'LaserWave',
  'Lucario',
  'Min',
  'MonokaiDimmed',
  'MonokaiPro',
  'Nebula',
  'NoctisAzureus',
  'NoctisBordo',
  'NoctisLux',
  'OneDarkPro',
  'OneMonokai',
  'Panda',
  'RemedyDark',
  'ReUI',
  'ShadesOfPurple',
  'SnazzyLight',
  'SnazzyOperator',
  'SublimeMaterialThemeDark',
  'SynthWave84',
  'TokyoNightStorm',
  'TomorrowNightBlue',
  'Twilight',
  'WinterIsComing',
])
const changeVsCodeThemeName = (data) => {
  console.log('changeVsCodeThemeName', data)
  // window.bus.emit('themePlugin:changeVsCodeThemeName', data)
  window.posttiger
    .db('ElementUiThemePlugins')
    .insertOrUpdate(
      { type: 'vscodeTheme' },
      { type: 'vscodeTheme', data: data },
    )
}
</script>

<template>
  VsCode主题：
  <el-select v-model="vsCodeThemeName" @change="changeVsCodeThemeName">
    <el-option
      :value="item"
      :label="item"
      v-for="(item, index) in vsCodeThemeList"
    ></el-option>
  </el-select>
  <br />
  <br />
  网站主题样式：
  <el-select v-model="themeName" @change="changeThemeName">
    <el-option value="default" label="默认主题"></el-option>
    <el-option value="dark" label="暗黑模式"></el-option>
  </el-select>

  <el-button @click="resetElementCss">重置</el-button>

  <el-row v-for="(item, index) in Object.keys(cssVariableList)">
    {{ item }} {{ cssVariableList[item] }}
    <el-color-picker
      v-model="cssVariableList[item]"
      @change="changeThemeColor($event, item)"
    ></el-color-picker>
  </el-row>
</template>

<style scoped></style>
