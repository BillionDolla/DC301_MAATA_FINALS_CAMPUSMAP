<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import {
  addBuilding, addLocation, buildings, deleteBuilding, deleteLocation,
  getLocationsByBuilding, toggleFavorite, updateBuilding, updateLocation
} from '../stores/campusStore'

const route = useRoute()
const selectedId = ref(null)
const modalType = ref('')
const editingId = ref(null)
const formError = ref('')
const buildingForm = ref(emptyBuilding())
const locationForm = ref(emptyLocation())
const positionGrid = [
  [22, 24], [73, 22], [43, 25], [79, 70],
  [23, 68], [54, 79], [81, 43], [43, 57]
]

function emptyBuilding() {
  return { name: '', code: '', description: '', location: '', floors: 1, facilities: '' }
}

function emptyLocation(buildingId = '') {
  return { buildingId, name: '', floor: 1, room: '', description: '', type: 'office' }
}

const selectedBuilding = computed(() => buildings.value.find(building => building.id === selectedId.value) || buildings.value[0] || null)
const selectedLocations = computed(() => selectedBuilding.value ? getLocationsByBuilding(selectedBuilding.value.id) : [])
const mapBuildings = computed(() => buildings.value)

function pinPosition(index) {
  if (positionGrid[index]) {
    return { left: `${positionGrid[index][0]}%`, top: `${positionGrid[index][1]}%` }
  }
  const extraIndex = index - positionGrid.length
  const angle = extraIndex * 2.4
  const radius = Math.min(15 + Math.floor(extraIndex / 12) * 4, 34)
  const left = Math.max(12, Math.min(88, 50 + Math.cos(angle) * radius))
  const top = Math.max(14, Math.min(86, 50 + Math.sin(angle) * radius))
  return { left: `${left}%`, top: `${top}%` }
}

watch(() => route.query.building, value => {
  const id = Number(value)
  if (Number.isInteger(id) && buildings.value.some(building => building.id === id)) selectedId.value = id
}, { immediate: true })

function openBuilding(building) {
  editingId.value = building?.id ?? null
  formError.value = ''
  buildingForm.value = building
    ? { ...building, facilities: building.facilities.join(', ') }
    : emptyBuilding()
  modalType.value = 'building'
}

function openLocation(buildingId, location = null) {
  editingId.value = location?.id ?? null
  formError.value = ''
  locationForm.value = location ? { ...location } : emptyLocation(buildingId)
  modalType.value = 'location'
}

function closeModal() {
  modalType.value = ''
  editingId.value = null
  formError.value = ''
}

function saveBuilding() {
  const data = {
    ...buildingForm.value,
    name: buildingForm.value.name.trim(),
    code: buildingForm.value.code.trim().toUpperCase(),
    location: buildingForm.value.location.trim(),
    floors: Number(buildingForm.value.floors),
    facilities: buildingForm.value.facilities.split(',').map(value => value.trim()).filter(Boolean)
  }
  const duplicateCode = buildings.value.some(building =>
    building.code.toLowerCase() === data.code.toLowerCase() && building.id !== editingId.value
  )
  if (!data.name || !data.code || !data.location || !Number.isInteger(data.floors) || data.floors < 1) {
    formError.value = 'Enter a name, code, campus area, and a valid floor count.'
    return
  }
  if (duplicateCode) {
    formError.value = 'That short code is already in use. Choose a unique code.'
    return
  }
  try {
    const saved = editingId.value ? updateBuilding(editingId.value, data) : addBuilding(data)
    if (!saved) throw new Error('The building could not be found.')
    selectedId.value = saved.id
    closeModal()
  } catch (error) {
    formError.value = error.message
  }
}

function saveLocation() {
  const data = {
    ...locationForm.value,
    buildingId: Number(locationForm.value.buildingId),
    floor: Number(locationForm.value.floor),
    name: locationForm.value.name.trim(),
    room: locationForm.value.room.trim()
  }
  const parent = buildings.value.find(building => building.id === data.buildingId)
  if (!parent || !data.name || !data.room || !Number.isInteger(data.floor) || data.floor < 1 || data.floor > parent.floors) {
    formError.value = 'Choose a building and enter a name, room, and floor within that building.'
    return
  }
  try {
    const saved = editingId.value ? updateLocation(editingId.value, data) : addLocation(data)
    if (!saved) throw new Error('The location could not be found.')
    selectedId.value = data.buildingId
    closeModal()
  } catch (error) {
    formError.value = error.message
  }
}

function removeBuilding(building) {
  if (confirm(`Delete ${building.name} and all of its locations?`)) {
    try {
      deleteBuilding(building.id)
      if (selectedId.value === building.id) selectedId.value = buildings.value[0]?.id ?? null
    } catch (error) {
      window.alert(error.message)
    }
  }
}

