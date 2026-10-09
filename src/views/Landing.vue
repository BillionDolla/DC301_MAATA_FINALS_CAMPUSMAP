<script setup>
import { ref } from 'vue'
import { buildings, locations } from '../stores/campusStore'

const stats = ref({
  buildings: 0,
  locations: 0,
  favorites: 0
})

const features = [
  {
    icon: '🗺️',
    title: 'Campus Map',
    desc: 'Interactive map with all buildings and their locations. Add, edit, and delete buildings with full CRUD operations.',
    link: '/map'
  },
  {
    icon: '🏢',
    title: 'Building Directory',
    desc: 'Searchable and filterable directory of all campus buildings. Sort by name, code, location, or floors.',
    link: '/directory'
  },
  {
    icon: '⭐',
    title: 'Favorites',
    desc: 'Bookmark your most-used buildings for quick access. See key locations at a glance.',
    link: '/favorites'
  },
  {
    icon: '⚙️',
    title: 'Settings & Data',
    desc: 'Customize themes, view statistics, export/import data, and manage your campus guide.',
    link: '/settings'
  }
]

function updateStats() {
  stats.value.buildings = buildings.value.length
  stats.value.locations = locations.value.length
  stats.value.favorites = buildings.value.filter(b => b.isFavorite).length
}

updateStats()
</script>

<template>
  <div class="landing-page">
    <NavBar />
    
    <main>
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>🗺️ Campus Map & Location Guide</h1>
          <p class="hero-tagline">Your comprehensive campus navigation companion</p>
          <p class="hero-desc">Manage buildings, locations, and favorites with full CRUD functionality. Built with Vue 3, Vue Router, and localStorage persistence.</p>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">{{ stats.buildings }}</span>
              <span class="stat-label">Buildings</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ stats.locations }}</span>
              <span class="stat-label">Locations</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ stats.favorites }}</span>
              <span class="stat-label">Favorites</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/map" class="btn btn-primary btn-lg">Explore Campus Map</router-link>
            <router-link to="/directory" class="btn btn-secondary btn-lg">View Directory</router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="campus-illustration">
            <div class="building" style="--i:0"><span>🏢</span></div>
            <div class="building" style="--i:1"><span>🏫</span></div>
            <div class="building" style="--i:2"><span>📚</span></div>
            <div class="building" style="--i:3"><span>🏛️</span></div>
            <div class="building" style="--i:4"><span>🏟️</span></div>
            <div class="building" style="--i:5"><span>🎭</span></div>
            <div class="building" style="--i:6"><span>🏭</span></div>
            <div class="building" style="--i:7"><span>🏠</span></div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="section-header">
          <h2>Features</h2>
          <p>Everything you need to navigate campus efficiently</p>
        </div>
        <div class="features-grid">
          <router-link v-for="feature in features" :key="feature.link" :to="feature.link" class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
            <span class="feature-arrow">→</span>
          </router-link>
        </div>
      </section>

      <!-- Quick Start Section -->
      <section class="quickstart-section">
        <div class="section-header">
          <h2>Quick Start</h2>
          <p>Get up and running in seconds</p>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Browse Buildings</h3>
              <p>Visit the Campus Map or Building Directory to see all campus buildings with their locations, facilities, and details.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Add Locations</h3>
              <p>Click "Add Location" on any building to create rooms, labs, offices, and other points of interest with full details.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Mark Favorites</h3>
              <p>Star your most-visited buildings to access them quickly from the Favorites page.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Manage Data</h3>
              <p>Use Settings to export your data as JSON backup, import from other devices, or customize the app theme.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CRUD Demo Section -->
      <section class="crud-section">
        <div class="section-header">
          <h2>CRUD Operations</h2>
          <p>Full Create, Read, Update, Delete functionality</p>
        </div>
        <div class="crud-grid">
          <div class="crud-card">
            <div class="crud-icon">➕</div>
            <h3>Create</h3>
            <p>Add new buildings with name, code, description, location, floors, and facilities. Add locations with type, floor, room, and description.</p>
          </div>
          <div class="crud-card">
            <div class="crud-icon">👁️</div>
            <h3>Read</h3>
            <p>View all buildings in a responsive grid or searchable table. See locations grouped by building with type badges and room numbers.</p>
          </div>
          <div class="crud-card">
            <div class="crud-icon">✏️</div>
            <h3>Update</h3>
            <p>Edit any building or location with pre-filled forms. Changes save instantly to localStorage for persistence across sessions.</p>
          </div>
          <div class="crud-card">
            <div class="crud-icon">🗑️</div>
            <h3>Delete</h3>
            <p>Remove buildings (with confirmation) which also deletes associated locations. Remove individual locations from buildings.</p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <h2>Ready to explore?</h2>
        <p>Start managing your campus locations today</p>
        <router-link to="/map" class="btn btn-primary btn-lg">Get Started</router-link>
      </section>
    </main>

    <footer class="footer">
      <p>Campus Map & Location Guide • Built with Vue 3 + Vite</p>
      <p>Data persisted in localStorage • No backend required</p>
    </footer>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
