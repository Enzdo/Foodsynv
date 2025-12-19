<template>
  <div class="px-5 pt-8 pb-32 min-h-screen relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-green-400/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[20%] left-[-10%] w-[200px] h-[200px] bg-primary-400/10 rounded-full blur-3xl pointer-events-none"></div>

    <header class="mb-6 relative z-10">
      <h1 class="text-3xl font-bold text-dark-900 tracking-tight">Coach Nutrition</h1>
      <p class="text-gray-500 font-medium mt-1">Repas personnalisés selon vos objectifs</p>
    </header>

    <!-- Loading State for Analysis -->
    <div v-if="nutritionStore.isAnalyzing" class="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      <div class="relative w-24 h-24 mb-6">
        <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🥗</div>
      </div>
      <h3 class="text-xl font-bold text-dark-900 mb-2">Analyse en cours...</h3>
      <p class="text-gray-500 text-center max-w-xs">Notre IA analyse votre frigo et génère des suggestions de repas adaptées à vos objectifs.</p>
    </div>

    <!-- Profile Setup Modal -->
    <div v-if="showProfileModal" class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-dark-900">Mon profil nutritionnel</h2>
            <button @click="showProfileModal = false" class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" @click="profileForm.gender = 'male'"
                  :class="['py-3 px-4 rounded-xl border-2 font-medium transition-all', profileForm.gender === 'male' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600']">
                  👨 Homme
                </button>
                <button type="button" @click="profileForm.gender = 'female'"
                  :class="['py-3 px-4 rounded-xl border-2 font-medium transition-all', profileForm.gender === 'female' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600']">
                  👩 Femme
                </button>
                <button type="button" @click="profileForm.gender = 'other'"
                  :class="['py-3 px-4 rounded-xl border-2 font-medium transition-all', profileForm.gender === 'other' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600']">
                  🧑 Autre
                </button>
              </div>
            </div>

            <!-- Age, Weight, Height -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                <input v-model.number="profileForm.age" type="number" min="10" max="120"
                  class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="25" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                <input v-model.number="profileForm.weight" type="number" min="20" max="300" step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="70" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
                <input v-model.number="profileForm.height" type="number" min="100" max="250"
                  class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="175" />
              </div>
            </div>

            <!-- Activity Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Niveau d'activité</label>
              <select v-model="profileForm.activityLevel"
                class="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="sedentary">🪑 Sédentaire (peu ou pas d'exercice)</option>
                <option value="light">🚶 Légèrement actif (1-3 jours/semaine)</option>
                <option value="moderate">🏃 Modérément actif (3-5 jours/semaine)</option>
                <option value="active">💪 Actif (6-7 jours/semaine)</option>
                <option value="very_active">🏋️ Très actif (2x par jour)</option>
              </select>
            </div>

            <!-- Goal -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Objectif</label>
              <div class="space-y-2">
                <button type="button" @click="profileForm.goal = 'lose_weight'"
                  :class="['w-full py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3', profileForm.goal === 'lose_weight' ? 'border-green-500 bg-green-50' : 'border-gray-200']">
                  <span class="text-2xl">🔥</span>
                  <div>
                    <div class="font-medium text-dark-900">Perdre du poids</div>
                    <div class="text-xs text-gray-500">Déficit calorique contrôlé</div>
                  </div>
                </button>
                <button type="button" @click="profileForm.goal = 'maintain'"
                  :class="['w-full py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3', profileForm.goal === 'maintain' ? 'border-green-500 bg-green-50' : 'border-gray-200']">
                  <span class="text-2xl">⚖️</span>
                  <div>
                    <div class="font-medium text-dark-900">Maintenir mon poids</div>
                    <div class="text-xs text-gray-500">Alimentation équilibrée</div>
                  </div>
                </button>
                <button type="button" @click="profileForm.goal = 'gain_muscle'"
                  :class="['w-full py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3', profileForm.goal === 'gain_muscle' ? 'border-green-500 bg-green-50' : 'border-gray-200']">
                  <span class="text-2xl">💪</span>
                  <div>
                    <div class="font-medium text-dark-900">Prendre du muscle</div>
                    <div class="text-xs text-gray-500">Surplus calorique + protéines</div>
                  </div>
                </button>
              </div>
            </div>

            <button type="submit" :disabled="!isProfileValid || nutritionStore.isLoading"
              class="w-full py-4 bg-green-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors">
              {{ nutritionStore.isLoading ? 'Enregistrement...' : 'Enregistrer mon profil' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 space-y-4">
      <!-- Profile Card -->
      <div v-if="nutritionStore.hasProfile && nutritionStore.profile" class="card bg-gradient-to-br from-green-50 to-white">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-dark-900 flex items-center gap-2">
            <span class="text-xl">👤</span> Mon profil
          </h3>
          <button @click="openProfileModal" class="text-sm text-green-600 font-medium">Modifier</button>
        </div>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-white rounded-xl p-3 shadow-sm">
            <div class="text-2xl font-bold text-dark-900">{{ nutritionStore.profile.weight }}</div>
            <div class="text-xs text-gray-500">kg</div>
          </div>
          <div class="bg-white rounded-xl p-3 shadow-sm">
            <div class="text-2xl font-bold text-dark-900">{{ nutritionStore.profile.height }}</div>
            <div class="text-xs text-gray-500">cm</div>
          </div>
          <div class="bg-white rounded-xl p-3 shadow-sm">
            <div class="text-2xl font-bold text-dark-900">{{ nutritionStore.profile.age }}</div>
            <div class="text-xs text-gray-500">ans</div>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {{ goalEmoji }} {{ nutritionStore.goalLabel }}
          </span>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {{ nutritionStore.activityLabel }}
          </span>
        </div>
      </div>

      <!-- No Profile Card -->
      <div v-else class="card border-2 border-dashed border-green-300 bg-green-50/50">
        <div class="text-center py-4">
          <div class="text-4xl mb-3">📊</div>
          <h3 class="font-bold text-dark-900 mb-1">Configurez votre profil</h3>
          <p class="text-sm text-gray-500 mb-4">Pour des suggestions personnalisées selon vos objectifs</p>
          <button @click="openProfileModal" class="btn-primary px-6">
            Créer mon profil
          </button>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-if="nutritionStore.analysis" class="space-y-4 animate-fade-in">
        <!-- Nutritional Targets -->
        <div class="card">
          <h3 class="font-bold text-dark-900 mb-3 flex items-center gap-2">
            <span class="text-xl">🎯</span> Objectifs journaliers
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-orange-50 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ nutritionStore.analysis.dailyCalorieTarget }}</div>
              <div class="text-xs text-gray-600">kcal</div>
            </div>
            <div class="bg-red-50 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-red-600">{{ nutritionStore.analysis.dailyProteinTarget }}g</div>
              <div class="text-xs text-gray-600">Protéines</div>
            </div>
            <div class="bg-yellow-50 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ nutritionStore.analysis.dailyCarbsTarget }}g</div>
              <div class="text-xs text-gray-600">Glucides</div>
            </div>
            <div class="bg-purple-50 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ nutritionStore.analysis.dailyFatsTarget }}g</div>
              <div class="text-xs text-gray-600">Lipides</div>
            </div>
          </div>
          <div class="mt-3 p-3 bg-gray-50 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">IMC</span>
              <span class="font-bold text-dark-900">{{ nutritionStore.analysis.bmi }} - {{ nutritionStore.analysis.bmiCategory }}</span>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="card">
          <h3 class="font-bold text-dark-900 mb-3 flex items-center gap-2">
            <span class="text-xl">💡</span> Recommandations
          </h3>
          <div class="space-y-2">
            <div v-for="(rec, index) in nutritionStore.analysis.recommendations" :key="index"
              class="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
              {{ rec }}
            </div>
          </div>
        </div>

        <!-- Lunch Suggestions -->
        <div class="card">
          <h3 class="font-bold text-dark-900 mb-3 flex items-center gap-2">
            <span class="text-xl">🌞</span> Suggestions déjeuner
          </h3>
          <div class="space-y-3">
            <div v-for="(meal, index) in nutritionStore.analysis.lunchSuggestions" :key="'lunch-' + index"
              class="bg-gray-50 rounded-xl overflow-hidden">
              <button @click="toggleMeal('lunch', index)" class="w-full p-4 text-left flex items-center gap-3">
                <span class="text-3xl">{{ meal.emoji }}</span>
                <div class="flex-1">
                  <div class="font-bold text-dark-900">{{ meal.name }}</div>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>🔥 {{ meal.calories }} kcal</span>
                    <span>⏱️ {{ meal.prepTime }} min</span>
                    <span :class="difficultyClass(meal.difficulty)">{{ difficultyLabel(meal.difficulty) }}</span>
                  </div>
                </div>
                <svg :class="['w-5 h-5 text-gray-400 transition-transform', expandedMeals.lunch === index ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="expandedMeals.lunch === index" class="px-4 pb-4 space-y-3 animate-fade-in">
                <!-- Macros -->
                <div class="flex gap-2">
                  <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">P: {{ meal.proteins }}g</span>
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">G: {{ meal.carbs }}g</span>
                  <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">L: {{ meal.fats }}g</span>
                </div>
                <!-- Ingredients -->
                <div>
                  <div class="text-xs font-medium text-gray-500 mb-1">Ingrédients</div>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="ing in meal.ingredients" :key="ing" class="px-2 py-1 bg-white rounded text-xs text-gray-700">{{ ing }}</span>
                  </div>
                </div>
                <!-- Instructions -->
                <div>
                  <div class="text-xs font-medium text-gray-500 mb-1">Préparation</div>
                  <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li v-for="(step, i) in meal.instructions" :key="i">{{ step }}</li>
                  </ol>
                </div>
                <!-- Tips -->
                <div class="p-3 bg-green-50 rounded-lg">
                  <div class="text-xs font-medium text-green-700">💡 {{ meal.tips }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dinner Suggestions -->
        <div class="card">
          <h3 class="font-bold text-dark-900 mb-3 flex items-center gap-2">
            <span class="text-xl">🌙</span> Suggestions dîner
          </h3>
          <div class="space-y-3">
            <div v-for="(meal, index) in nutritionStore.analysis.dinnerSuggestions" :key="'dinner-' + index"
              class="bg-gray-50 rounded-xl overflow-hidden">
              <button @click="toggleMeal('dinner', index)" class="w-full p-4 text-left flex items-center gap-3">
                <span class="text-3xl">{{ meal.emoji }}</span>
                <div class="flex-1">
                  <div class="font-bold text-dark-900">{{ meal.name }}</div>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>🔥 {{ meal.calories }} kcal</span>
                    <span>⏱️ {{ meal.prepTime }} min</span>
                    <span :class="difficultyClass(meal.difficulty)">{{ difficultyLabel(meal.difficulty) }}</span>
                  </div>
                </div>
                <svg :class="['w-5 h-5 text-gray-400 transition-transform', expandedMeals.dinner === index ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="expandedMeals.dinner === index" class="px-4 pb-4 space-y-3 animate-fade-in">
                <!-- Macros -->
                <div class="flex gap-2">
                  <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">P: {{ meal.proteins }}g</span>
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">G: {{ meal.carbs }}g</span>
                  <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">L: {{ meal.fats }}g</span>
                </div>
                <!-- Ingredients -->
                <div>
                  <div class="text-xs font-medium text-gray-500 mb-1">Ingrédients</div>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="ing in meal.ingredients" :key="ing" class="px-2 py-1 bg-white rounded text-xs text-gray-700">{{ ing }}</span>
                  </div>
                </div>
                <!-- Instructions -->
                <div>
                  <div class="text-xs font-medium text-gray-500 mb-1">Préparation</div>
                  <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li v-for="(step, i) in meal.instructions" :key="i">{{ step }}</li>
                  </ol>
                </div>
                <!-- Tips -->
                <div class="p-3 bg-green-50 rounded-lg">
                  <div class="text-xs font-medium text-green-700">💡 {{ meal.tips }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div v-if="nutritionStore.hasProfile && !nutritionStore.analysis" class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="text-center py-4">
          <div class="text-4xl mb-3">🍽️</div>
          <h3 class="font-bold text-xl mb-2">Prêt à manger sainement ?</h3>
          <p class="text-green-100 text-sm mb-4">Générez des suggestions de repas basées sur le contenu de votre frigo et vos objectifs</p>
          <button @click="generateSuggestions" :disabled="nutritionStore.isAnalyzing"
            class="px-8 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50">
            Générer mes repas
          </button>
        </div>
      </div>

      <!-- Regenerate Button -->
      <div v-if="nutritionStore.analysis" class="fixed bottom-24 left-0 right-0 px-5 z-20">
        <button @click="generateSuggestions" :disabled="nutritionStore.isAnalyzing"
          class="w-full btn-primary py-4 shadow-lg shadow-green-500/30 bg-green-500 hover:bg-green-600">
          🔄 Régénérer les suggestions
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="nutritionStore.error" class="card bg-red-50 border border-red-200">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <div class="font-medium text-red-800">Erreur</div>
            <div class="text-sm text-red-600">{{ nutritionStore.error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNutritionStore, type NutritionProfile, type Gender, type ActivityLevel, type NutritionGoal } from '~/stores/nutrition'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'

const nutritionStore = useNutritionStore()
const authStore = useAuthStore()
const familyStore = useFamilyStore()
const router = useRouter()

const showProfileModal = ref(false)
const expandedMeals = ref<{ lunch: number | null; dinner: number | null }>({ lunch: null, dinner: null })

const profileForm = ref<NutritionProfile>({
  weight: 70,
  height: 175,
  age: 30,
  gender: 'male' as Gender,
  activityLevel: 'moderate' as ActivityLevel,
  goal: 'maintain' as NutritionGoal,
})

const isProfileValid = computed(() => {
  return profileForm.value.weight > 0 &&
    profileForm.value.height > 0 &&
    profileForm.value.age > 0 &&
    profileForm.value.gender &&
    profileForm.value.activityLevel &&
    profileForm.value.goal
})

const goalEmoji = computed(() => {
  if (!nutritionStore.profile) return ''
  const emojis: Record<NutritionGoal, string> = {
    lose_weight: '🔥',
    maintain: '⚖️',
    gain_muscle: '💪',
  }
  return emojis[nutritionStore.profile.goal]
})

function openProfileModal() {
  if (nutritionStore.profile) {
    profileForm.value = { ...nutritionStore.profile }
  }
  showProfileModal.value = true
}

async function saveProfile() {
  const result = await nutritionStore.updateProfile(profileForm.value)
  if (result.success) {
    showProfileModal.value = false
  }
}

async function generateSuggestions() {
  nutritionStore.clearAnalysis()
  await nutritionStore.analyzeNutrition()
}

function toggleMeal(type: 'lunch' | 'dinner', index: number) {
  if (expandedMeals.value[type] === index) {
    expandedMeals.value[type] = null
  } else {
    expandedMeals.value[type] = index
  }
}

function difficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  }
  return labels[difficulty] || difficulty
}

function difficultyClass(difficulty: string) {
  const classes: Record<string, string> = {
    easy: 'text-green-600',
    medium: 'text-orange-600',
    hard: 'text-red-600',
  }
  return classes[difficulty] || ''
}

onMounted(async () => {
  await authStore.init()
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await familyStore.fetchFamilies()
  await nutritionStore.fetchProfile()
  
  // Pre-fill form with existing profile
  if (nutritionStore.profile) {
    profileForm.value = { ...nutritionStore.profile }
  }
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
