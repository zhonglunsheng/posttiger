<template>
  <div style="height: 40vh">
    <div class="json" />
  </div>
</template>

<script>
import JSONEditor from 'jsoneditor'

export default {
  props: {
    name: String,
    modelValue: {
      type: [String, Number, Object, Array],
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      jsonEditor: null,
      internalChange: false,
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    modelValue: {
      handler(json) {
        if (!this.internalChange) {
          this.setValue(json)
        }
      },
    },
  },
  methods: {
    init() {
      let self = this
      this.jsonEditor = new JSONEditor(
        self.$el.querySelector('.json'),
        {
          mode: 'tree',
          modes: ['code', 'view', 'tree'],
          indentation: 4,
          name: this.name,
          mainMenuBar: true,
          onChange() {
            self.internalChange = true
            self.$emit('update:modelValue', self.jsonEditor.getText())
            // 防止双向绑定重复刷新数据
            self.$nextTick(function () {
              self.internalChange = false
            })
          },
        },
        self.modelValue,
      )
      this.setValue(this.modelValue)
      // 去除作者信息
      // document.getElementsByClassName('jsoneditor-poweredBy').item(0).remove()
    },
    setValue(jsonStr) {
      if (this.jsonEditor) {
        try {
          if (typeof jsonStr === 'string') {
            this.jsonEditor.set(jsonStr ? JSON.parse(jsonStr) : '')
          } else {
            this.jsonEditor.set('')
          }
        } catch (e) {}
      }
    },
  },
}
</script>

<style>
.json {
  height: 100%;
}
</style>
