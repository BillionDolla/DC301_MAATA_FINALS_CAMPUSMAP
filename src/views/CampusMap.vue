<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { buildings, locations, addBuilding, addLocation, toggleFavorite } from '../stores/campusStore'

const router = useRouter()
const showBuildingForm = ref(false)
const showLocationForm = ref(false)
const editingBuilding = ref(null)
const editingLocation = ref(null)

const buildingForm = ref({
  name: '',
  code: '',
  description: '',
  location: '',
  floors: 1,
  facilities: ''
})

const locationForm = ref({
  buildingId: '',
  name: '',
  floor: 1,
  room: '',
  description: '',
  type: 'office'
})

const locationTypes = ['office', 'lab', 'lecture', 'study', 'computer', 'food', 'workshop', 'service', 'other']

onMounted(() => {
  resetForms()
})

function resetForms() {
  buildingForm.value = { name: '', code: '', description: '', location: '', floors: 1, facilities: '' }
  locationForm.value = { buildingId: '', name: '', floor: 1, room: '', description: '', type: 'office' }
  editingBuilding.value = null
  editingLocation.value = null
  showBuildingForm.value = false
  showLocationForm.value = false
}

function startEditBuilding(building) {
  editingBuilding.value = building
  buildingForm.value = { ...building, facilities: building.facilities.join(', ') }
  showBuildingForm.value = true
}

function startEditLocation(location) {
  editingLocation.value = location
  locationForm.value = { ...location }
  showLocationForm.value = true
}

function submitBuilding() {
  const data = {
    ...buildingForm.value,
    facilities: buildingForm.value.facilities.split(',').map(f => f.trim()).filter(f => f),
    floors: parseInt(buildingForm.value.floors)
  }
  
  if (editingBuilding.value) {
    addBuilding({ ...data, id: editingBuilding.value.id })
  } else {
    addBuilding(data)
  }
  resetForms()
}

function submitLocation() {
  const data = {
    ...locationForm.value,
    buildingId: parseInt(locationForm.value.buildingId),
    floor: parseInt(locationForm.value.floor)
  }
  
  if (editingLocation.value) {
    addLocation({ ...data, id: editingLocation.value.id })
  } else {
    addLocation(data)
  }
  resetForms()
}

function deleteBuildingConfirm(id) {
  if (confirm('Delete this building and all its locations?')) {
    import('../stores/campusStore').then(({ deleteBuilding }) => deleteBuilding(id))
  }
}

function deleteLocationConfirm(id) {
  if (confirm('Delete this location?')) {
    import('../stores/campusStore').then(({ deleteLocation }) => deleteLocation(id))
  }
}

function getLocationsForBuilding(buildingId) {
  return locations.value.filter(l => l.buildingId === buildingId)
}
</script>

