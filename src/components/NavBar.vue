<script setup>
import { useRouter, useRoute } from 'vue-router'
import { favorites } from '../stores/campusStore'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/map', label: 'Campus Map', icon: '🗺️' },
  { path: '/directory', label: 'Building Directory', icon: '🏢' },
  { path: '/favorites', label: 'Favorites', icon: '⭐' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
]
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/" class="brand-link">🗺️ Campus Guide</router-link>
    </div>
    <div class="nav-links">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: route.path === item.path }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.path === '/favorites'" class="favorite-badge">{{ favorites.length }}</span>
      </router-link>
    </div>
    <router-link to="/" class="nav-home">🏠 Home</router-link>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.brand-link:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
}

.nav-link.active {
  background: #3498db;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-label {
  font-weight: 500;
}

.favorite-badge {
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 1.5rem;
  text-align: center;
}

.nav-home {
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  transition: all 0.2s;
}

.nav-home:hover {
  background: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    gap: 1rem;
  }
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  .nav-label {
    display: none;
  }
}
</style>