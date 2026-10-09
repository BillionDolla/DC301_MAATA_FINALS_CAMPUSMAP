<script setup>
import { ref, computed } from 'vue'
import { buildings, locations, updateBuilding, deleteBuilding, toggleFavorite } from '../stores/campusStore'

const searchQuery = ref('')
const filterLocation = ref('')
const sortBy = ref('name')
const showForm = ref(false)
const editingBuilding = ref(null)

const buildingForm = ref({
  name: '', code: '', description: '', location: '', floors: 1, facilities: ''
})

const locationsList = computed(() => {
  let result = [...buildings.value]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    )
  }
  
  if (filterLocation.value) {
    result = result.filter(b => b.location === filterLocation.value)
  }
  
  result.sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    if (sortBy.value === 'code') return a.code.localeCompare(b.code)
    if (sortBy.value === 'location') return a.location.localeCompare(b.location)
    if (sortBy.value === 'floors') return b.floors - a.floors
    return 0
  })
  
  return result
})

const allLocations = computed(() => [...new Set(buildings.value.map(b => b.location))])

function resetForm() {
  buildingForm.value = { name: '', code: '', description: '', location: '', floors: 1, facilities: '' }
  editingBuilding.value = null
  showForm.value = false
}

function startEdit(b) {
  editingBuilding.value = b
  buildingForm.value = { ...b, facilities: b.facilities.join(', ') }
  showForm.value = true
}

function submitForm() {
  const data = {
    ...buildingForm.value,
    facilities: buildingForm.value.facilities.split(',').map(f => f.trim()).filter(f => f),
    floors: parseInt(buildingForm.value.floors)
  }
  
  if (editingBuilding.value) {
    updateBuilding(editingBuilding.value.id, data)
  }
  resetForm()
}

function confirmDelete(id) {
  if (confirm('Delete this building and all its locations?')) {
    deleteBuilding(id)
  }
}
</script>

<template>
  <div class="page-container">
    <NavBar />
    
    <main class="main-content">
      <header class="page-header">
        <h1>🏢 Building Directory</h1>
        <p>Browse and manage all campus buildings</p>
      </header>

      <section class="card">
        <div class="card-header">
          <h2>All Buildings ({{ locationsList.length }})</h2>
          <button @click="showForm = true; editingBuilding = null; resetForm()" class="btn btn-primary">+ Add Building</button>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              placeholder="Search buildings..." 
              class="search-input"
              @input="searchQuery = $event.target.value"
            >
            <span class="search-icon">🔍</span>
          </div>
          <div class="filters">
            <select v-model="filterLocation" class="filter-select">
              <option value="">All Locations</option>
              <option v-for="loc in allLocations" :key="loc" :value="loc">{{ loc }}</option>
            </select>
            <select v-model="sortBy" class="filter-select">
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code</option>
              <option value="location">Sort by Location</option>
              <option value="floors">Sort by Floors (desc)</option>
            </select>
          </div>
        </div>

        <div class="buildings-table-container">
          <table class="buildings-table">
            <thead>
              <tr>
                <th>Building</th>
                <th>Code</th>
                <th>Location</th>
                <th>Floors</th>
                <th>Facilities</th>
                <th>Locations</th>
                <th>Favorite</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in locationsList" :key="b.id">
                <td>
                  <strong>{{ b.name }}</strong>
                  <br><small>{{ b.description }}</small>
                </td>
                <td><span class="code-badge">{{ b.code }}</span></td>
                <td>{{ b.location }}</td>
                <td>{{ b.floors }}</td>
                <td>
                  <div class="facility-tags">
                    <span v-for="f in b.facilities" :key="f" class="facility-tag">{{ f }}</span>
                  </div>
                </td>
                <td>{{ getLocationCount(b.id) }}</td>
                <td>
                  <button @click="toggleFavorite(b.id)" class="fav-btn" :class="{ active: b.isFavorite }" :title="b.isFavorite ? 'Remove from favorites' : 'Add to favorites'">
                    {{ b.isFavorite ? '⭐' : '☆' }}
                  </button>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="startEdit(b)" class="btn-icon" title="Edit">✏️</button>
                    <button @click="confirmDelete(b.id)" class="btn-icon danger" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="locationsList.length === 0">
                <td colspan="8" class="empty-state">No buildings found. Add your first building!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Building Form Modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal" @click.stop>
          <h2>{{ editingBuilding ? 'Edit Building' : 'Add Building' }}</h2>
          <form @submit.prevent="submitForm" class="form">
            <div class="form-row">
              <label>Name *</label>
              <input v-model="buildingForm.name" required />
            </div>
            <div class="form-row">
              <label>Code *</label>
              <input v-model="buildingForm.code" required maxlength="5" style="text-transform: uppercase" />
            </div>
            <div class="form-row">
              <label>Description</label>
              <textarea v-model="buildingForm.description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label>Location *</label>
              <input v-model="buildingForm.location" required list="locations" />
              <datalist id="locations">
                <option v-for="loc in allLocations" :key="loc" :value="loc" />
              </datalist>
            </div>
            <div class="form-row">
              <label>Floors</label>
              <input type="number" v-model.number="buildingForm.floors" min="1" max="20" />
            </div>
            <div class="form-row">
              <label>Facilities (comma separated)</label>
              <input v-model="buildingForm.facilities" placeholder="e.g. Labs, Lecture Halls, Offices" />
            </div>
            <div class="form-actions">
              <button type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingBuilding ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