<template>
  <div class="page-container">
    <NavBar />
    
    <main class="main-content">
      <header class="page-header">
        <h1>🗺️ Campus Map & Locations</h1>
        <p>Manage campus buildings and their locations</p>
      </header>

      <section class="card">
        <div class="card-header">
          <h2>Buildings</h2>
          <button @click="showBuildingForm = true; editingBuilding = null; resetForms()" class="btn btn-primary">
            + Add Building
          </button>
        </div>
        
        <div class="buildings-grid">
          <div v-for="building in buildings" :key="building.id" class="building-card">
            <div class="building-header">
              <h3>{{ building.name }}</h3>
              <span class="building-code">{{ building.code }}</span>
            </div>
            <p class="building-desc">{{ building.description }}</p>
            <div class="building-meta">
              <span>📍 {{ building.location }}</span>
              <span>🏢 {{ building.floors }} floors</span>
            </div>
            <div class="building-facilities">
              <span v-for="f in building.facilities" :key="f" class="facility-tag">{{ f }}</span>
            </div>
            
            <div class="locations-list">
              <h4>Locations:</h4>
              <div v-for="loc in getLocationsForBuilding(building.id)" :key="loc.id" class="location-item">
                <span class="loc-type">{{ loc.type }}</span>
                <span class="loc-name">{{ loc.name }}</span>
                <span class="loc-room">Room {{ loc.room }} (Floor {{ loc.floor }})</span>
                <div class="loc-actions">
                  <button @click="startEditLocation(loc)" class="btn-icon" title="Edit">✏️</button>
                  <button @click="deleteLocationConfirm(loc.id)" class="btn-icon danger" title="Delete">🗑️</button>
                </div>
              </div>
              <button @click="locationForm.buildingId = building.id; showLocationForm = true; editingLocation = null; resetForms()" class="btn btn-sm btn-add-loc">
                + Add Location
              </button>
            </div>

            <div class="building-actions">
              <button @click="startEditBuilding(building)" class="btn btn-sm">✏️ Edit</button>
              <button @click="toggleFavorite(building.id)" class="btn btn-sm" :class="{ 'fav-active': building.isFavorite }">
                {{ building.isFavorite ? '⭐' : '☆' }} Favorite
              </button>
              <button @click="deleteBuildingConfirm(building.id)" class="btn btn-sm danger">🗑️ Delete</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Building Form Modal -->
      <div v-if="showBuildingForm" class="modal-overlay" @click.self="resetForms">
        <div class="modal" @click.stop>
          <h2>{{ editingBuilding ? 'Edit Building' : 'Add Building' }}</h2>
          <form @submit.prevent="submitBuilding" class="form">
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
              <input v-model="buildingForm.location" required />
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
              <button type="button" @click="resetForms" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingBuilding ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Location Form Modal -->
      <div v-if="showLocationForm" class="modal-overlay" @click.self="resetForms">
        <div class="modal" @click.stop>
          <h2>{{ editingLocation ? 'Edit Location' : 'Add Location' }}</h2>
          <form @submit.prevent="submitLocation" class="form">
            <div class="form-row">
              <label>Building *</label>
              <select v-model="locationForm.buildingId" required>
                <option value="">Select building</option>
                <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }} ({{ b.code }})</option>
              </select>
            </div>
            <div class="form-row">
              <label>Name *</label>
              <input v-model="locationForm.name" required />
            </div>
            <div class="form-row">
              <label>Type *</label>
              <select v-model="locationForm.type" required>
                <option v-for="t in locationTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>Floor *</label>
              <input type="number" v-model.number="locationForm.floor" min="1" required />
            </div>
            <div class="form-row">
              <label>Room *</label>
              <input v-model="locationForm.room" required />
            </div>
            <div class="form-row">
              <label>Description</label>
              <textarea v-model="locationForm.description" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="resetForms" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingLocation ? 'Update' : 'Create' }}</button>
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
.main-content { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 0.5rem; color: #2c3e50; }
.page-header p { color: #7f8c8d; margin: 0; }

.card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.card-header h2 { margin: 0; color: #2c3e50; }

.buildings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
.building-card { border: 1px solid #e1e8ed; border-radius: 8px; padding: 1.5rem; background: #fafbfc; transition: transform 0.2s, box-shadow 0.2s; }
.building-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.building-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.building-header h3 { margin: 0; color: #2c3e50; }
.building-code { background: #3498db; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.building-desc { color: #7f8c8d; margin: 0.5rem 0; font-size: 0.9rem; }
.building-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #95a5a6; margin-bottom: 0.75rem; }
.building-facilities { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
.facility-tag { background: #e8f4fd; color: #2980b9; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; }

.locations-list { border-top: 1px solid #e1e8ed; padding-top: 1rem; margin-bottom: 1rem; }
.locations-list h4 { margin: 0 0 0.75rem; font-size: 0.9rem; color: #2c3e50; }
.location-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.85rem; }
.loc-type { background: #3498db; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; }
.loc-name { flex: 1; font-weight: 500; }
.loc-room { color: #7f8c8d; font-size: 0.8rem; }
.loc-actions { display: flex; gap: 0.25rem; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem; border-radius: 4px; }
.btn-icon:hover { background: #e1e8ed; }
.btn-icon.danger:hover { background: #fadbd8; }

.building-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; font-size: 0.9rem; }
.btn-primary { background: #3498db; color: white; }
.btn-primary:hover { background: #2980b9; }
.btn-secondary { background: #ecf0f1; color: #2c3e50; }
.btn-secondary:hover { background: #bdc3c7; }
.btn-danger { background: #e74c3c; color: white; }
.btn-danger:hover { background: #c0392b; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
.btn-add-loc { width: 100%; background: #e8f8f5; color: #27ae60; }
.btn-add-loc:hover { background: #d5f5e3; }
.fav-active { background: #fef9e7; color: #f39c12; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 200; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.2s; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal h2 { margin: 0 0 1.5rem; color: #2c3e50; }
.form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; flex-direction: column; gap: 0.4rem; }
.form-row label { font-weight: 500; color: #2c3e50; font-size: 0.9rem; }
.form-row input, .form-row select, .form-row textarea { padding: 0.75rem; border: 1px solid #dfe6e9; border-radius: 6px; font-size: 1rem; font-family: inherit; }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.2); }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .buildings-grid { grid-template-columns: 1fr; }
  .building-header { flex-direction: column; gap: 0.5rem; }
}
</style>