<script setup>
import { ref, onMounted } from 'vue'
import { buildings, locations, getStorageData } from '../stores/campusStore'

const settings = ref({
  theme: 'light',
  autoSave: true,
  showBuildingCodes: true,
  compactView: false
})

const stats = ref({
  totalBuildings: 0,
  totalLocations: 0,
  favoriteCount: 0,
  storageUsed: '0 KB'
})

onMounted(() => {
  loadSettings()
  updateStats()
})

function loadSettings() {
  try {
    const stored = localStorage.getItem('campus-guide-settings')
    if (stored) {
      settings.value = { ...settings.value, ...JSON.parse(stored) }
    }
    applyTheme(settings.value.theme)
  } catch (e) {
    console.warn('Failed to load settings:', e)
  }
}

function saveSettings() {
  try {
    localStorage.setItem('campus-guide-settings', JSON.stringify(settings.value))
    applyTheme(settings.value.theme)
  } catch (e) {
    console.warn('Failed to save settings:', e)
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function updateStats() {
  stats.value.totalBuildings = buildings.value.length
  stats.value.totalLocations = locations.value.length
  stats.value.favoriteCount = buildings.value.filter(b => b.isFavorite).length
  
  try {
    const data = JSON.stringify(getStorageData())
    const bytes = new Blob([data]).size
    stats.value.storageUsed = formatBytes(bytes)
  } catch (e) {
    stats.value.storageUsed = 'Unknown'
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function exportData() {
  const data = getStorageData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `campus-guide-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.buildings && data.locations) {
        localStorage.setItem('campus-map-data', JSON.stringify(data))
        location.reload()
      } else {
        alert('Invalid backup file format')
      }
    } catch (err) {
      alert('Failed to import: ' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function resetToDefaults() {
  if (confirm('This will delete all your data and restore defaults. Are you sure?')) {
    localStorage.removeItem('campus-map-data')
    localStorage.removeItem('campus-guide-settings')
    location.reload()
  }
}

function clearAllData() {
  if (confirm('This will delete ALL buildings and locations. This cannot be undone!')) {
    if (confirm('Are you absolutely sure?')) {
      localStorage.removeItem('campus-map-data')
      location.reload()
    }
  }
}
</script>

<template>
  <div class="page-container">
    <NavBar />
    
    <main class="main-content">
      <header class="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your Campus Guide preferences and data</p>
      </header>

      <section class="card">
        <h2 class="section-title">🎨 Appearance</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Theme</h3>
              <p>Choose your preferred color theme</p>
            </div>
            <select v-model="settings.theme" @change="saveSettings" class="setting-control">
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
              <option value="auto">💻 System</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Compact View</h3>
              <p>Reduce spacing for more content on screen</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.compactView" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Show Building Codes</h3>
              <p>Display short codes (ADM, SCI, etc.) throughout the app</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.showBuildingCodes" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Auto-save Changes</h3>
              <p>Automatically save changes to localStorage</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.autoSave" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">📊 Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🏢</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalBuildings }}</span>
              <span class="stat-label">Total Buildings</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📍</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalLocations }}</span>
              <span class="stat-label">Total Locations</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⭐</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.favoriteCount }}</span>
              <span class="stat-label">Favorites</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">💾</span>
            <div class="stat-info">
              <span class="stat-value">{{ stats.storageUsed }}</span>
              <span class="stat-label">Storage Used</span>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">📁 Data Management</h2>
        <div class="data-actions">
          <div class="action-group">
            <h3>Export Data</h3>
            <p>Download a backup of all your buildings and locations</p>
            <button @click="exportData" class="btn btn-primary">📥 Export to JSON</button>
          </div>
          
          <div class="action-group">
            <h3>Import Data</h3>
            <p>Restore from a previously exported JSON file</p>
            <label class="file-input">
              <input type="file" accept=".json" @change="importData" hidden />
              <span class="btn btn-secondary">📤 Choose File</span>
            </label>
          </div>
        </div>
      </section>

      <section class="card danger-zone">
        <h2 class="section-title">⚠️ Danger Zone</h2>
        <div class="danger-actions">
          <div class="action-group">
            <h3>Reset to Defaults</h3>
            <p>Restore all buildings and settings to original state</p>
            <button @click="resetToDefaults" class="btn btn-warning">🔄 Reset to Defaults</button>
          </div>
          
          <div class="action-group">
            <h3>Clear All Data</h3>
            <p>Permanently delete all buildings and locations</p>
            <button @click="clearAllData" class="btn btn-danger">🗑️ Clear All Data</button>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">ℹ️ About</h2>
        <div class="about-info">
          <h3>Campus Map & Location Guide</h3>
          <p>Version 1.0.0</p>
          <p>A Vue.js SPA for managing campus buildings and locations with full CRUD functionality.</p>
          <div class="tech-stack">
            <h4>Built with:</h4>
            <ul>
              <li>Vue 3 (Composition API)</li>
              <li>Vue Router 4</li>
              <li>Vite</li>
              <li>localStorage for persistence</li>
            </ul>
          </div>
          <p class="features">
            <strong>Features:</strong> Building & Location CRUD, Favorites, Search & Filter, Data Export/Import, Dark/Light Theme
          </p>
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
.main-content { max-width: 900px; margin: 0 auto; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 0.5rem; color: #2c3e50; }
.page-header p { color: #7f8c8d; margin: 0; }

.card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1.5rem; margin-bottom: 1.5rem; }
.section-title { margin: 0 0 1.5rem; color: #2c3e50; font-size: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e1e8ed; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
.setting-info h3 { margin: 0 0 0.25rem; color: #2c3e50; font-size: 1rem; }
.setting-info p { margin: 0; color: #7f8c8d; font-size: 0.85rem; }
.setting-control { padding: 0.5rem 1rem; border: 1px solid #dfe6e9; border-radius: 6px; background: white; font-size: 0.9rem; }

.toggle { position: relative; width: 50px; height: 26px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #dfe6e9; border-radius: 26px; transition: 0.3s; }
.toggle-slider:before { position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.toggle input:checked + .toggle-slider { background: #3498db; }
.toggle input:checked + .toggle-slider:before { transform: translateX(24px); }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: #f8f9fa; border-radius: 8px; }
.stat-icon { font-size: 2rem; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.75rem; font-weight: bold; color: #2c3e50; }
.stat-label { font-size: 0.85rem; color: #7f8c8d; }

.data-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.action-group h3 { margin: 0 0 0.5rem; color: #2c3e50; }
.action-group p { margin: 0 0 1rem; color: #7f8c8d; font-size: 0.9rem; }
.file-input { display: inline-block; cursor: pointer; }

.danger-zone { border: 1px solid #fadbd8; background: #fdf2f2; }
.danger-zone .section-title { color: #c0392b; border-bottom-color: #fadbd8; }
.danger-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }

.btn { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
.btn-primary { background: #3498db; color: white; }
.btn-primary:hover { background: #2980b9; }
.btn-secondary { background: #ecf0f1; color: #2c3e50; }
.btn-secondary:hover { background: #bdc3c7; }
.btn-warning { background: #f39c12; color: white; }
.btn-warning:hover { background: #e67e22; }
.btn-danger { background: #e74c3c; color: white; }
.btn-danger:hover { background: #c0392b; }

.about-info h3 { margin: 0 0 0.5rem; color: #2c3e50; }
.about-info p { color: #7f8c8d; margin: 0.25rem 0; }
.tech-stack { margin: 1.5rem 0; }
.tech-stack h4 { margin: 0 0 0.5rem; color: #2c3e50; font-size: 0.95rem; }
.tech-stack ul { margin: 0; padding-left: 1.25rem; color: #7f8c8d; }
.tech-stack li { margin: 0.25rem 0; }
.features { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e1e8ed; color: #7f8c8d; font-size: 0.9rem; }

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .setting-item { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>