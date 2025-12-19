import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useFamilyStore } from './family'

export type NutritionGoal = 'lose_weight' | 'maintain' | 'gain_muscle'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female' | 'other'

export interface NutritionProfile {
  weight: number
  height: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  goal: NutritionGoal
}

export interface MealSuggestion {
  name: string
  emoji: string
  type: 'lunch' | 'dinner'
  calories: number
  proteins: number
  carbs: number
  fats: number
  ingredients: string[]
  instructions: string[]
  prepTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string
}

export interface NutritionAnalysis {
  dailyCalorieTarget: number
  dailyProteinTarget: number
  dailyCarbsTarget: number
  dailyFatsTarget: number
  bmi: number
  bmiCategory: string
  recommendations: string[]
  lunchSuggestions: MealSuggestion[]
  dinnerSuggestions: MealSuggestion[]
}

interface NutritionState {
  profile: NutritionProfile | null
  hasProfile: boolean
  analysis: NutritionAnalysis | null
  isLoading: boolean
  isAnalyzing: boolean
  error: string | null
}

export const useNutritionStore = defineStore('nutrition', {
  state: (): NutritionState => ({
    profile: null,
    hasProfile: false,
    analysis: null,
    isLoading: false,
    isAnalyzing: false,
    error: null,
  }),

  getters: {
    goalLabel: (state) => {
      if (!state.profile) return ''
      const labels: Record<NutritionGoal, string> = {
        lose_weight: 'Perdre du poids',
        maintain: 'Maintenir mon poids',
        gain_muscle: 'Prendre du muscle',
      }
      return labels[state.profile.goal]
    },

    activityLabel: (state) => {
      if (!state.profile) return ''
      const labels: Record<ActivityLevel, string> = {
        sedentary: 'Sédentaire',
        light: 'Légèrement actif',
        moderate: 'Modérément actif',
        active: 'Actif',
        very_active: 'Très actif',
      }
      return labels[state.profile.activityLevel]
    },
  },

  actions: {
    async fetchProfile() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (!authStore.token) {
        this.error = 'Non authentifié'
        return { success: false }
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/nutrition/profile`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de la récupération du profil')
        }

        this.hasProfile = result.hasProfile
        this.profile = result.profile
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(profile: NutritionProfile) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (!authStore.token) {
        this.error = 'Non authentifié'
        return { success: false }
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/nutrition/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(profile),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de la mise à jour du profil')
        }

        this.profile = profile
        this.hasProfile = true
        
        // Update auth store user data
        if (authStore.user) {
          authStore.user = { ...authStore.user, ...profile }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async analyzeNutrition() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()

      if (!authStore.token) {
        this.error = 'Non authentifié'
        return { success: false }
      }

      if (!familyStore.currentFamily) {
        this.error = 'Aucune famille sélectionnée'
        return { success: false }
      }

      this.isAnalyzing = true
      this.error = null
      this.analysis = null

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/nutrition/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            familyId: familyStore.currentFamily.id,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          if (result.code === 'INCOMPLETE_PROFILE') {
            this.error = 'Veuillez compléter votre profil nutritionnel'
            return { success: false, code: 'INCOMPLETE_PROFILE' }
          }
          throw new Error(result.message || 'Erreur lors de l\'analyse')
        }

        this.analysis = result.analysis
        return { success: true, analysis: result.analysis }
      } catch (error: any) {
        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.isAnalyzing = false
      }
    },

    clearAnalysis() {
      this.analysis = null
      this.error = null
    },
  },
})
