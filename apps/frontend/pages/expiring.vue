<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Bientôt périmé</h1>
      <p class="text-gray-500">Articles à consommer rapidement</p>
    </header>

    <!-- No Family Warning -->
    <div v-if="!familyStore.hasFamily" class="card mb-4 bg-yellow-50 border-yellow-200">
      <p class="text-yellow-800 text-sm">
        ⚠️ Vous devez d'abord créer ou rejoindre une famille.
      </p>
      <NuxtLink to="/family" class="text-primary-600 text-sm font-medium mt-2 inline-block">
        Gérer mes familles →
      </NuxtLink>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button 
        v-for="filter in filters" 
        :key="filter.days"
        @click="selectedDays = filter.days"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="selectedDays === filter.days ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="fridgeStore.isLoading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement...</p>
    </div>

    <!-- Items List -->
    <div v-else class="space-y-3">
      <div 
        v-for="item in fridgeStore.expiringItems" 
        :key="item.id" 
        class="card flex items-center gap-4"
        :class="getCardClass(item.daysUntilExpiration)"
      >
        <div class="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center text-2xl">
          {{ item.emoji }}
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
          <p class="text-sm font-medium" :class="getTextClass(item.daysUntilExpiration)">
            {{ getExpirationText(item.daysUntilExpiration) }}
          </p>
        </div>
        <div class="flex gap-2">
          <button 
            @click="handleConsumeItem(item.id)"
            class="p-2 bg-white rounded-lg shadow-sm"
            title="Marquer comme consommé"
          >
            ✅
          </button>
          <button 
            @click="handleDeleteItem(item.id)"
            class="p-2 bg-white rounded-lg shadow-sm"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="fridgeStore.expiringItems.length === 0 && !fridgeStore.isLoading" class="text-center py-12">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun article périmé</h3>
        <p class="text-gray-500">Tous vos articles sont encore frais !</p>
      </div>
    </div>

    <!-- Summary Card -->
    <div v-if="fridgeStore.expiringItems.length > 0" class="card mt-6 bg-red-50 border-red-200">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <div>
          <p class="font-semibold text-red-800">{{ fridgeStore.expiringItems.length }} article(s) à surveiller</p>
          <p class="text-sm text-red-600">Pensez à les consommer rapidement</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useFridgeStore } from '~/stores/fridge'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const fridgeStore = useFridgeStore()
const router = useRouter()

const filters = [
  { days: 3, label: '3 jours' },
  { days: 7, label: '7 jours' },
  { days: 14, label: '14 jours' },
]

const selectedDays = ref(7)

function getCardClass(days: number | null): string {
  if (days === null) return ''
  if (days <= 0) return 'bg-red-100 border-red-300'
  if (days <= 2) return 'bg-red-50 border-red-200'
  if (days <= 5) return 'bg-orange-50 border-orange-200'
  return 'bg-yellow-50 border-yellow-200'
}

function getTextClass(days: number | null): string {
  if (days === null) return 'text-gray-500'
  if (days <= 0) return 'text-red-700'
  if (days <= 2) return 'text-red-600'
  if (days <= 5) return 'text-orange-600'
  return 'text-yellow-600'
}

function getExpirationText(days: number | null): string {
  if (days === null) return 'Pas de date'
  if (days < 0) return `Expiré depuis ${Math.abs(days)} jour(s)`
  if (days === 0) return "Expire aujourd'hui !"
  if (days === 1) return 'Expire demain'
  return `Expire dans ${days} jours`
}

async function handleConsumeItem(id: number) {
  await fridgeStore.consumeItem(id)
  await fridgeStore.fetchExpiringItems(selectedDays.value)
}

async function handleDeleteItem(id: number) {
  await fridgeStore.deleteItem(id)
  await fridgeStore.fetchExpiringItems(selectedDays.value)
}

async function loadData() {
  if (familyStore.currentFamilyId) {
    await fridgeStore.fetchExpiringItems(selectedDays.value)
  }
}

onMounted(async () => {
  authStore.init()
  
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await familyStore.fetchFamilies()
  familyStore.loadCurrentFamily()
  await loadData()
})

// Watch for filter changes
watch(selectedDays, async () => {
  await loadData()
})

// Watch for family changes
watch(() => familyStore.currentFamilyId, async (newId) => {
  if (newId) {
    await loadData()
  }
})
</script>
