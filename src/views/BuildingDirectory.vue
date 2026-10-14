<script setup>
import { computed, ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import {
  addBuilding, buildings, deleteBuilding, getLocationsByBuilding, toggleFavorite, updateBuilding
} from '../stores/campusStore'

const searchQuery = ref('')
const filterArea = ref('')
const sortBy = ref('name')
const showForm = ref(false)
const editingId = ref(null)
const formError = ref('')
const form = ref(emptyForm())

function emptyForm() {
  return { name: '', code: '', description: '', location: '', floors: 1, facilities: '' }
}

const areas = computed(() => [...new Set(buildings.value.map(building => building.location))].sort())
const filteredBuildings = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const result = buildings.value.filter(building => {
    const matchesQuery = !query || [building.name, building.code, building.description, building.location, ...building.facilities]
      .some(value => value.toLowerCase().includes(query))
    return matchesQuery && (!filterArea.value || building.location === filterArea.value)
  })
  return result.sort((a, b) => {
    if (sortBy.value === 'code') return a.code.localeCompare(b.code)
    if (sortBy.value === 'area') return a.location.localeCompare(b.location) || a.name.localeCompare(b.name)
    if (sortBy.value === 'floors') return b.floors - a.floors || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name)
  })
})

function openForm(building = null) {
  editingId.value = building?.id ?? null
  formError.value = ''
  form.value = building ? { ...building, facilities: building.facilities.join(', ') } : emptyForm()
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  formError.value = ''
}

function saveBuilding() {
  const data = {
    ...form.value,
    name: form.value.name.trim(),
    code: form.value.code.trim().toUpperCase(),
    location: form.value.location.trim(),
    floors: Number(form.value.floors),
    facilities: form.value.facilities.split(',').map(value => value.trim()).filter(Boolean)
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
    closeForm()
  } catch (error) {
    formError.value = error.message
  }
}

function removeBuilding(building) {
  if (confirm(`Delete ${building.name} and all of its locations?`)) {
    try {
      deleteBuilding(building.id)
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
          <p class="eyebrow">Know before you go</p>
          <h1>Building directory</h1>
          <p>Find buildings by name, campus area, or facility. Add and maintain campus details as they change.</p>
        </div>
        <button class="btn" @click="openForm()">＋ Add building</button>
      </header>

      <section class="panel panel-pad">
        <div class="panel-heading">
          <div><h2>All buildings <span class="code-pill">{{ filteredBuildings.length }}</span></h2><p>{{ buildings.length }} total campus buildings</p></div>
          <router-link to="/map" class="btn btn-secondary btn-sm">View campus map ↗</router-link>
        </div>
        <div class="toolbar">
          <label class="search-field search-wrap">
            <span class="search-glyph" aria-hidden="true">⌕</span>
            <input v-model="searchQuery" type="search" aria-label="Search buildings" placeholder="Search name, code, facility…" />
          </label>
          <select v-model="filterArea" aria-label="Filter by campus area"><option value="">All areas</option><option v-for="area in areas" :key="area" :value="area">{{ area }}</option></select>
          <select v-model="sortBy" aria-label="Sort buildings">
            <option value="name">Sort: name</option><option value="code">Sort: code</option>
            <option value="area">Sort: area</option><option value="floors">Sort: floors</option>
          </select>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Building</th><th>Code</th><th>Campus area</th><th>Floors</th><th>Places</th><th>Facilities</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="building in filteredBuildings" :key="building.id">
                <td><span class="table-primary">{{ building.name }}</span><span class="table-secondary">{{ building.description || 'No description provided' }}</span></td>
                <td><span class="code-pill">{{ building.code }}</span></td>
                <td>{{ building.location }}</td>
                <td>{{ building.floors }}</td>
                <td>{{ getLocationsByBuilding(building.id).length }}</td>
                <td><div class="facility-tags"><span v-for="facility in building.facilities.slice(0, 3)" :key="facility" class="facility-tag">{{ facility }}</span><span v-if="building.facilities.length > 3" class="table-secondary">+{{ building.facilities.length - 3 }}</span></div></td>
                <td><div class="action-row">
                  <button class="icon-button" :class="{ 'is-favorite': building.isFavorite }" :aria-label="building.isFavorite ? 'Remove from favorites' : 'Add to favorites'" :title="building.isFavorite ? 'Remove from favorites' : 'Add to favorites'" @click="toggleFavorite(building.id)">{{ building.isFavorite ? '★' : '☆' }}</button>
                  <button class="icon-button" :aria-label="`Edit ${building.name}`" title="Edit" @click="openForm(building)">✎</button>
                  <button class="icon-button" :aria-label="`Delete ${building.name}`" title="Delete" @click="removeBuilding(building)">×</button>
                  <router-link class="icon-button" :to="{ path: '/map', query: { building: building.id } }" :aria-label="`View ${building.name} on map`" title="View on map">↗</router-link>
                </div></td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredBuildings.length" class="empty-state">
            <strong>{{ buildings.length ? 'No matching buildings' : 'No buildings yet' }}</strong>
            <p>{{ buildings.length ? 'Try another search or clear the campus area filter.' : 'Add your first building to start your campus directory.' }}</p>
            <button v-if="!buildings.length" class="btn" @click="openForm()">Add a building</button>
            <button v-else class="btn btn-secondary btn-sm" @click="searchQuery = ''; filterArea = ''">Clear filters</button>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div v-if="showForm" class="modal-backdrop" @click.self="closeForm" @keydown.esc="closeForm">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="directory-modal-title">
      <h2 id="directory-modal-title">{{ editingId ? 'Edit building' : 'Add a building' }}</h2>
      <p class="modal-intro">Provide a few details to help people find their way.</p>
      <p v-if="formError" class="inline-alert" role="alert">{{ formError }}</p>
      <form @submit.prevent="saveBuilding">
        <div class="form-grid">
          <div class="form-row"><label for="directory-name">Building name *</label><input id="directory-name" v-model="form.name" class="field" required maxlength="80" /></div>
          <div class="form-row"><label for="directory-code">Short code *</label><input id="directory-code" v-model="form.code" class="field" required maxlength="8" /></div>
          <div class="form-row full"><label for="directory-description">Description</label><textarea id="directory-description" v-model="form.description" class="field" maxlength="240"></textarea></div>
          <div class="form-row"><label for="directory-area">Campus area *</label><input id="directory-area" v-model="form.location" class="field" required maxlength="60" placeholder="e.g. North Campus" /></div>
          <div class="form-row"><label for="directory-floors">Number of floors *</label><input id="directory-floors" v-model.number="form.floors" class="field" type="number" min="1" max="40" required /></div>
          <div class="form-row full"><label for="directory-facilities">Facilities (comma separated)</label><input id="directory-facilities" v-model="form.facilities" class="field" placeholder="Labs, lecture halls, offices" /></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" @click="closeForm">Cancel</button><button class="btn">{{ editingId ? 'Save changes' : 'Add building' }}</button></div>
      </form>
    </section>
  </div>
</template>
