//对外暴露配置路由(常量路由)
export const constantRoute = [
  {
    path: '/',
    component: () => import('@/views/scripts/index.vue'),
    name: 'home',
  },
  {
    path: '/script',
    component: () => import('@/views/scripts/index.vue'),
    name: 'script',
  },
  {
    path: '/config',
    component: () => import('@/views/config/index.vue'),
    name: 'config',
  },
  {
    path: '/redirect',
    component: () => import('@/views/scripts/redirect.vue'),
    name: 'redirect',
  },
  {
    path: '/form',
    component: () => import('@/views/form/index.vue'),
    name: 'form',
  },
  {
    path: '/json',
    component: () => import('@/views/json/index.vue'),
    name: 'json',
  },
]
