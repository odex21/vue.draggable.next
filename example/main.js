import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'vue-global-api'

import routes from './route'
import store from './store'
import ElementPlus from 'element-plus'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.css'
import 'element-plus/lib/theme-chalk/index.css'

import 'bootstrap'

const router = createRouter({
  history: createWebHashHistory('/vue.draggable.next/'),
  routes,
})

const app = createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
router.isReady().then(() => app.mount('#app'))
