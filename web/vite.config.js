import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
//引入svg需要用到插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  base: './', // 设置为 './' 表示资源文件的引用路径不带前缀
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'), // 相对路径别名配置，使用 @ 代替 src
    },
  },
  server: {
    port: 1100,
    open: true,
  },
  build: {
    //VITE 打包不使用HASH文件名
    rollupOptions: {
      output: {
        entryFileNames: 'js/index.js',
        assetFileNames: 'asset/[name][extname]',
        chunkFileNames: 'js/[name].js',
      },
    },
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     //生产环境时移除console
    //     // drop_console: true,
    //     // drop_debugger: true,
    //   },
    // },
  },
})
