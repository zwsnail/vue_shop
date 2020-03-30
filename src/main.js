import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import axios from 'axios'
//挂在vue原型对象上，每个vue组件都可以this.$http
Vue.prototype.$http = axios
//配置请求的根路径，来自api
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
