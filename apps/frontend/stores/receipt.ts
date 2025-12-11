import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export interface ScannedItem {
  name: string
  quantity: number
  price?: number
  category?: string
  expirationDate?: string
}

interface ReceiptState {
  isScanning: boolean
  scannedItems: ScannedItem[]
  error: string | null
}

export const useReceiptStore = defineStore('receipt', {
  state: (): ReceiptState => ({
    isScanning: false,
    scannedItems: [],
    error: null,
  }),

  actions: {
    async scanReceipt(imageBase64: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (!authStore.token) {
        this.error = 'Vous devez être connecté pour scanner un ticket'
        return { success: false, message: this.error }
      }

      this.isScanning = true
      this.error = null
      this.scannedItems = []

      try {
        const response = await fetch(`${config.public.apiBase}/api/v1/receipts/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            image: imageBase64,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de l\'analyse du ticket')
        }

        this.scannedItems = result.items
        return { success: true, items: result.items }
      } catch (error: any) {
        this.error = error.message
        return { success: false, message: error.message }
      } finally {
        this.isScanning = false
      }
    },

    clearScannedItems() {
      this.scannedItems = []
      this.error = null
    },
  },
})
