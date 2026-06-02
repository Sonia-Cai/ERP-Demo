import { createRouter, createWebHashHistory } from 'vue-router'
import OperationsDashboardPage from '@/pages/OperationsDashboardPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'operations-dashboard', component: OperationsDashboardPage },
    /** 历史 Demo 路径：保留重定向，避免书签或文档链接失效 */
    { path: '/demo/operations-dashboard', redirect: '/' },
  ],
})

export default router
