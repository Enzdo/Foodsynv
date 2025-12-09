<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Recettes</h1>
      <p class="text-gray-500">Suggestions basées sur votre frigo</p>
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

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button 
        @click="activeTab = 'family'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="activeTab === 'family' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        👨‍👩‍👧‍👦 Mes recettes
      </button>
      <button 
        @click="activeTab = 'suggestions'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="activeTab === 'suggestions' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        🎯 Suggestions
      </button>
      <button 
        @click="activeTab = 'all'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="activeTab === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        📚 Toutes
      </button>
    </div>

    <!-- Family Recipes Tab -->
    <div v-if="activeTab === 'family'" class="space-y-4">
      <!-- Add Recipe Button -->
      <div 
        @click="goToAddRecipe"
        class="card flex items-center gap-4 border-2 border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
      >
        <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
          ➕
        </div>
        <div>
          <h3 class="font-semibold text-primary-700">Ajouter une recette</h3>
          <p class="text-sm text-primary-600">Partagez vos recettes avec votre famille</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="recipesStore.isLoading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Chargement...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="recipesStore.familyRecipes.length === 0" class="text-center py-8">
        <div class="text-5xl mb-3">📖</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune recette</h3>
        <p class="text-gray-500 text-sm">Créez votre première recette de famille !</p>
      </div>

      <!-- Family Recipes List -->
      <div 
        v-for="recipe in recipesStore.familyRecipes" 
        :key="recipe.id" 
        class="card"
        @click="openFamilyRecipe(recipe)"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-2xl shrink-0">
            🍳
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ recipe.title }}</h3>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span v-if="recipe.totalTime">⏱ {{ recipe.totalTime }} min</span>
              <span v-if="recipe.servings">👥 {{ recipe.servings }} pers.</span>
              <span>{{ getDifficultyLabel(recipe.difficulty) }}</span>
            </div>
            <div v-if="recipe.tags?.length" class="flex flex-wrap gap-1 mt-1">
              <span 
                v-for="tag in recipe.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Suggestions Tab -->
    <div v-else-if="activeTab === 'suggestions'" class="space-y-4">
      <div v-if="recipesStore.suggestions.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🍳</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Pas de suggestions</h3>
        <p class="text-gray-500 mb-4">Ajoutez des articles à votre frigo pour obtenir des suggestions</p>
        <NuxtLink to="/fridge" class="btn-primary">Gérer mon frigo</NuxtLink>
      </div>

      <div v-for="recipe in recipesStore.suggestions" :key="recipe.id" class="card" @click="openRecipe(recipe)">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-3xl shrink-0">
            {{ recipe.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-900 truncate">{{ recipe.name }}</h3>
              <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full shrink-0">
                {{ recipe.matchPercentage }}%
              </span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span>⏱ {{ recipe.time }} min</span>
              <span>👥 {{ recipe.servings }} pers.</span>
              <span class="capitalize">{{ getDifficultyLabel(recipe.difficulty) }}</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="ingredient in recipe.matchingIngredients" 
                :key="ingredient"
                class="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
              >
                ✓ {{ ingredient }}
              </span>
              <span 
                v-for="ingredient in recipe.missingIngredients?.slice(0, 2)" 
                :key="ingredient"
                class="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
              >
                ✗ {{ ingredient }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Recipes Tab -->
    <div v-else class="space-y-4">
      <div v-for="recipe in recipesStore.recipes" :key="recipe.id" class="card" @click="openRecipe(recipe)">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {{ recipe.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ recipe.name }}</h3>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>⏱ {{ recipe.time }} min</span>
              <span>👥 {{ recipe.servings }} pers.</span>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Recipe Detail Modal -->
    <div v-if="selectedRecipe" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="selectedRecipe = null">
      <div class="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-4xl">
            {{ selectedRecipe.emoji }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedRecipe.name }}</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span>⏱ {{ selectedRecipe.time }} min</span>
              <span>👥 {{ selectedRecipe.servings }} pers.</span>
              <span class="capitalize">{{ getDifficultyLabel(selectedRecipe.difficulty) }}</span>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Ingrédients</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="ingredient in selectedRecipe.ingredients" 
              :key="ingredient"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ ingredient }}
            </span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol class="space-y-3">
            <li 
              v-for="(step, index) in selectedRecipe.instructions" 
              :key="index"
              class="flex gap-3"
            >
              <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                {{ index + 1 }}
              </span>
              <p class="text-gray-700">{{ step }}</p>
            </li>
          </ol>
        </div>

        <!-- Add Missing to Shopping List -->
        <div v-if="selectedRecipe.missingIngredients?.length" class="mb-6">
          <button 
            @click="addMissingToShoppingList"
            class="w-full btn-outline py-3"
          >
            🛒 Ajouter {{ selectedRecipe.missingIngredients.length }} ingrédient(s) manquant(s) à la liste
          </button>
        </div>

        <button @click="selectedRecipe = null" class="w-full btn-primary py-3">
          Fermer
        </button>
      </div>
    </div>

    <!-- Family Recipe Detail Modal -->
    <div v-if="selectedFamilyRecipe" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="selectedFamilyRecipe = null">
      <div class="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-4xl">
            🍳
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900">{{ selectedFamilyRecipe.title }}</h2>
            <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span v-if="selectedFamilyRecipe.totalTime">⏱ {{ selectedFamilyRecipe.totalTime }} min</span>
              <span v-if="selectedFamilyRecipe.servings">👥 {{ selectedFamilyRecipe.servings }} pers.</span>
              <span>{{ getDifficultyLabel(selectedFamilyRecipe.difficulty) }}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p v-if="selectedFamilyRecipe.description" class="text-gray-600 mb-4">
          {{ selectedFamilyRecipe.description }}
        </p>

        <!-- Tags -->
        <div v-if="selectedFamilyRecipe.tags?.length" class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="tag in selectedFamilyRecipe.tags" 
            :key="tag"
            class="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Ingredients -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">🥕 Ingrédients</h3>
          <ul class="space-y-2">
            <li 
              v-for="(ingredient, index) in selectedFamilyRecipe.ingredients" 
              :key="index"
              class="flex items-center gap-2 text-gray-700"
            >
              <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
              <span class="font-medium">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
              <span>{{ ingredient.name }}</span>
            </li>
          </ul>
        </div>

        <!-- Instructions -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">👨‍🍳 Préparation</h3>
          <ol class="space-y-3">
            <li 
              v-for="(step, index) in selectedFamilyRecipe.instructions" 
              :key="index"
              class="flex gap-3"
            >
              <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                {{ index + 1 }}
              </span>
              <p class="text-gray-700">{{ step }}</p>
            </li>
          </ol>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button @click="deleteFamilyRecipe" class="w-full btn-outline py-3 text-red-600 border-red-200">
            🗑️ Supprimer cette recette
          </button>
          <button @click="selectedFamilyRecipe = null" class="w-full btn-primary py-3">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useRecipesStore } from '~/stores/recipes'
