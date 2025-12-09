import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useFamilyStore } from './family'

interface FridgeItem {
  id: number
  familyId: number
  name: string
  quantity: number
  unit: string | null
  expirationDate: string | null
  purchaseDate: string | null
  storageLocation: 'fridge' | 'freezer' | 'pantry'
  isConsumed: boolean
  notes: string | null
  emoji: string
  daysUntilExpiration: number | null
  createdAt: string
  updatedAt: string
}

interface FridgeState {
  items: FridgeItem[]
  expiringItems: FridgeItem[]
  isLoading: boolean
}

export const useFridgeStore = defineStore('fridge', {
  state: (): FridgeState => ({
    items: [],
    expiringItems: [],
    isLoading: false,
  }),

  getters: {
    fridgeItems: (state) => state.items.filter(i => i.storageLocation === 'fridge'),
    freezerItems: (state) => state.items.filter(i => i.storageLocation === 'freezer'),
    pantryItems: (state) => state.items.filter(i => i.storageLocation === 'pantry'),
    itemCount: (state) => state.items.length,
    expiringCount: (state) => state.expiringItems.length,
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
          `${config.public.apiBase}/api/v1/fridge?familyId=${familyStore.currentFamilyId}`,
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
        console.error('Error fetching fridge items:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchExpiringItems(days: number = 7) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      if (!authStore.token || !familyStore.currentFamilyId) return

      try {
        const response = await fetch(
          `${config.public.apiBase}/api/v1/fridge/expiring?familyId=${familyStore.currentFamilyId}&days=${days}`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          this.expiringItems = data.items
        }
      } catch (error) {
        console.error('Error fetching expiring items:', error)
      }
    },

    async addItem(item: {
      name: string
      quantity?: number
      unit?: string
      expirationDate?: string
      storageLocation?: 'fridge' | 'freezer' | 'pantry'
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
        const response = await fetch(`${config.public.apiBase}/api/v1/fridge`, {
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
          this.items.push(data.item)
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

    async updateItem(id: number, updates: Partial<FridgeItem>) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/fridge/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(updates),
        })

        const data = await response.json()

        if (response.ok) {
          const index = this.items.findIndex(i => i.id === id)
          if (index !== -1) {
            this.items[index] = data.item
          }
          return { success: true, message: data.message, item: data.item }
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
        const response = await fetch(`${config.public.apiBase}/api/v1/fridge/${id}`, {
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

    async consumeItem(id: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/fridge/${id}/consume`, {
          method: 'POST',
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
  },
})
