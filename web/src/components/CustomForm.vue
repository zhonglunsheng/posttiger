<template>
  <div>
    <component :is="asyncComponent" v-bind="$attrs" />
  </div>
</template>

<script setup>
import * as Vue from 'vue'
import { loadModule } from 'vue3-sfc-loader'
import { defineAsyncComponent, defineComponent } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
const props = defineProps({
  sfc: String,
})
// const sfcContent = window.localStorage.getItem("sfcContent");
const sfcContent = props.sfc

const options = {
  moduleCache: {
    vue: Vue,
  },
  async getFile(url) {
    return await Promise.resolve(sfcContent)
  },
  addStyle() {
    /* unused here */
  },
}
let asyncComponent = null

try {
  asyncComponent = defineAsyncComponent({
    loader: () => loadModule('/vue/v3test.vue', options),
    errorComponent: ErrorComponent,
  })
  // asyncComponent = defineComponent(() => loadModule('/vue/v3test.vue', options))
} catch (error) {
  console.log(error)
}

console.log(asyncComponent)
// try {
//   const asyncComponent = defineAsyncComponent(() =>
//     loadModule('/vue/v3test.vue', options),
//   )
//   console.log(asyncComponent)
// } catch (error) {
//   console.log(error)
// }
</script>
