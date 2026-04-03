import { createRouter, createWebHistory } from 'vue-router'
import { useConnectionStore } from '../stores/connection'

const routes = [
  {
    path: '/connect',
    name: 'connect',
    component: () => import('../components/connection/ConnectionScreen.vue'),
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    beforeEnter: (to, from, next) => {
      const connection = useConnectionStore()
      if (!connection.connected) {
        next('/connect')
      } else {
        next()
      }
    },
    children: [
      {
        path: '',
        name: 'chat',
        component: () => import('../views/ChatPage.vue'),
      },
      {
        path: 'chat/:id',
        name: 'chat-id',
        component: () => import('../views/ChatPage.vue'),
        props: true,
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsPage.vue'),
      },
      {
        path: 'settings/:tab',
        name: 'settings-tab',
        component: () => import('../views/SettingsPage.vue'),
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
