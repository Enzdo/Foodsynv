import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useFamilyStore } from './family'

interface Ingredient {
  name: string
  quantity: string
  unit?: string
}

interface SuggestionRecipe {
  id: number
  name: string
  emoji: string
  ingredients: string[]
  time: number
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  instructions: string[]
  matchingIngredients?: string[]
  matchCount?: number
  matchPercentage?: number
  missingIngredients?: string[]
}

interface FamilyRecipe {
  id: number
  familyId: number
  title: string
  description: string | null
  imageUrl: string | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  totalTime: number | null
  servings: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: Ingredient[]
  instructions: string[]
  tags: string[]
  createdByUserId: number | null
  createdAt: string
  updatedAt: string
}

interface RecipesState {
  recipes: SuggestionRecipe[]
  familyRecipes: FamilyRecipe[]
  suggestions: SuggestionRecipe[]
  isLoading: boolean
}

export const useRecipesStore = defineStore('recipes', {
  state: (): RecipesState => ({
    recipes: [],
    familyRecipes: [],
    suggestions: [],
    isLoading: false,
  }),

  actions: {
    async fetchRecipes() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/recipes`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.recipes = data.recipes
        }
      } catch (error) {
        console.error('Error fetching recipes:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchSuggestions() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) return

      this.isLoading = true
      try {
        const response = await fetch(
          `${config.public.apiBase}/api/v1/recipes/suggestions?familyId=${familyStore.currentFamilyId}`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          this.suggestions = data.suggestions
        }
      } catch (error) {
        console.error('Error fetching recipe suggestions:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchFamilyRecipes() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) return

      this.isLoading = true
      try {
        const response = await fetch(
          `${config.public.apiBase}/api/v1/recipes/family?familyId=${familyStore.currentFamilyId}`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          this.familyRecipes = data.recipes
        }
      } catch (error) {
        console.error('Error fetching family recipes:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createFamilyRecipe(recipe: {
      title: string
      description?: string
      prepTimeMinutes?: number
      cookTimeMinutes?: number
      servings?: number
      difficulty?: 'easy' | 'medium' | 'hard'
      ingredients: Ingredient[]
      instructions: string[]
      tags?: string[]
    }) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) {
        return { success: false, message: 'Non authentifié ou pas de famille' }
      }

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/recipes/family`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            familyId: familyStore.currentFamilyId,
            ...recipe,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          this.familyRecipes.unshift(data.recipe)
          return { success: true, message: data.message, recipe: data.recipe }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async updateFamilyRecipe(id: number, updates: Partial<FamilyRecipe>) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/recipes/family/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(updates),
        })

        const data = await response.json()

        if (response.ok) {
          const index = this.familyRecipes.findIndex(r => r.id === id)
          if (index !== -1) {
            this.familyRecipes[index] = data.recipe
          }
          return { success: true, message: data.message, recipe: data.recipe }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    async deleteFamilyRecipe(id: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/recipes/family/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          this.familyRecipes = this.familyRecipes.filter(r => r.id !== id)
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },
  },
})