import { useShoppingStore } from '~/stores/shopping'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const recipesStore = useRecipesStore()
const shoppingStore = useShoppingStore()
const router = useRouter()

const activeTab = ref<'family' | 'suggestions' | 'all'>('family')
const selectedRecipe = ref<any>(null)
const selectedFamilyRecipe = ref<any>(null)

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '🟢 Facile',
    medium: '🟡 Moyen',
    hard: '🔴 Difficile',
  }
  return labels[difficulty] || difficulty
}

function goToAddRecipe() {
  console.log('goToAddRecipe called')
  router.push('/recipes/add')
}

function openRecipe(recipe: any) {
  selectedRecipe.value = recipe
}

function openFamilyRecipe(recipe: any) {
  selectedFamilyRecipe.value = recipe
}

async function deleteFamilyRecipe() {
  if (!selectedFamilyRecipe.value) return
  
  if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
    const result = await recipesStore.deleteFamilyRecipe(selectedFamilyRecipe.value.id)
    if (result.success) {
      selectedFamilyRecipe.value = null
    }
  }
}

async function addMissingToShoppingList() {
  if (!selectedRecipe.value?.missingIngredients) return
  
  for (const ingredient of selectedRecipe.value.missingIngredients) {
    await shoppingStore.addItem({ name: ingredient })
  }
  
  selectedRecipe.value = null
  router.push('/shopping')
}

async function loadData() {
  await recipesStore.fetchRecipes()
  if (familyStore.currentFamilyId) {
    await recipesStore.fetchSuggestions()
    await recipesStore.fetchFamilyRecipes()
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

// Watch for family changes
watch(() => familyStore.currentFamilyId, async (newId) => {
  if (newId) {
    await recipesStore.fetchSuggestions()
    await recipesStore.fetchFamilyRecipes()
  }
})
</script>
