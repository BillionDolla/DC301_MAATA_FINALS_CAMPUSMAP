import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Landing from './views/Landing.vue'
import CampusMap from './views/CampusMap.vue'
import BuildingDirectory from './views/BuildingDirectory.vue'
import Favorites from './views/Favorites.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', component: Landing },
  { path: '/map', component: CampusMap },
  { path: '/directory', component: BuildingDirectory },
  { path: '/favorites', component: Favorites },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')