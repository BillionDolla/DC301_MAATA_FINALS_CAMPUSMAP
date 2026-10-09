import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import CampusMap from '../views/CampusMap.vue'
import BuildingDirectory from '../views/BuildingDirectory.vue'
import Favorites from '../views/Favorites.vue'
import Settings from '../views/Settings.vue'

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

export default router