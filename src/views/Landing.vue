<script setup>
import { computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import { buildings, favorites, locations } from '../stores/campusStore'

const stats = computed(() => [
  { value: buildings.value.length, label: 'Campus buildings' },
  { value: locations.value.length, label: 'Points of interest' },
  { value: favorites.value.length, label: 'Saved favorites' }
])

const pages = [
  { icon: '⌖', title: 'Campus map', detail: 'Explore the illustrated campus and view building details and room locations.', path: '/map' },
  { icon: '▤', title: 'Building directory', detail: 'Search, filter, sort, and manage every campus building in one place.', path: '/directory' },
  { icon: '☆', title: 'Favorites', detail: 'Keep frequently visited places close and jump back to their campus details.', path: '/favorites' },
  { icon: '⚙', title: 'Settings & data', detail: 'Choose a theme, review campus statistics, and back up or restore your data.', path: '/settings' }
]

const crud = [
  { letter: 'C', title: 'Create', detail: 'Add buildings and the rooms or services inside them.' },
  { letter: 'R', title: 'Read', detail: 'Browse a visual map, a searchable directory, and saved places.' },
  { letter: 'U', title: 'Update', detail: 'Edit a building or location and save the changes instantly.' },
  { letter: 'D', title: 'Delete', detail: 'Remove records with confirmation; deleting a building also removes its rooms.' }
]
</script>

<template>
  <div class="site-shell">
    <NavBar />
    <main class="landing">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="eyebrow">Your campus, at a glance</p>
          <h1>Find your place on campus.</h1>
          <p class="subheading">A practical guide to campus buildings, rooms, and student services. Search the directory, save useful places, and keep campus information up to date.</p>
          <div class="hero-actions">
            <router-link to="/map" class="btn">Explore the campus <span aria-hidden="true">→</span></router-link>
            <router-link to="/directory" class="btn btn-secondary">Browse directory</router-link>
          </div>
        </div>
        <div class="hero-art" aria-label="Illustration of a campus map">
          <div class="hero-orbit"></div>
          <div class="hero-campus-card">
            <strong>Campus overview <span style="float:right;color:var(--green)">● LIVE GUIDE</span></strong>
            <div class="mini-map">
              <div class="mini-path one"></div><div class="mini-path two"></div>
              <div class="mini-building"></div><div class="mini-building"></div>
              <div class="mini-building"></div><div class="mini-building"></div>
              <div class="hero-pin"><span>⌖</span></div>
            </div>
          </div>
        </div>
      </section>

      <section class="stat-strip" aria-label="Campus statistics">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-number">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </section>

      <section class="section-block">
        <p class="eyebrow">Navigate your way</p>
        <h2 class="section-title">Everything you need, in one guide</h2>
        <div class="feature-grid">
          <router-link v-for="page in pages" :key="page.path" :to="page.path" class="feature-card">
            <span class="feature-icon" aria-hidden="true">{{ page.icon }}</span>
            <h3>{{ page.title }}</h3>
            <p>{{ page.detail }}</p>
            <span class="feature-arrow" aria-hidden="true">↗</span>
          </router-link>
        </div>
      </section>

      <section class="section-block">
        <p class="eyebrow">Built as a Vue single-page application</p>
        <h2 class="section-title">From requirements to a working CRUD app</h2>
        <div class="welcome-note">
          <strong>Project requirements</strong>
          Create an easy-to-use, responsive campus location guide with a landing page, four navigable feature pages, searchable campus information, and complete create, read, update, and delete workflows. Vue 3 powers the reactive interface, Vue Router handles page navigation, and browser storage keeps your campus data between visits.
        </div>
        <div class="feature-grid" style="margin-top:14px">
          <article v-for="item in crud" :key="item.letter" class="feature-card">
            <span class="feature-icon" aria-hidden="true">{{ item.letter }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
          </article>
        </div>
      </section>
      <footer class="footer">Campus Map & Location Guide · Vue 3 · Vue Router · Persistent local data</footer>
    </main>
  </div>
</template>
