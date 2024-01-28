<template>
  <monacoEditor
    v-model="editorContent"
    :language="editorLanguage"
    @change="changeData"
    :theme="vsCodeTheme"
    @editor-mounted="editorMounted"
  ></monacoEditor>
</template>

<script setup>
// https://microsoft.github.io/monaco-editor/playground.html?source=v0.44.0#example-extending-language-services-completion-provider-example
import { ElMessage } from 'element-plus'
import monacoEditor from '@/components/editor/monacoEditor.vue'
import { format } from '@/utils/formatter'
import { lib } from '@/utils/lib'
import { ref, watch, onUnmounted, computed } from 'vue'
import * as monaco from 'monaco-editor'
const props = defineProps({
  code: String,
  language: {
    type: String,
    default: 'javascript',
  },
  theme: {
    type: String,
    default: 'myCustomTheme',
  },
  title: {
    type: String,
    default: '编辑器',
  },
})

const vsCodeTheme = ref(
  window.posttiger
    .db('ElementUiThemePlugins')
    .collection.findOne({ type: 'vscodeTheme' })?.data || props.theme,
)
const editorLanguage = ref(props.language)
const editorContent = ref(props.code)

let tempContent = ''
const editorMounted = (editor) => {
  editor.addAction({
    id: 'format', // 菜单项 id
    label: '格式化', // 菜单项名称
    keybindings: [
      // chord
      monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS),
    ],
    contextMenuGroupId: 'navigation', // 所属菜单的分组
    run: () => {
      tempContent = editorContent.value
      // formatter()
      format(props.language, editorContent.value)
        .then((res) => {
          editorContent.value = res
        })
        .catch((error) => {
          ElMessage.error('格式化错误\n' + error)
        })
    }, // 点击后执行的操作
  })
  editor.addAction({
    id: 'wordWrap', // 菜单项 id
    label: '自动换行', // 菜单项名称
    contextMenuGroupId: 'navigation', // 所属菜单的分组
    run: () => {
      editor.updateOptions({
        wordWrap: 'on',
        wrappingIndent: 'none',
      })
    },
  })
  editor.addAction({
    id: 'noWordWrap', // 菜单项 id
    label: '取消自动换行', // 菜单项名称
    contextMenuGroupId: 'navigation', // 所属菜单的分组
    run: () => {
      editor.updateOptions({
        wordWrap: 'off',
      })
    },
  })
  editor.addAction({
    id: 'formatBack', // 菜单项 id
    label: '取消格式化', // 菜单项名称
    keybindings: [
      // chord
      monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM),
    ],
    contextMenuGroupId: 'navigation', // 所属菜单的分组
    run: () => {
      if (tempContent) {
        editorContent.value = tempContent
      }
    },
  })
  let switchLanguage = lib.config.getConfigNestedValue('switchLanguage')
  let languageFormat = switchLanguage
    ? switchLanguage.map((item) => item.value)
    : undefined || ['json', 'html', 'javascript']
  for (let formatItem of languageFormat) {
    editor.addAction({
      id: formatItem, // 菜单项 id
      label: formatItem + '格式化', // 菜单项名称
      contextMenuGroupId: 'navigation', // 所属菜单的分组
      run: () => {
        tempContent = editorContent.value
        // formatter()
        format(formatItem, editorContent.value)
          .then((res) => {
            editorContent.value = res
            editorLanguage.value = formatItem
          })
          .catch((error) => {
            ElMessage.error('格式化错误\n' + error)
          })
      },
    })
  }
}

const emit = defineEmits(['updateCurrentTabStatus'])
const changeData = (value) => {
  emit('changeData', value)
}

onUnmounted(() => {
  window.bus.on('themePlugin:changeVsCodeThemeName', (data) => {
    vsCodeTheme.value = data
  })
})
</script>

<style>
.editor {
  width: 100%;
  height: 100%;
}
</style>
