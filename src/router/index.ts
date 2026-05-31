import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const RecordView = () => import('@/views/RecordView.vue')
const HistoryView = () => import('@/views/HistoryView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'record', component: RecordView },
  { path: '/history', name: 'history', component: HistoryView },
  { path: '/settings', name: 'settings', component: SettingsView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
