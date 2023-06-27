import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import Registr from '@/views/Registr.vue'

Vue.use(VueRouter)

function castRouteParams(route: Route) {
  return {
    sn: Number(route.params.sn),
  };
}

const routes = [
      {
        path: '/',
        redirect: '/registr'
      },
      {
        path: '/registr/:sn?',
        name: 'registr',
        props: castRouteParams,
        component: Registr
      },
      {
        path: '/faceted',
        name: 'faceted',
        component: () => import(/* webpackChunkName: "faceted" */ '@/views/FacetedSearch.vue')
      },
      {
        path: '/measures',
        name: 'measures',
        component: () => import(/* webpackChunkName: "statistic" */ '@/views/Measures.vue')
      },
      {
        path: '/status/:sn?',
        name: 'status',
        // props: true,
        props: castRouteParams,
        component: () => import(/* webpackChunkName: "status" */ '@/views/Status.vue'),
      },
      {
        path: '/signin',
        name: 'signin',
        component: () => import(/* webpackChunkName: "signin" */ '@/views/SignIn.vue'),
      },
      {
        path: '/adduser',
        name: 'adduser',
        component: () => import(/* webpackChunkName: "adduser" */ '@/views/AddUser.vue'),
      },
      {
        path: '/develop',
        name: 'develop',
        component: () => import(/* webpackChunkName: "develop" */ '@/views/Develop.vue'),
      },
      {
        path: '/404',
        name: '404',
        component: () => import('@/views/404.vue'),
      },
      { path: '*', redirect: '/404' },
  
    ] 

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})



export default router
