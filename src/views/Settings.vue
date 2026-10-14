<script setup>
import { computed, onMounted, ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import {
  buildings, clearStorageData, getStorageData, importStorageData, locations, resetStorageData
} from '../stores/campusStore'

const SETTINGS_KEY = 'campus-guide-settings'
const settings = ref({ theme: 'light', compactView: false })
const notice = ref('')
const error = ref('')
const favoritesCount = computed(() => buildings.value.filter(building => building.isFavorite).length)
const storageSize = computed(() => `${(new Blob([JSON.stringify(getStorageData())]).size / 1024).toFixed(1)} KB`)

onMounted(() => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) settings.value = { ...settings.value, ...JSON.parse(saved) }
  } catch (loadError) {
    error.value = `Saved preferences could not be loaded: ${loadError.message}`
  }
  applyTheme()
})

function applyTheme() {
  document.documentElement.setAttribute('data-theme', settings.value.theme)
  document.documentElement.setAttribute('data-compact', String(settings.value.compactView))
}

function saveSettings() {
  error.value = ''
  notice.value = ''
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    applyTheme()
    notice.value = 'Your preferences have been saved.'
  } catch (saveError) {
    error.value = `Preferences could not be saved: ${saveError.message}`
  }
}

function exportData() {
  error.value = ''
  try {
    const blob = new Blob([JSON.stringify(getStorageData(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campus-guide-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    notice.value = 'Your campus backup has been downloaded.'
  } catch (exportError) {
    error.value = `Backup could not be exported: ${exportError.message}`
  }
}

async function importData(event) {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  notice.value = ''
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Backup files must be 5 MB or smaller.')
    const data = JSON.parse(await file.text())
    if (!confirm('Importing this backup will replace your current buildings and locations. Continue?')) return
    importStorageData(data)
    notice.value = 'Your campus backup has been restored.'
  } catch (importError) {
    error.value = `Backup could not be imported: ${importError.message}`
  } finally {
    input.value = ''
  }
}

function restoreDefaults() {
  if (!confirm('Restore the sample campus? Your current buildings and locations will be replaced.')) return
  try {
    resetStorageData()
    notice.value = 'The sample campus has been restored.'
    error.value = ''
  } catch (resetError) {
    error.value = `Sample campus could not be restored: ${resetError.message}`
  }
}

function clearData() {
  if (!confirm('Delete all buildings and locations? This cannot be undone unless you have a backup.')) return
  try {
    clearStorageData()
    notice.value = 'All buildings and locations have been removed.'
    error.value = ''
  } catch (clearError) {
    error.value = `Campus data could not be cleared: ${clearError.message}`
  }
}
</script>

<template>
  <div class="site-shell">
    <NavBar />
    <main class="main-content">
      <header class="page-heading">
        <div><p class="eyebrow">Make it your own</p><h1>Settings & data</h1><p>Manage the look of your guide and keep your campus data backed up.</p></div>
      </header>
      <div class="settings-stack">
        <section class="panel panel-pad">
          <div class="panel-heading"><div><h2>Appearance</h2><p>Choose how Campus Guide looks on this device.</p></div></div>
          <div class="settings-grid">
            <div class="setting-row">
              <div><strong>Color theme</strong><p>Switch between light and dark display.</p></div>
              <select v-model="settings.theme" class="field setting-control" aria-label="Color theme" @change="saveSettings">
                <option value="light">Light</option><option value="dark">Dark</option>
              </select>
            </div>
            <div class="setting-row">
              <div><strong>Compact layout</strong><p>Save your preference for a denser guide view.</p></div>
              <input v-model="settings.compactView" type="checkbox" aria-label="Compact layout" @change="saveSettings" />
            </div>
          </div>
        </section>

        <section class="panel panel-pad">
          <div class="panel-heading"><div><h2>Campus at a glance</h2><p>Live totals from your current campus directory.</p></div></div>
          <div class="settings-stats">
            <div class="settings-stat"><span>Buildings</span><strong>{{ buildings.length }}</strong></div>
            <div class="settings-stat"><span>Places</span><strong>{{ locations.length }}</strong></div>
            <div class="settings-stat"><span>Favorites</span><strong>{{ favoritesCount }}</strong></div>
            <div class="settings-stat"><span>Data size</span><strong>{{ storageSize }}</strong></div>
          </div>
        </section>

        <section class="panel panel-pad">
          <div class="panel-heading"><div><h2>Backup & restore</h2><p>Your data is stored in this browser. Export a backup before moving devices or clearing data.</p></div></div>
          <div class="data-actions">
            <button class="btn" @click="exportData">↓ Export backup (.json)</button>
            <label class="btn btn-secondary">↑ Import backup<input type="file" accept=".json,application/json" hidden @change="importData" /></label>
          </div>
          <p v-if="notice" class="status-note" role="status">{{ notice }}</p>
          <p v-if="error" class="inline-alert" role="alert" style="margin-top:12px">{{ error }}</p>
        </section>

        <section class="panel panel-pad danger-panel">
          <div class="panel-heading"><div><h2>Reset campus data</h2><p>These actions change the campus directory saved in this browser.</p></div></div>
          <div class="data-actions">
            <button class="btn btn-secondary" @click="restoreDefaults">Restore sample campus</button>
            <button class="btn btn-danger" @click="clearData">Delete all campus data</button>
          </div>
        </section>

        <section class="welcome-note">
          <strong>About this project</strong>
          Campus Map & Location Guide is a Vue 3 single-page application. Vue Router enables page navigation; reactive shared state powers building and location CRUD; localStorage preserves changes between visits. Your data stays in this browser and is not uploaded to a server.
        </section>
      </div>
    </main>
  </div>
</template>
