import { ref, computed } from 'vue'

const STORAGE_KEY = 'campus-map-data'

const defaultBuildings = [
  { id: 1, name: 'Administration Building', code: 'ADM', description: 'Main administrative offices', location: 'North Campus', floors: 4, facilities: ['Offices', 'Conference Rooms', 'Reception'], isFavorite: false },
  { id: 2, name: 'Science Hall', code: 'SCI', description: 'Laboratories and science classrooms', location: 'Central Campus', floors: 5, facilities: ['Labs', 'Lecture Halls', 'Research Centers'], isFavorite: false },
  { id: 3, name: 'Library', code: 'LIB', description: 'Main campus library and study spaces', location: 'Central Campus', floors: 3, facilities: ['Reading Rooms', 'Computer Lab', 'Archives'], isFavorite: false },
  { id: 4, name: 'Student Center', code: 'STU', description: 'Student services and recreational facilities', location: 'South Campus', floors: 2, facilities: ['Cafeteria', 'Game Room', 'Counseling'], isFavorite: false },
  { id: 5, name: 'Engineering Complex', code: 'ENG', description: 'Engineering labs and workshops', location: 'North Campus', floors: 4, facilities: ['Workshops', 'CAD Labs', 'Testing Facilities'], isFavorite: false },
  { id: 6, name: 'Arts Center', code: 'ART', description: 'Visual and performing arts facilities', location: 'West Campus', floors: 3, facilities: ['Studios', 'Theater', 'Gallery'], isFavorite: false },
  { id: 7, name: 'Sports Complex', code: 'SPT', description: 'Athletic facilities and gymnasium', location: 'East Campus', floors: 2, facilities: ['Gym', 'Pool', 'Track', 'Courts'], isFavorite: false },
  { id: 8, name: 'Dormitory A', code: 'DMA', description: 'Freshman housing', location: 'South Campus', floors: 6, facilities: ['Rooms', 'Common Area', 'Laundry'], isFavorite: false }
]

const defaultLocations = [
  { id: 1, buildingId: 1, name: 'Dean\'s Office', floor: 4, room: '401', description: 'Office of the Dean', type: 'office' },
  { id: 2, buildingId: 1, name: 'Registrar', floor: 1, room: '101', description: 'Student records and registration', type: 'service' },
  { id: 3, buildingId: 2, name: 'Chemistry Lab 1', floor: 2, room: '201', description: 'General chemistry laboratory', type: 'lab' },
  { id: 4, buildingId: 2, name: 'Physics Lecture Hall', floor: 3, room: '301', description: 'Large lecture hall for physics', type: 'lecture' },
  { id: 5, buildingId: 3, name: 'Main Reading Room', floor: 2, room: '200', description: 'Quiet study area', type: 'study' },
  { id: 6, buildingId: 3, name: 'Computer Lab', floor: 1, room: '105', description: 'Public computers and printing', type: 'computer' },
  { id: 7, buildingId: 4, name: 'Main Cafeteria', floor: 1, room: '100', description: 'Dining hall', type: 'food' },
  { id: 8, buildingId: 5, name: 'Mechanical Workshop', floor: 1, room: '110', description: 'Machining and fabrication', type: 'workshop' }
]

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
  return { buildings: defaultBuildings, locations: defaultLocations, nextBuildingId: 9, nextLocationId: 9 }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

const stored = loadFromStorage()

export const buildings = ref(stored.buildings)
export const locations = ref(stored.locations)
let nextBuildingId = stored.nextBuildingId
let nextLocationId = stored.nextLocationId

export const favorites = computed(() => buildings.value.filter(b => b.isFavorite))

export function addBuilding(building) {
  const newBuilding = { ...building, id: nextBuildingId++, isFavorite: false }
  buildings.value.push(newBuilding)
  saveToStorage(getStorageData())
  return newBuilding
}

export function updateBuilding(id, updates) {
  const idx = buildings.value.findIndex(b => b.id === id)
  if (idx !== -1) {
    buildings.value[idx] = { ...buildings.value[idx], ...updates }
    saveToStorage(getStorageData())
    return buildings.value[idx]
  }
  return null
}

export function deleteBuilding(id) {
  const idx = buildings.value.findIndex(b => b.id === id)
  if (idx !== -1) {
    buildings.value.splice(idx, 1)
    locations.value = locations.value.filter(l => l.buildingId !== id)
    saveToStorage(getStorageData())
    return true
  }
  return false
}

export function toggleFavorite(id) {
  const building = buildings.value.find(b => b.id === id)
  if (building) {
    building.isFavorite = !building.isFavorite
    saveToStorage(getStorageData())
    return building
  }
  return null
}

export function addLocation(location) {
  const newLocation = { ...location, id: nextLocationId++ }
  locations.value.push(newLocation)
  saveToStorage(getStorageData())
  return newLocation
}

export function updateLocation(id, updates) {
  const idx = locations.value.findIndex(l => l.id === id)
  if (idx !== -1) {
    locations.value[idx] = { ...locations.value[idx], ...updates }
    saveToStorage(getStorageData())
    return locations.value[idx]
  }
  return null
}

export function deleteLocation(id) {
  const idx = locations.value.findIndex(l => l.id === id)
  if (idx !== -1) {
    locations.value.splice(idx, 1)
    saveToStorage(getStorageData())
    return true
  }
  return false
}

export function getLocationsByBuilding(buildingId) {
  return locations.value.filter(l => l.buildingId === buildingId)
}

export function getBuildingById(id) {
  return buildings.value.find(b => b.id === id)
}

export function getStorageData() {
  return {
    buildings: buildings.value,
    locations: locations.value,
    nextBuildingId,
    nextLocationId
  }
}