import { computed, ref } from 'vue'

const STORAGE_KEY = 'campus-map-data'

const defaultBuildings = [
  { id: 1, name: 'Administration Building', code: 'ADM', description: 'Main administrative offices', location: 'North Campus', floors: 4, facilities: ['Offices', 'Conference Rooms', 'Reception'], isFavorite: false },
  { id: 2, name: 'Science Hall', code: 'SCI', description: 'Laboratories and science classrooms', location: 'Central Campus', floors: 5, facilities: ['Labs', 'Lecture Halls', 'Research Centers'], isFavorite: false },
  { id: 3, name: 'Library', code: 'LIB', description: 'Main campus library and study spaces', location: 'Central Campus', floors: 3, facilities: ['Reading Rooms', 'Computer Lab', 'Archives'], isFavorite: false },
  { id: 4, name: 'Student Center', code: 'STU', description: 'Student services and recreational facilities', location: 'South Campus', floors: 2, facilities: ['Cafeteria', 'Game Room', 'Counseling'], isFavorite: false },
  { id: 5, name: 'Engineering Complex', code: 'ENG', description: 'Engineering labs and workshops', location: 'North Campus', floors: 4, facilities: ['Workshops', 'CAD Labs', 'Testing Facilities'], isFavorite: false },
  { id: 6, name: 'Arts Center', code: 'ART', description: 'Visual and performing arts facilities', location: 'West Campus', floors: 3, facilities: ['Studios', 'Theater', 'Gallery'], isFavorite: false },
  { id: 7, name: 'Sports Complex', code: 'SPT', description: 'Athletic facilities and gymnasium', location: 'East Campus', floors: 2, facilities: ['Gym', 'Pool', 'Track', 'Courts'], isFavorite: false },
  { id: 8, name: 'Dormitory A', code: 'DMA', description: 'Student housing and common spaces', location: 'South Campus', floors: 6, facilities: ['Rooms', 'Common Area', 'Laundry'], isFavorite: false }
]

const defaultLocations = [
  { id: 1, buildingId: 1, name: "Dean's Office", floor: 4, room: '401', description: 'Office of the Dean', type: 'office' },
  { id: 2, buildingId: 1, name: 'Registrar', floor: 1, room: '101', description: 'Student records and registration', type: 'service' },
  { id: 3, buildingId: 2, name: 'Chemistry Lab 1', floor: 2, room: '201', description: 'General chemistry laboratory', type: 'lab' },
  { id: 4, buildingId: 2, name: 'Physics Lecture Hall', floor: 3, room: '301', description: 'Large lecture hall for physics', type: 'lecture' },
  { id: 5, buildingId: 3, name: 'Main Reading Room', floor: 2, room: '200', description: 'Quiet study area', type: 'study' },
  { id: 6, buildingId: 3, name: 'Computer Lab', floor: 1, room: '105', description: 'Public computers and printing', type: 'computer' },
  { id: 7, buildingId: 4, name: 'Main Cafeteria', floor: 1, room: '100', description: 'Dining hall', type: 'food' },
  { id: 8, buildingId: 5, name: 'Mechanical Workshop', floor: 1, room: '110', description: 'Machining and fabrication', type: 'workshop' }
]

function defaultData() {
  return {
    buildings: defaultBuildings.map(building => ({ ...building, facilities: [...building.facilities] })),
    locations: defaultLocations.map(location => ({ ...location })),
    nextBuildingId: 9,
    nextLocationId: 9
  }
}

