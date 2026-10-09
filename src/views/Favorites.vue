<script setup>
import { computed } from 'vue'
import { buildings, locations, toggleFavorite } from '../stores/campusStore'

const favorites = computed(() => buildings.value.filter(b => b.isFavorite))

function getLocationsForBuilding(buildingId) {
  return locations.value.filter(l => l.buildingId === buildingId)
}
</script>

<template>
  <div class="page-container">
    <NavBar />
    
    <main class="main-content">
      <header class="page-header">
        <h1>⭐ Favorites</h1>
        <p>Your bookmarked buildings for quick access</p>
      </header>

      <section v-if="favorites.length === 0" class="card empty-state">
        <div class="empty-content">
          <span class="empty-icon">⭐</span>
          <h2>No favorites yet</h2>
          <p>Click the star icon on any building in the Campus Map or Building Directory to add it to your favorites.</p>
          <router-link to="/map" class="btn btn-primary">Explore Buildings</router-link>
        </div>
      </section>

      <section v-else class="card">
        <div class="card-header">
          <h2>Favorite Buildings ({{ favorites.length }})</h2>
        </div>
        
        <div class="favorites-grid">
          <div v-for="building in favorites" :key="building.id" class="favorite-card">
            <div class="fav-header">
              <h3>{{ building.name }}</h3>
              <button @click="toggleFavorite(building.id)" class="fav-remove" title="Remove from favorites">⭐</button>
            </div>
            <span class="building-code">{{ building.code }}</span>
            <p class="building-desc">{{ building.description }}</p>
            <div class="building-meta">
              <span>📍 {{ building.location }}</span>
              <span>🏢 {{ building.floors }} floors</span>
            </div>
            <div class="building-facilities">
              <span v-for="f in building.facilities" :key="f" class="facility-tag">{{ f }}</span>
            </div>
            
            <div class="locations-preview">
              <h4>Key Locations:</h4>
              <div v-for="loc in getLocationsForBuilding(building.id).slice(0, 3)" :key="loc.id" class="location-item">
                <span class="loc-type">{{ loc.type }}</span>
                <span>{{ loc.name }}</span>
                <span class="loc-room">Room {{ loc.room }}</span>
              </div>
              <span v-if="getLocationsForBuilding(building.id).length > 3" class="more-locations">
                +{{ getLocationsForBuilding(building.id).length - 3 }} more locations
              </span>
            </div>
            
            <router-link :to="`/map`" class="btn btn-primary btn-sm">View Details</router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
export default { components: { NavBar } }
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f5f6fa; }
.main-content { max-width: 1000px; margin: 0 auto; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 0.5rem; color: #2c3e50; }
.page-header p { color: #7f8c8d; margin: 0; }

.card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.5rem; }
.card-header { margin-bottom: 1.5rem; }
.card-header h2 { margin: 0; color: #2c3e50; }

.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-content { max-width: 400px; margin: 0 auto; }
.empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; opacity: 0.5; }
.empty-content h2 { margin: 0 0 0.5rem; color: #2c3e50; }
.empty-content p { color: #7f8c8d; margin: 0 0 1.5rem; line-height: 1.6; }

.favorites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.favorite-card { border: 1px solid #e1e8ed; border-radius: 8px; padding: 1.5rem; background: #fafbfc; transition: all 0.2s; position: relative; }
.favorite-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.fav-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.fav-header h3 { margin: 0; color: #2c3e50; }
.fav-remove { background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s; }
.fav-remove:hover { background: #fadbd8; transform: scale(1.2); }
.building-code { background: #3498db; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 0.5rem; }
.building-desc { color: #7f8c8d; margin: 0.5rem 0; font-size: 0.9rem; }
.building-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: #95a5a6; margin-bottom: 0.75rem; }
.building-facilities { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 1rem; }
.facility-tag { background: #e8f4fd; color: #2980b9; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.7rem; }
.locations-preview { border-top: 1px solid #e1e8ed; padding-top: 1rem; }
.locations-preview h4 { margin: 0 0 0.5rem; font-size: 0.85rem; color: #2c3e50; }
.location-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.8rem; }
.loc-type { background: #3498db; color: white; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.65rem; text-transform: uppercase; }
.loc-room { color: #7f8c8d; font-size: 0.75rem; }
.more-locations { display: block; color: #95a5a6; font-size: 0.8rem; margin-top: 0.5rem; }
.btn { display: inline-block; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; text-decoration: none; text-align: center; transition: all 0.2s; }
.btn-primary { background: #3498db; color: white; }
.btn-primary:hover { background: #2980b9; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; width: 100%; }

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .favorites-grid { grid-template-columns: 1fr; }
}
</style>