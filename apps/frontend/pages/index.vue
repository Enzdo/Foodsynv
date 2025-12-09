<template>
  <div class="px-4 pt-4 pb-24">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ greeting }}</h1>
        <p class="text-gray-500">{{ familyStore.currentFamily?.name || 'Bienvenue sur FoodSync' }}</p>
      </div>
      <NuxtLink to="/family" class="relative p-2 bg-gray-100 rounded-xl">
        👨‍👩‍👧‍👦
      </NuxtLink>
    </header>

    <!-- No Family Warning -->
    <div v-if="!familyStore.hasFamily" class="card mb-4 bg-primary-50 border-primary-200">
      <div class="flex items-center gap-3">
        <span class="text-3xl">👨‍👩‍👧‍👦</span>
        <div class="flex-1">
          <p class="font-medium text-primary-900">Commencez par créer une famille</p>
          <p class="text-sm text-primary-700">Ou rejoignez-en une existante</p>
        </div>
      </div>
      <NuxtLink to="/family" class="mt-3 w-full btn-primary block text-center">
        Configurer ma famille
      </NuxtLink>
    </div>

    <!-- Quick Stats -->
    <div v-if="familyStore.hasFamily" class="grid grid-cols-2 gap-3 mb-6">
      <NuxtLink to="/fridge" class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ fridgeStore.itemCount }}</p>
            <p class="text-xs text-gray-500">Articles</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/expiring" class="card">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ fridgeStore.expiringCount }}</p>
            <p class="text-xs text-gray-500">Expirent bientôt</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Expiring Soon Section -->
    <section v-if="familyStore.hasFamily && fridgeStore.expiringItems.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-900">⚠️ Expire bientôt</h2>
        <NuxtLink to="/expiring" class="text-primary-600 text-sm font-medium">Voir tout</NuxtLink>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="item in fridgeStore.expiringItems.slice(0, 3)" 
          :key="item.id"
          class="card flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
            {{ item.emoji }}
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
            <p class="text-sm" :class="getExpirationClass(item.daysUntilExpiration)">
              {{ getExpirationText(item.daysUntilExpiration) }}
            </p>
          </div>
          <span 
            v-if="item.daysUntilExpiration !== null && item.daysUntilExpiration <= 2"
            class="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
          >
            Urgent
          </span>
        </div>
      </div>
    </section>

    <!-- Recipe Suggestions -->
    <section v-if="familyStore.hasFamily">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-900">🍳 Recettes suggérées</h2>
        <NuxtLink to="/recipes" class="text-primary-600 text-sm font-medium">Voir tout</NuxtLink>
      </div>
      
      <div v-if="recipesStore.suggestions.length > 0" class="space-y-3">
        <NuxtLink 
          v-for="recipe in recipesStore.suggestions.slice(0, 2)" 
          :key="recipe.id"
          to="/recipes"
          class="card flex items-center gap-4"
        >
          <div class="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-2xl">
            {{ recipe.emoji }}
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-gray-900">{{ recipe.name }}</h3>
            <p class="text-sm text-gray-500">{{ recipe.matchCount }} ingrédient(s) disponible(s)</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400">⏱ {{ recipe.time }} min</span>
              <span class="text-xs text-gray-400">•</span>
              <span class="text-xs text-primary-600 font-medium">{{ recipe.matchPercentage }}% match</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <div v-else class="card text-center py-6">
        <p class="text-gray-500 text-sm">Ajoutez des articles au frigo pour obtenir des suggestions</p>
        <NuxtLink to="/fridge" class="text-primary-600 text-sm font-medium mt-2 inline-block">
          Gérer mon frigo →
        </NuxtLink>
      </div>
    </section>

    <!-- Quick Actions -->
    <section v-if="familyStore.hasFamily" class="mt-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>
      <div class="grid grid-cols-2 gap-3">
        <NuxtLink to="/fridge" class="card text-center py-4">
          <span class="text-2xl">🍽️</span>
          <p class="text-sm font-medium text-gray-900 mt-2">Ajouter au frigo</p>
        </NuxtLink>
        <NuxtLink to="/shopping" class="card text-center py-4">
          <span class="text-2xl">🛒</span>
          <p class="text-sm font-medium text-gray-900 mt-2">Liste de courses</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useFridgeStore } from '~/stores/fridge'
import { useRecipesStore } from '~/stores/recipes'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const fridgeStore = useFridgeStore()
const recipesStore = useRecipesStore()
const router = useRouter()

const greeting = computed(() => {
  const hour = new Date().getHours()
  let timeGreeting = 'Bonjour'
  if (hour >= 18) timeGreeting = 'Bonsoir'
  else if (hour >= 12) timeGreeting = 'Bon après-midi'
  
  if (authStore.user) {
    return `${timeGreeting} ${authStore.user.firstName} ! 👋`
  }
  return `${timeGreeting} ! 👋`
})

function getExpirationClass(days: number | null): string {
  if (days === null) return 'text-gray-500'
  if (days <= 2) return 'text-red-600'
  if (days <= 5) return 'text-orange-600'
  return 'text-yellow-600'
}

function getExpirationText(days: number | null): string {
  if (days === null) return 'Pas de date'
  if (days < 0) return 'Expiré'
  if (days === 0) return "Expire aujourd'hui"
  if (days === 1) return 'Expire demain'
  return `Expire dans ${days} jours`
}

onMounted(async () => {
  authStore.init()
  
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await familyStore.fetchFamilies()
  familyStore.loadCurrentFamily()
  
  if (familyStore.currentFamilyId) {
    await Promise.all([
      fridgeStore.fetchItems(),
      fridgeStore.fetchExpiringItems(7),
      recipesStore.fetchSuggestions(),
    ])
  }
})

// Watch for family changes
watch(() => familyStore.currentFamilyId, async (newId) => {
  if (newId) {
    await Promise.all([
      fridgeStore.fetchItems(),
      fridgeStore.fetchExpiringItems(7),
      recipesStore.fetchSuggestions(),
    ])
  }
})
</script>
