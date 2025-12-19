<template>
  <div class="px-5 pt-8 pb-32">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-dark-900 tracking-tight">
          {{ greeting }}
        </h1>
        <p class="text-gray-500 font-medium mt-1 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary-500"></span>
          {{ familyStore.currentFamily?.name || 'Bienvenue sur FoodSync' }}
        </p>
      </div>
      <NuxtLink to="/profile" class="relative p-0.5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-glow group">
        <div class="p-2.5 bg-white rounded-full group-active:scale-95 transition-transform">
           <span class="text-xl">👤</span>
        </div>
      </NuxtLink>
    </header>

    <!-- No Family Warning -->
    <div v-if="!familyStore.hasFamily" class="card mb-8 bg-primary-50/50 border-primary-100">
      <div class="flex items-center gap-4">
        <span class="text-4xl">👨‍👩‍👧‍👦</span>
        <div class="flex-1">
          <p class="font-bold text-dark-900 text-lg">Rejoignez une famille</p>
          <p class="text-sm text-gray-600 mt-1">Configurez votre espace familial pour commencer.</p>
        </div>
      </div>
      <NuxtLink to="/family" class="mt-4 w-full btn-primary block text-center shadow-none">
        Configurer ma famille
      </NuxtLink>
    </div>

    <!-- Quick Stats Grid -->
    <div v-if="familyStore.hasFamily" class="grid grid-cols-2 gap-4 mb-8">
      <NuxtLink to="/fridge" class="card card-hover group !p-4 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl group-hover:bg-primary-100 transition-colors"></div>
        <div class="relative">
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">🥬</span>
          </div>
          <div>
            <p class="text-3xl font-bold text-dark-900">{{ fridgeStore.itemCount }}</p>
            <p class="text-sm font-medium text-gray-500">Articles au frais</p>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/expiring" class="card card-hover group !p-4 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-secondary-50 rounded-full blur-2xl group-hover:bg-secondary-100 transition-colors"></div>
        <div class="relative">
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">⚠️</span>
          </div>
          <div>
            <p class="text-3xl font-bold text-dark-900">{{ fridgeStore.expiringCount }}</p>
            <p class="text-sm font-medium text-gray-500">Attention requise</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Expiring Soon Section -->
    <section v-if="familyStore.hasFamily && fridgeStore.expiringItems.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-dark-900 flex items-center gap-2">
          <span>⏰</span> Expire bientôt
        </h2>
        <NuxtLink to="/expiring" class="text-primary-600 text-sm font-bold hover:text-primary-700 transition-colors">Voir tout</NuxtLink>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="item in fridgeStore.expiringItems.slice(0, 3)" 
          :key="item.id"
          class="card flex items-center gap-4 !p-3 hover:bg-gray-50 transition-colors"
        >
          <div class="w-14 h-14 bg-surface-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            {{ item.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-dark-900 truncate">{{ item.name }}</h3>
            <p class="text-sm font-medium mt-0.5 flex items-center gap-1.5" :class="getExpirationClass(item.daysUntilExpiration)">
              <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
              {{ getExpirationText(item.daysUntilExpiration) }}
            </p>
          </div>
          <span 
            v-if="item.daysUntilExpiration !== null && item.daysUntilExpiration <= 2"
            class="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg"
          >
            J-{{ item.daysUntilExpiration === 0 ? '0' : item.daysUntilExpiration }}
          </span>
        </div>
      </div>
    </section>

    <!-- Recipe Suggestions -->
    <section v-if="familyStore.hasFamily" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-dark-900 flex items-center gap-2">
          <span>🍳</span> Idées recettes
        </h2>
        <NuxtLink to="/recipes" class="text-primary-600 text-sm font-bold hover:text-primary-700 transition-colors">Voir tout</NuxtLink>
      </div>
      
      <div v-if="recipesStore.suggestions.length > 0" class="space-y-4">
        <NuxtLink 
          v-for="recipe in recipesStore.suggestions.slice(0, 2)" 
          :key="recipe.id"
          to="/recipes"
          class="card group !p-0 overflow-hidden"
        >
          <div class="flex items-stretch">
            <div class="w-24 bg-surface-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
              {{ recipe.emoji }}
            </div>
            <div class="flex-1 p-4">
              <h3 class="font-bold text-dark-900 mb-1 group-hover:text-primary-600 transition-colors">{{ recipe.name }}</h3>
              <p class="text-sm text-gray-500 mb-2">{{ recipe.matchCount }} ingrédient(s) dispo.</p>
              
              <div class="flex items-center gap-3">
                <span class="px-2 py-1 rounded-lg bg-surface-100 text-xs font-medium text-gray-600">
                  ⏱ {{ recipe.time }} min
                </span>
                <span class="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                  {{ recipe.matchPercentage }}% match
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <div v-else class="card text-center py-8 bg-surface-50 border-dashed border-2 border-gray-200 shadow-none">
        <p class="text-gray-500 text-sm font-medium">Remplissez votre frigo pour voir des idées !</p>
        <NuxtLink to="/fridge" class="text-primary-600 text-sm font-bold mt-2 inline-block hover:underline">
          Gérer mon frigo →
        </NuxtLink>
      </div>
    </section>

    <!-- Nutrition Coach Banner -->
    <section v-if="familyStore.hasFamily" class="mb-8">
      <NuxtLink to="/nutrition" class="card !p-0 overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white group">
        <div class="flex items-center p-4">
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">🥗 Coach Nutrition</h3>
            <p class="text-green-100 text-sm">Repas personnalisés selon vos objectifs</p>
          </div>
          <div class="text-4xl group-hover:scale-110 transition-transform">→</div>
        </div>
      </NuxtLink>
    </section>

    <!-- Quick Actions -->
    <section v-if="familyStore.hasFamily">
      <h2 class="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
        <span>⚡️</span> Actions rapides
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <NuxtLink to="/fridge" class="btn bg-white border border-gray-100 shadow-sm hover:border-primary-200 text-dark-900 flex-col py-6 h-auto gap-3 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">🍽️</span>
          <span class="font-bold">Ajouter au frigo</span>
        </NuxtLink>
        <NuxtLink to="/shopping" class="btn bg-white border border-gray-100 shadow-sm hover:border-primary-200 text-dark-900 flex-col py-6 h-auto gap-3 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">🛒</span>
          <span class="font-bold">Liste de courses</span>
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
