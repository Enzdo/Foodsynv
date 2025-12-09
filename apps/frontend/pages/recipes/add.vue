<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <NuxtLink to="/recipes" class="text-gray-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Nouvelle recette</h1>
      </div>
      <p class="text-gray-500">Ajoutez une recette à votre famille</p>
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

    <!-- Recipe Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">📝 Informations</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la recette *</label>
            <input 
              v-model="recipe.title" 
              type="text" 
              required 
              class="input" 
              placeholder="Ex: Tarte aux pommes de mamie"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="recipe.description" 
              class="input" 
              rows="3"
              placeholder="Une brève description de votre recette..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Temps de préparation</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model.number="recipe.prepTimeMinutes" 
                  type="number" 
                  min="0" 
                  class="input flex-1" 
                  placeholder="15"
                />
                <span class="text-sm text-gray-500">min</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Temps de cuisson</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model.number="recipe.cookTimeMinutes" 
                  type="number" 
                  min="0" 
                  class="input flex-1" 
                  placeholder="30"
                />
                <span class="text-sm text-gray-500">min</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Portions</label>
              <input 
                v-model.number="recipe.servings" 
                type="number" 
                min="1" 
                class="input" 
                placeholder="4"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
              <select v-model="recipe.difficulty" class="input">
                <option value="easy">🟢 Facile</option>
                <option value="medium">🟡 Moyen</option>
                <option value="hard">🔴 Difficile</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingredients -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">🥕 Ingrédients</h2>
        
        <div class="space-y-3">
          <div 
            v-for="(ingredient, index) in recipe.ingredients" 
            :key="index"
            class="flex items-center gap-2"
          >
            <input 
              v-model="ingredient.quantity" 
              type="text" 
              class="input w-20" 
              placeholder="200"
            />
            <input 
              v-model="ingredient.unit" 
              type="text" 
              class="input w-16" 
              placeholder="g"
            />
            <input 
              v-model="ingredient.name" 
              type="text" 
              class="input flex-1" 
              placeholder="Farine"
              required
            />
            <button 
              type="button" 
              @click="removeIngredient(index)"
              class="text-red-500 p-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button 
            type="button" 
            @click="addIngredient"
            class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            + Ajouter un ingrédient
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">👨‍🍳 Étapes de préparation</h2>
        
        <div class="space-y-3">
          <div 
            v-for="(instruction, index) in recipe.instructions" 
            :key="index"
            class="flex items-start gap-3"
          >
            <div class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-2">
              {{ index + 1 }}
            </div>
            <textarea 
              v-model="recipe.instructions[index]" 
              class="input flex-1" 
              rows="2"
              :placeholder="`Étape ${index + 1}...`"
              required
            ></textarea>
            <button 
              type="button" 
              @click="removeInstruction(index)"
              class="text-red-500 p-2 mt-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button 
            type="button" 
            @click="addInstruction"
            class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            + Ajouter une étape
          </button>
        </div>
      </div>

      <!-- Tags -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">🏷️ Tags (optionnel)</h2>
        
        <div class="flex flex-wrap gap-2 mb-3">
          <button 
            v-for="tag in availableTags" 
            :key="tag"
            type="button"
            @click="toggleTag(tag)"
            class="px-3 py-1 rounded-full text-sm transition-colors"
            :class="recipe.tags.includes(tag) 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600'"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex gap-3">
        <NuxtLink to="/recipes" class="flex-1 btn-outline text-center">
          Annuler
        </NuxtLink>
        <button 
          type="submit" 
          class="flex-1 btn-primary"
          :disabled="recipesStore.isLoading || !isFormValid"
        >
          {{ recipesStore.isLoading ? 'Création...' : '✨ Créer la recette' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useRecipesStore } from '~/stores/recipes'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const recipesStore = useRecipesStore()
const router = useRouter()

const availableTags = [
  'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose',
  'Rapide', 'Économique', 'Healthy', 'Comfort food',
  'Dessert', 'Entrée', 'Plat principal', 'Apéritif',
  'Petit-déjeuner', 'Brunch', 'Dîner', 'Fête',
]

const recipe = reactive({
  title: '',
  description: '',
  prepTimeMinutes: null as number | null,
  cookTimeMinutes: null as number | null,
  servings: 4,
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  ingredients: [
    { name: '', quantity: '', unit: '' },
  ],
  instructions: [''],
  tags: [] as string[],
})

const isFormValid = computed(() => {
  return (
    recipe.title.trim() !== '' &&
    recipe.ingredients.some(i => i.name.trim() !== '') &&
    recipe.instructions.some(i => i.trim() !== '')
  )
})

function addIngredient() {
  recipe.ingredients.push({ name: '', quantity: '', unit: '' })
}

function removeIngredient(index: number) {
  if (recipe.ingredients.length > 1) {
    recipe.ingredients.splice(index, 1)
  }
}

function addInstruction() {
  recipe.instructions.push('')
}

function removeInstruction(index: number) {
  if (recipe.instructions.length > 1) {
    recipe.instructions.splice(index, 1)
  }
}

function toggleTag(tag: string) {
  const index = recipe.tags.indexOf(tag)
  if (index === -1) {
    recipe.tags.push(tag)
  } else {
    recipe.tags.splice(index, 1)
  }
}

async function handleSubmit() {
  // Filter out empty ingredients and instructions
  const cleanedIngredients = recipe.ingredients.filter(i => i.name.trim() !== '')
  const cleanedInstructions = recipe.instructions.filter(i => i.trim() !== '')

  if (cleanedIngredients.length === 0) {
    alert('Ajoutez au moins un ingrédient')
    return
  }

  if (cleanedInstructions.length === 0) {
    alert('Ajoutez au moins une étape')
    return
  }

  const result = await recipesStore.createFamilyRecipe({
    title: recipe.title,
    description: recipe.description || undefined,
    prepTimeMinutes: recipe.prepTimeMinutes || undefined,
    cookTimeMinutes: recipe.cookTimeMinutes || undefined,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: cleanedIngredients,
    instructions: cleanedInstructions,
    tags: recipe.tags.length > 0 ? recipe.tags : undefined,
  })

  if (result.success) {
    router.push('/recipes')
  } else {
    alert(result.message || 'Erreur lors de la création')
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
})
</script>
