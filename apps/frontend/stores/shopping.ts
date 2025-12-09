import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useFamilyStore } from './family'

interface ShoppingItem {
  id: number
  familyId: number
  name: string
  quantity: number
  unit: string | null
  isPurchased: boolean
  priority: 'low' | 'medium' | 'high'
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ShoppingState {
  items: ShoppingItem[]
  isLoading: boolean
}

export const useShoppingStore = defineStore('shopping', {
  state: (): ShoppingState => ({
    items: [],
    isLoading: false,
  }),

  getters: {
    pendingItems: (state) => state.items.filter(i => !i.isPurchased),
    purchasedItems: (state) => state.items.filter(i => i.isPurchased),
    remainingCount: (state) => state.items.filter(i => !i.isPurchased).length,
    progressPercentage: (state) => {
      if (state.items.length === 0) return 0
      return Math.round((state.items.filter(i => i.isPurchased).length / state.items.length) * 100)
    },
  },

  actions: {
    async fetchItems() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) return

      this.isLoading = true
      try {
        const response = await fetch(
          `${config.public.apiBase}/api/v1/shopping?familyId=${familyStore.currentFamilyId}`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          this.items = data.items
        }
      } catch (error) {
        console.error('Error fetching shopping items:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addItem(item: {
      name: string
      quantity?: number
      unit?: string
      priority?: 'low' | 'medium' | 'high'
      notes?: string
    }) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) {
        return { success: false, message: 'Non authentifié ou pas de famille' }
      }

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/shopping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            familyId: familyStore.currentFamilyId,
            ...item,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          this.items.unshift(data.item)
          return { success: true, message: data.message, item: data.item }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async toggleItem(id: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/shopping/${id}/toggle`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          const index = this.items.findIndex(i => i.id === id)
          if (index !== -1) {
            this.items[index] = data.item
          }
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    async deleteItem(id: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/shopping/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          this.items = this.items.filter(i => i.id !== id)
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    async clearPurchased() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) {
        return { success: false, message: 'Non authentifié' }
      }

      try {
        const response = await fetch(
          `${config.public.apiBase}/api/v1/shopping/clear-purchased?familyId=${familyStore.currentFamilyId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          this.items = this.items.filter(i => !i.isPurchased)
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
