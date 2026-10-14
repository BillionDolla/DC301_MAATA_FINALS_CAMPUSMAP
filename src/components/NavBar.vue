<script setup>
import { useRoute } from 'vue-router'
import { favorites } from '../stores/campusStore'

const route = useRoute()
const navItems = [
  { path: '/', label: 'Overview', icon: '⌂' },
  { path: '/map', label: 'Campus map', icon: '⌖' },
  { path: '/directory', label: 'Directory', icon: '▤' },
  { path: '/favorites', label: 'Favorites', icon: '☆' },
  { path: '/settings', label: 'Settings', icon: '⚙' }
]
</script>

<template>
  <header class="topbar">
    <router-link to="/" class="brand">
      <span class="brand-mark">⌖</span>
      <span>Campus Guide<small>Map & location directory</small></span>
    </router-link>
    <nav class="nav-links" aria-label="Main navigation">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: route.path === item.path }"
      >
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.path === '/favorites' && favorites.length" class="favorite-badge">{{ favorites.length }}</span>
      </router-link>
    </nav>
    <router-link to="/map" class="nav-home">Explore campus <span aria-hidden="true">↗</span></router-link>
  </header>
</template>