function isValidData(data) {
  if (!data || !Array.isArray(data.buildings) || !Array.isArray(data.locations)) return false
  const buildingIds = new Set()
  const locationIds = new Set()
  for (const building of data.buildings) {
    if (!Number.isInteger(building.id) || buildingIds.has(building.id) ||
      typeof building.name !== 'string' || typeof building.code !== 'string' ||
      typeof building.location !== 'string' || !Number.isInteger(building.floors) ||
      building.floors < 1 || !Array.isArray(building.facilities) ||
      !building.facilities.every(facility => typeof facility === 'string')) return false
    buildingIds.add(building.id)
  }
  for (const location of data.locations) {
    if (!Number.isInteger(location.id) || locationIds.has(location.id) ||
      !Number.isInteger(location.buildingId) || !buildingIds.has(location.buildingId) ||
      typeof location.name !== 'string') return false
    locationIds.add(location.id)
  }
  return true
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultData()
    const data = JSON.parse(stored)
    if (!isValidData(data)) throw new Error('The saved campus data has an invalid format.')
    return data
  } catch (error) {
    console.warn('Failed to load campus data; using the sample campus instead:', error)
    return defaultData()
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageData()))
  } catch (error) {
    console.error('Failed to save campus data to localStorage:', error)
    throw new Error('Your changes could not be saved. Check browser storage and try again.')
  }
}

const stored = loadFromStorage()
export const buildings = ref(stored.buildings)
export const locations = ref(stored.locations)
let nextBuildingId = Math.max(stored.nextBuildingId || 1, ...buildings.value.map(building => building.id + 1))
let nextLocationId = Math.max(stored.nextLocationId || 1, ...locations.value.map(location => location.id + 1))

export const favorites = computed(() => buildings.value.filter(building => building.isFavorite))

export function addBuilding(building) {
  const newBuilding = { ...building, id: nextBuildingId++, isFavorite: false }
  buildings.value.push(newBuilding)
  saveToStorage()
  return newBuilding
}

export function updateBuilding(id, updates) {
  const index = buildings.value.findIndex(building => building.id === id)
  if (index === -1) return null
  buildings.value[index] = { ...buildings.value[index], ...updates, id }
  saveToStorage()
  return buildings.value[index]
}

export function deleteBuilding(id) {
  const index = buildings.value.findIndex(building => building.id === id)
  if (index === -1) return false
  buildings.value.splice(index, 1)
  locations.value = locations.value.filter(location => location.buildingId !== id)
  saveToStorage()
  return true
}

export function toggleFavorite(id) {
  const building = buildings.value.find(item => item.id === id)
  if (!building) return null
  building.isFavorite = !building.isFavorite
  saveToStorage()
  return building
}

export function addLocation(location) {
  const newLocation = { ...location, id: nextLocationId++ }
  locations.value.push(newLocation)
  saveToStorage()
  return newLocation
}

export function updateLocation(id, updates) {
  const index = locations.value.findIndex(location => location.id === id)
  if (index === -1) return null
  locations.value[index] = { ...locations.value[index], ...updates, id }
  saveToStorage()
  return locations.value[index]
}

export function deleteLocation(id) {
  const index = locations.value.findIndex(location => location.id === id)
  if (index === -1) return false
  locations.value.splice(index, 1)
  saveToStorage()
  return true
}

export function getLocationsByBuilding(buildingId) {
  return locations.value.filter(location => location.buildingId === buildingId)
}

export function getBuildingById(id) {
  return buildings.value.find(building => building.id === id)
}

export function getStorageData() {
  return {
    buildings: buildings.value,
    locations: locations.value,
    nextBuildingId,
    nextLocationId
  }
}

export function importStorageData(data) {
  if (!isValidData(data)) {
    throw new Error('This file is not a valid Campus Guide backup.')
  }
  buildings.value = data.buildings
  locations.value = data.locations
  nextBuildingId = Math.max(data.nextBuildingId || 1, ...buildings.value.map(building => building.id + 1))
  nextLocationId = Math.max(data.nextLocationId || 1, ...locations.value.map(location => location.id + 1))
  saveToStorage()
}

export function resetStorageData() {
  const data = defaultData()
  buildings.value = data.buildings
  locations.value = data.locations
  nextBuildingId = data.nextBuildingId
  nextLocationId = data.nextLocationId
  saveToStorage()
}

export function clearStorageData() {
  buildings.value = []
  locations.value = []
  nextBuildingId = 1
  nextLocationId = 1
  saveToStorage()
}
