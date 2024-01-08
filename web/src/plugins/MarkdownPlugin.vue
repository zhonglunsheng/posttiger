<template>
  <Markdown :options="options" @changeData="changeData"></Markdown>
</template>

<script setup>
import { ref } from 'vue'
const options = ref({
  height: '70vh',
  theme: 'dark',
})
const changeData = (vueEditor) => {
  console.log(vueEditor)
}
</script>

<style></style>
