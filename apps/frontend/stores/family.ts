import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface Family {
  id: number
  name: string
  inviteCode: string
  ownerId: number
  role?: string
  joinedAt?: string
  createdAt: string
  updatedAt: string
}

interface FamilyMember {
  id: number
  userId: number
  role: string
  nickname: string | null
  joinedAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

interface FamilyState {
  families: Family[]
  currentFamily: Family | null
  members: FamilyMember[]
  isLoading: boolean
}

export const useFamilyStore = defineStore('family', {
  state: (): FamilyState => ({
    families: [],
    currentFamily: null,
    members: [],
    isLoading: false,
  }),

  getters: {
    hasFamily: (state) => state.families.length > 0,
    currentFamilyId: (state) => state.currentFamily?.id || null,
  },

  actions: {
    async fetchFamilies() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/families`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.families = data.families
          
          // Auto-select first family if none selected
          if (this.families.length > 0 && !this.currentFamily) {
            this.currentFamily = this.families[0]
          }
        }
      } catch (error) {
        console.error('Error fetching families:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createFamily(name: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/families`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({ name }),
        })

        const data = await response.json()

        if (response.ok) {
          await this.fetchFamilies()
          this.currentFamily = data.family
          return { success: true, message: data.message, family: data.family }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async joinFamily(inviteCode: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      this.isLoading = true
      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/families/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({ inviteCode }),
        })

        const data = await response.json()

        if (response.ok) {
          await this.fetchFamilies()
          this.currentFamily = data.family
          return { success: true, message: data.message, family: data.family }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async fetchFamilyDetails(familyId: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/families/${familyId}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.members = data.family.members
        }
      } catch (error) {
        console.error('Error fetching family details:', error)
      }
    },

    async leaveFamily(familyId: number) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      
      if (!authStore.token) return { success: false, message: 'Non authentifié' }

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/families/${familyId}/leave`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          await this.fetchFamilies()
          if (this.currentFamily?.id === familyId) {
            this.currentFamily = this.families[0] || null
          }
          return { success: true, message: data.message }
        } else {
          return { success: false, message: data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    },

    setCurrentFamily(family: Family) {
      this.currentFamily = family
      if (import.meta.client) {
        localStorage.setItem('current_family_id', String(family.id))
      }
    },

    loadCurrentFamily() {
      if (import.meta.client) {
        const savedId = localStorage.getItem('current_family_id')
        if (savedId && this.families.length > 0) {
          const family = this.families.find(f => f.id === Number(savedId))
          if (family) {
            this.currentFamily = family
          }
        }
      }
    },
  },
})