export default { components: { NavBar } }
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f5f6fa; }
.main-content { max-width: 1400px; margin: 0 auto; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 0.5rem; color: #2c3e50; }
.page-header p { color: #7f8c8d; margin: 0; }

.card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.card-header h2 { margin: 0; color: #2c3e50; }

.toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.search-box { position: relative; flex: 1; min-width: 250px; }
.search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #dfe6e9; border-radius: 8px; font-size: 1rem; }
.search-input:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.2); }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #95a5a6; }
.filters { display: flex; gap: 0.75rem; }
.filter-select { padding: 0.75rem 1rem; border: 1px solid #dfe6e9; border-radius: 8px; font-size: 0.9rem; background: white; }
.filter-select:focus { outline: none; border-color: #3498db; }

.buildings-table-container { overflow-x: auto; }
.buildings-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.buildings-table th, .buildings-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e1e8ed; }
.buildings-table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; white-space: nowrap; }
.buildings-table td { color: #2c3e50; }
.buildings-table tr:hover { background: #f8f9fa; }
.buildings-table small { color: #7f8c8d; display: block; margin-top: 0.25rem; }
.code-badge { background: #3498db; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.facility-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.facility-tag { background: #e8f4fd; color: #2980b9; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.7rem; }
.fav-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s; }
.fav-btn:hover { background: #fef9e7; transform: scale(1.2); }
.fav-btn.active { filter: drop-shadow(0 0 4px #f39c12); }
.action-buttons { display: flex; gap: 0.25rem; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.4rem; border-radius: 4px; }
.btn-icon:hover { background: #e1e8ed; }
.btn-icon.danger:hover { background: #fadbd8; }
.empty-state { text-align: center; padding: 3rem; color: #95a5a6; font-style: italic; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 200; }
.modal { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin: 0 0 1.5rem; color: #2c3e50; }
.form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; flex-direction: column; gap: 0.4rem; }
.form-row label { font-weight: 500; color: #2c3e50; font-size: 0.9rem; }
.form-row input, .form-row select, .form-row textarea { padding: 0.75rem; border: 1px solid #dfe6e9; border-radius: 6px; font-size: 1rem; font-family: inherit; }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.2); }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.btn { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
.btn-primary { background: #3498db; color: white; }
.btn-primary:hover { background: #2980b9; }
.btn-secondary { background: #ecf0f1; color: #2c3e50; }
.btn-secondary:hover { background: #bdc3c7; }

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-box { min-width: 0; }
}
</style>