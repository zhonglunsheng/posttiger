<script setup>
import { useRouter, useRoute } from 'vue-router'

//获取路由器对象
let router = useRouter()
let route = useRoute()
console.log(route)
let redirectPath = route?.query?.url || '/script'
if (redirectPath) {
  router.push({
    path: redirectPath,
    query: {
      ...route.query,
    },
  })
}
</script>

<template></template>
