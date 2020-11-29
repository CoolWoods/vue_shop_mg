import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
// 按需导入element
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局CSS
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
import store from './store'
// 配置axios根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