function removeLocation(location) {
  if (confirm(`Delete ${location.name}?`)) {
    try {
      deleteLocation(location.id)
    } catch (error) {
      window.alert(error.message)
    }
  }
}
</script>

<template>
  <div class="site-shell">
    <NavBar />
    <main class="main-content">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Plan your next stop</p>
          <h1>Campus map</h1>
          <p>Explore campus buildings and manage the rooms, services, and places inside them.</p>
        </div>
        <button class="btn" @click="openBuilding()">＋ Add building</button>
      </header>

      <section class="map-layout">
        <div class="panel panel-pad">
          <div class="panel-heading">
            <div><h2>Campus overview</h2><p>Select a map pin to see building details.</p></div>
            <span class="code-pill">{{ buildings.length }} buildings</span>
          </div>
          <div class="map-canvas" role="group" aria-label="Illustrated campus map">
            <div class="map-road horizontal"></div><div class="map-road vertical"></div>
            <div class="map-lawn">Campus green</div><div class="map-water"></div>
            <span class="map-label north">North campus</span><span class="map-label south">South campus</span>
            <button
              v-for="(building, index) in mapBuildings"
              :key="building.id"
              class="map-pin"
              :class="{ selected: selectedBuilding?.id === building.id }"
              :style="pinPosition(index)"
              :aria-label="`Show ${building.name}`"
              @click="selectedId = building.id"
            >
              <span class="map-pin-dot">{{ building.code.slice(0, 1) }}</span>
              <span class="map-pin-name">{{ building.name }}</span>
            </button>
          </div>
        </div>

        <aside class="panel map-side">
          <template v-if="selectedBuilding">
            <div class="panel-heading">
              <div><p class="eyebrow">Building details</p><h2>{{ selectedBuilding.name }}</h2></div>
              <button class="icon-button" :class="{ 'is-favorite': selectedBuilding.isFavorite }" :aria-label="selectedBuilding.isFavorite ? 'Remove from favorites' : 'Add to favorites'" @click="toggleFavorite(selectedBuilding.id)">
                {{ selectedBuilding.isFavorite ? '★' : '☆' }}
              </button>
            </div>
            <p>{{ selectedBuilding.description }}</p>
            <div class="card-meta"><span class="code-pill">{{ selectedBuilding.code }}</span><span>{{ selectedBuilding.location }}</span><span>{{ selectedBuilding.floors }} floors</span></div>
            <div class="map-detail">
              <div class="panel-heading"><h2>Places inside</h2><button class="btn btn-sm" @click="openLocation(selectedBuilding.id)">＋ Add place</button></div>
              <div v-if="selectedLocations.length">
                <div v-for="location in selectedLocations.slice(0, 5)" :key="location.id" class="map-location">
                  <div><strong>{{ location.name }}</strong><br><span class="type-pill">{{ location.type }}</span></div>
                  <span>Room {{ location.room }} · Floor {{ location.floor }}</span>
                </div>
              </div>
              <p v-else>No places listed for this building yet.</p>
            </div>
            <div class="map-actions">
              <button class="btn btn-secondary btn-sm" @click="openBuilding(selectedBuilding)">Edit building</button>
              <button class="btn btn-secondary btn-sm" @click="removeBuilding(selectedBuilding)">Delete</button>
              <router-link to="/directory" class="btn btn-quiet btn-sm">Full directory ↗</router-link>
            </div>
          </template>
          <div v-else class="empty-state"><strong>Your map is ready</strong><p>Add your first building to start mapping campus.</p><button class="btn" @click="openBuilding()">Add building</button></div>
        </aside>
      </section>

      <section class="section-block">
        <div class="panel-heading"><div><p class="eyebrow">Manage your places</p><h2 class="section-title">Campus buildings</h2></div></div>
        <div v-if="buildings.length" class="building-card-grid">
          <article v-for="building in buildings" :key="building.id" class="building-card">
            <div class="building-card-top">
              <div><h3>{{ building.name }}</h3><p>{{ building.description }}</p></div>
              <button class="icon-button" :class="{ 'is-favorite': building.isFavorite }" :aria-label="building.isFavorite ? 'Remove from favorites' : 'Add to favorites'" @click="toggleFavorite(building.id)">{{ building.isFavorite ? '★' : '☆' }}</button>
            </div>
            <div class="card-meta"><span class="code-pill">{{ building.code }}</span><span>{{ building.location }}</span><span>{{ building.floors }} floors</span></div>
            <div class="location-list">
              <div class="panel-heading"><span class="location-list-title">Places ({{ getLocationsByBuilding(building.id).length }})</span><button class="btn btn-quiet btn-sm" @click="openLocation(building.id)">＋ Add</button></div>
              <div v-for="location in getLocationsByBuilding(building.id)" :key="location.id" class="map-location">
                <div><strong>{{ location.name }}</strong><br><span>{{ location.type }} · Room {{ location.room }} · Floor {{ location.floor }}</span></div>
                <div class="location-actions">
                  <button :aria-label="`Edit ${location.name}`" @click="openLocation(building.id, location)">✎</button>
                  <button :aria-label="`Delete ${location.name}`" @click="removeLocation(location)">×</button>
                </div>
              </div>
              <p v-if="!getLocationsByBuilding(building.id).length" class="table-secondary">No places added yet.</p>
            </div>
            <div class="map-actions">
              <button class="btn btn-secondary btn-sm" @click="openBuilding(building)">Edit</button>
              <button class="btn btn-quiet btn-sm" @click="removeBuilding(building)">Delete building</button>
            </div>
          </article>
        </div>
        <div v-else class="panel empty-state"><strong>No buildings yet</strong><p>Add a campus building to get started.</p><button class="btn" @click="openBuilding()">Add your first building</button></div>
      </section>
    </main>
  </div>

  <div v-if="modalType" class="modal-backdrop" @click.self="closeModal" @keydown.esc="closeModal">
    <section class="modal" role="dialog" aria-modal="true" :aria-labelledby="modalType === 'building' ? 'building-modal-title' : 'location-modal-title'">
      <template v-if="modalType === 'building'">
        <h2 id="building-modal-title">{{ editingId ? 'Edit building' : 'Add a building' }}</h2>
        <p class="modal-intro">Add useful campus details so people can find their way.</p>
        <p v-if="formError" class="inline-alert" role="alert">{{ formError }}</p>
        <form @submit.prevent="saveBuilding">
          <div class="form-grid">
            <div class="form-row"><label for="building-name">Building name *</label><input id="building-name" v-model="buildingForm.name" class="field" required maxlength="80" /></div>
            <div class="form-row"><label for="building-code">Short code *</label><input id="building-code" v-model="buildingForm.code" class="field" required maxlength="8" /></div>
            <div class="form-row full"><label for="building-description">Description</label><textarea id="building-description" v-model="buildingForm.description" class="field" maxlength="240"></textarea></div>
            <div class="form-row"><label for="building-area">Campus area *</label><input id="building-area" v-model="buildingForm.location" class="field" required maxlength="60" placeholder="e.g. North Campus" /></div>
            <div class="form-row"><label for="building-floors">Number of floors *</label><input id="building-floors" v-model.number="buildingForm.floors" class="field" type="number" min="1" max="40" required /></div>
            <div class="form-row full"><label for="building-facilities">Facilities (comma separated)</label><input id="building-facilities" v-model="buildingForm.facilities" class="field" placeholder="Library, study rooms, Wi-Fi" /></div>
          </div>
          <div class="form-actions"><button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button><button class="btn">{{ editingId ? 'Save changes' : 'Add building' }}</button></div>
        </form>
      </template>
      <template v-else>
        <h2 id="location-modal-title">{{ editingId ? 'Edit place' : 'Add a place' }}</h2>
        <p class="modal-intro">Add a room, student service, or point of interest.</p>
        <p v-if="formError" class="inline-alert" role="alert">{{ formError }}</p>
        <form @submit.prevent="saveLocation">
          <div class="form-grid">
            <div class="form-row full"><label for="place-building">Building *</label><select id="place-building" v-model.number="locationForm.buildingId" class="field" required><option disabled value="">Choose a building</option><option v-for="building in buildings" :key="building.id" :value="building.id">{{ building.name }} ({{ building.code }})</option></select></div>
            <div class="form-row"><label for="place-name">Place name *</label><input id="place-name" v-model="locationForm.name" class="field" required maxlength="80" /></div>
            <div class="form-row"><label for="place-type">Type</label><select id="place-type" v-model="locationForm.type" class="field"><option v-for="type in ['office', 'lab', 'lecture', 'study', 'computer', 'food', 'workshop', 'service', 'other']" :key="type" :value="type">{{ type }}</option></select></div>
            <div class="form-row"><label for="place-floor">Floor *</label><input id="place-floor" v-model.number="locationForm.floor" class="field" type="number" min="1" :max="buildings.find(building => building.id === Number(locationForm.buildingId))?.floors || 40" required /></div>
            <div class="form-row"><label for="place-room">Room *</label><input id="place-room" v-model="locationForm.room" class="field" required maxlength="20" /></div>
            <div class="form-row full"><label for="place-description">Description</label><textarea id="place-description" v-model="locationForm.description" class="field" maxlength="240"></textarea></div>
          </div>
          <div class="form-actions"><button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button><button class="btn">{{ editingId ? 'Save changes' : 'Add place' }}</button></div>
        </form>
      </template>
    </section>
  </div>
</template>