export default { components: { NavBar } }
</script>

<style scoped>
.landing-page { min-height: 100vh; background: #f5f6fa; }
main { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

/* Hero */
.hero { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; padding: 4rem 0; }
.hero-content h1 { font-size: 2.5rem; margin: 0 0 0.5rem; color: #2c3e50; line-height: 1.2; }
.hero-tagline { font-size: 1.25rem; color: #3498db; margin: 0 0 1rem; font-weight: 500; }
.hero-desc { color: #7f8c8d; margin: 0 0 2rem; font-size: 1.05rem; line-height: 1.6; }
.hero-stats { display: flex; gap: 2rem; margin-bottom: 2rem; }
.stat { text-align: center; }
.stat-number { display: block; font-size: 2.5rem; font-weight: bold; color: #2c3e50; line-height: 1; }
.stat-label { font-size: 0.9rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; font-size: 1rem; }
.btn-lg { padding: 1rem 2rem; font-size: 1.1rem; }
.btn-primary { background: #3498db; color: white; }
.btn-primary:hover { background: #2980b9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(52,152,219,0.3); }
.btn-secondary { background: white; color: #3498db; border: 2px solid #3498db; }
.btn-secondary:hover { background: #e8f4fd; }

.hero-visual { display: flex; justify-content: center; align-items: center; }
.campus-illustration { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 400px; }
.building { background: white; border-radius: 12px; padding: 1.5rem; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s; animation: float 3s ease-in-out infinite; animation-delay: calc(var(--i) * 0.2s); }
.building:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
.building span { font-size: 2.5rem; display: block; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* Features */
.features-section { padding: 4rem 0; }
.section-header { text-align: center; margin-bottom: 3rem; }
.section-header h2 { font-size: 2rem; margin: 0 0 0.5rem; color: #2c3e50; }
.section-header p { color: #7f8c8d; margin: 0; font-size: 1.1rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.feature-card { background: white; border-radius: 12px; padding: 2rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; display: flex; flex-direction: column; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
.feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.feature-card h3 { margin: 0 0 0.75rem; color: #2c3e50; font-size: 1.25rem; }
.feature-card p { margin: 0 0 1rem; color: #7f8c8d; line-height: 1.6; flex: 1; }
.feature-arrow { align-self: flex-end; color: #3498db; font-weight: bold; font-size: 1.25rem; transition: transform 0.2s; }
.feature-card:hover .feature-arrow { transform: translateX(4px); }

/* Quick Start */
.quickstart-section { padding: 4rem 0; background: white; margin: 0 -2rem; padding-left: 2rem; padding-right: 2rem; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
.step { display: flex; gap: 1rem; }
.step-number { width: 40px; height: 40px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.25rem; flex-shrink: 0; margin-top: 0.25rem; }
.step-content h3 { margin: 0 0 0.5rem; color: #2c3e50; font-size: 1.1rem; }
.step-content p { margin: 0; color: #7f8c8d; font-size: 0.95rem; line-height: 1.6; }

/* CRUD Section */
.crud-section { padding: 4rem 0; }
.crud-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.crud-card { background: white; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
.crud-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
.crud-icon { font-size: 3rem; margin-bottom: 1rem; }
.crud-card h3 { margin: 0 0 0.75rem; color: #2c3e50; }
.crud-card p { margin: 0; color: #7f8c8d; line-height: 1.6; }

/* CTA */
.cta-section { padding: 4rem 0; text-align: center; background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; margin: 0 -2rem; padding-left: 2rem; padding-right: 2rem; border-radius: 0; }
.cta-section h2 { margin: 0 0 0.5rem; font-size: 2rem; }
.cta-section p { margin: 0 0 2rem; opacity: 0.9; }
.cta-section .btn-primary { background: white; color: #2c3e50; }
.cta-section .btn-primary:hover { background: #ecf0f1; }

/* Footer */
.footer { text-align: center; padding: 2rem; color: #95a5a6; font-size: 0.9rem; border-top: 1px solid #e1e8ed; margin-top: 2rem; }
.footer p { margin: 0.25rem 0; }

@media (max-width: 768px) {
  main { padding: 0 1rem; }
  .hero { grid-template-columns: 1fr; text-align: center; padding: 2rem 0; }
  .hero-stats { justify-content: center; }
  .hero-actions { justify-content: center; }
  .campus-illustration { grid-template-columns: repeat(2, 1fr); max-width: 100%; }
  .quickstart-section { margin: 0 -1rem; padding-left: 1rem; padding-right: 1rem; }
  .cta-section { margin: 0 -1rem; padding-left: 1rem; padding-right: 1rem; }
}
</style>