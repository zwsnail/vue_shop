import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
//tree-table dependency
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

//安装富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
// 生产环境下不引用，使用外部加载
// if (process.env.NODE_ENV === 'development') {
//   import ('quill/dist/quill.core.css');
//   import ('quill/dist/quill.snow.css');
//   import ('quill/dist/quill.bubble.css');
// }
import ('quill/dist/quill.core.css');
import ('quill/dist/quill.snow.css');
import ('quill/dist/quill.bubble.css');
Vue.use(VueQuillEditor); // 注册为全局引用组件

//过滤时间
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal * 1000)

  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0'); //设置为两位，不足两位用0填充，比如一月 = 01
  // const m = ("0" + dt.getMonth() + 1).slice(-2);
  const d = (dt.getDate() + '').padStart(2, '0');
  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');
  // 'abc'.padStart(10);         // "       abc"
  // 'abc'.padStart(10, "foo");  // "foofoofabc"
  // 'abc'.padStart(6,"123465"); // "123abc"
  // 'abc'.padStart(8, "0");     // "00000abc"
  // 'abc'.padStart(1);          // "abc"
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})


import axios from 'axios'
//挂在vue原型对象上，每个vue组件都可以this.$http
Vue.prototype.$http = axios
//配置请求的根路径，来自api
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
// axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
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
