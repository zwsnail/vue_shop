import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
//tree-table dependency
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)


import axios from 'axios'
//挂在vue原型对象上，每个vue组件都可以this.$http
Vue.prototype.$http = axios
//配置请求的根路径，来自api
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
// axios.default.headers['mytoken'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjUwMCwicmlkIjowLCJpYXQiOjE1ODMyODgxNjMsImV4cCI6MTU4MzM3NDU2M30.LBFXgTMuRJ-D3ozdcdhqRQ10Uou91V-Fuk98PoneaPA' //设置请求头
// axios.default.timeout = 3000; // 超时时间
axios.interceptors.request.use(config => {  //对请求进行预处理
  console.log(config);      //挂载anthorization在config的headers上，config有很多东西
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
