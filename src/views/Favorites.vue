<script setup>
import { computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import { buildings, getLocationsByBuilding, toggleFavorite } from '../stores/campusStore'

const favoriteBuildings = computed(() => buildings.value.filter(building => building.isFavorite))
</script>

<template>
  <div class="site-shell">
    <NavBar />
    <main class="main-content">
      <header class="page-heading">
        <div><p class="eyebrow">Your go-to places</p><h1>Saved favorites</h1><p>Quick access to the buildings you visit most.</p></div>
        <router-link to="/directory" class="btn btn-secondary">Find a building</router-link>
      </header>
      <section v-if="favoriteBuildings.length" class="favorites-grid">
        <article v-for="building in favoriteBuildings" :key="building.id" class="favorite-card">
          <div class="building-card-top">
            <div><p class="eyebrow">{{ building.location }}</p><h3>{{ building.name }}</h3></div>
            <button class="icon-button is-favorite" :aria-label="`Remove ${building.name} from favorites`" title="Remove from favorites" @click="toggleFavorite(building.id)">★</button>
          </div>
          <p>{{ building.description }}</p>
          <div class="card-meta"><span class="code-pill">{{ building.code }}</span><span>{{ building.floors }} floors</span><span>{{ getLocationsByBuilding(building.id).length }} places</span></div>
          <div class="location-list">
            <div class="location-list-title">Useful places</div>
            <div v-for="location in getLocationsByBuilding(building.id).slice(0, 3)" :key="location.id" class="map-location">
              <strong>{{ location.name }}</strong><span>Room {{ location.room }}</span>
            </div>
            <p v-if="!getLocationsByBuilding(building.id).length" class="table-secondary">No places listed yet.</p>
          </div>
          <router-link class="btn btn-secondary btn-sm" :to="{ path: '/map', query: { building: building.id } }">View on campus map ↗</router-link>
        </article>
      </section>
      <section v-else class="panel empty-state">
        <strong>No saved buildings yet</strong>
        <p>Tap the star on a building in the campus map or directory to keep it here.</p>
        <router-link to="/map" class="btn">Explore the map</router-link>
      </section>
    </main>
  </div>
</template>
