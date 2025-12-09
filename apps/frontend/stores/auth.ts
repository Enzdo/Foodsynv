import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl: string | null
  role: 'admin' | 'member'
  isActive: boolean
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
  },

  actions: {
    /**
     * Initialize auth state from localStorage
     */
    init() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        if (token && userStr) {
          this.token = token
          this.user = JSON.parse(userStr)
          this.isAuthenticated = true
        }
      }
    },

    /**
     * Register a new user
     */
    async register(data: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) {
      const config = useRuntimeConfig()
      this.isLoading = true

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de l\'inscription')
        }

        this.setAuth(result.user, result.token.value)
        return { success: true, message: result.message }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Login user
     */
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      this.isLoading = true

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Email ou mot de passe incorrect')
        }

        this.setAuth(result.user, result.token.value)
        return { success: true, message: result.message }
      } catch (error: any) {
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout user
     */
    async logout() {
      const config = useRuntimeConfig()

      try {
        if (this.token) {
          await fetch(`${config.public.apiBase}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`,
            },
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
      }
    },

    /**
     * Get current user profile
     */
    async fetchUser() {
      const config = useRuntimeConfig()

      if (!this.token) return

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })

        if (!response.ok) {
          this.clearAuth()
          return
        }

        const result = await response.json()
        this.user = result.user
      } catch (error) {
        this.clearAuth()
      }
    },

    /**
     * Set auth state and persist to localStorage
     */
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      this.isAuthenticated = true

      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    /**
     * Clear auth state and localStorage
     */
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },
  },
})
