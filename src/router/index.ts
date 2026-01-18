import { createRouter, createWebHistory } from 'vue-router'
import pageRoutes from './page-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...pageRoutes,
    {
      name: 'notFound',
      path: '/:pathMatch(.*)*',
      component: () => import('../layout/not-found/not-found.vue'),
    },
  ],
})

router.beforeEach((to, from) => {
  console.log(`[${from.path}] ---> [${to.path}]`)
})

export default router
