import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'view-design/dist/styles/iview.css'
import api from '@/utils/api'
import { ExportTypesInit } from "@/static/exposeType";

// Отключем предупреждение о работе в режиме разработки.
Vue.config.productionTip = false

// Восстановим токен после обновления страницы
const token = localStorage.getItem('user-token')

if (token) {
  api.token = token
}

api.baseURL = process.env.VUE_APP_URL + "/api"

if (process.env.VUE_APP_VERSION === "dev") {
  api.debugDelay = true
  Vue.config.productionTip = true
}

ExportTypesInit()


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
