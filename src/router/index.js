import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import '../assets/css/global.css'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'

Vue.use(VueRouter)

const routes = [
]

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login'},
    { path: '/login', component: Login },
    { 
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
      {path: '/welcome', component: Welcome},
      {path: '/users', component: Users}
    ]}
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  //除开login其他都要有token才放行
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login') //强制跳转
  next();
})

export default router
