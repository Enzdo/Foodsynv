<template>
  <div class="px-5 pt-8 pb-32 min-h-screen relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary-400/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[20%] left-[-10%] w-[200px] h-[200px] bg-secondary-400/10 rounded-full blur-3xl pointer-events-none"></div>

    <header class="mb-8 relative z-10">
      <h1 class="text-3xl font-bold text-dark-900 tracking-tight">Scanner</h1>
      <p class="text-gray-500 font-medium mt-1">Numérisez vos achats en un instant</p>
    </header>

    <!-- Loading State -->
    <div v-if="receiptStore.isScanning" class="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      <div class="relative w-24 h-24 mb-6">
        <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🧾</div>
      </div>
      <h3 class="text-xl font-bold text-dark-900 mb-2">Analyse en cours...</h3>
      <p class="text-gray-500 text-center max-w-xs">Notre IA déchiffre votre ticket pour extraire les aliments et dates de péremption.</p>
    </div>

    <!-- Results View -->
    <div v-else-if="receiptStore.scannedItems.length > 0" class="relative z-10 animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-dark-900 flex items-center gap-2">
          <span>✨</span> {{ receiptStore.scannedItems.length }} articles détectés
        </h2>
        <button @click="resetScan" class="text-sm font-medium text-gray-500 hover:text-dark-900">
          Annuler
        </button>
      </div>

      <div class="space-y-3 mb-24">
        <div v-for="(item, index) in receiptStore.scannedItems" :key="index" class="card !p-3 flex items-center gap-3 animate-slide-up" :style="{ animationDelay: `${index * 50}ms` }">
          <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl shrink-0">
            {{ getCategoryEmoji(item.category) }}
          </div>
          <div class="flex-1 min-w-0">
            <input 
              v-model="item.name" 
              class="font-bold text-dark-900 w-full bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400"
              placeholder="Nom du produit"
            />
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{ item.category || 'Divers' }}</span>
              <span v-if="item.expirationDate" class="text-xs flex items-center gap-1 text-orange-600 font-medium">
                ⏳ {{ formatDate(item.expirationDate) }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="item.quantity > 1 ? item.quantity-- : null" class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">-</button>
            <span class="w-4 text-center font-medium text-sm">{{ item.quantity }}</span>
            <button @click="item.quantity++" class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">+</button>
          </div>
          <button @click="removeItem(index)" class="text-gray-400 hover:text-red-500 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <div class="fixed bottom-24 left-0 right-0 px-5 z-20">
        <button @click="addAllToFridge" class="w-full btn-primary py-4 shadow-lg shadow-primary-500/30">
          Ajouter {{ receiptStore.scannedItems.length }} articles au frigo
        </button>
      </div>
    </div>

    <!-- Scan Options (Main View) -->
    <div v-else class="grid grid-cols-2 gap-4 relative z-10">
      <button 
        @click="takePhoto"
        class="card text-center py-8 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative border-2 border-transparent hover:border-primary-100"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative">
          <div class="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            🧾
          </div>
          <h3 class="font-bold text-dark-900 text-lg">Ticket de caisse</h3>
          <p class="text-xs text-gray-500 mt-2 font-medium px-2">Analyse par IA & ajout automatique</p>
        </div>
      </button>

      <label class="card text-center py-8 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative border-2 border-transparent hover:border-primary-100 cursor-pointer">
        <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
        <div class="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative">
          <div class="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            🖼️
          </div>
          <h3 class="font-bold text-dark-900 text-lg">Importer photo</h3>
          <p class="text-xs text-gray-500 mt-2 font-medium px-2">Depuis la galerie</p>
        </div>
      </label>
      
      <button 
        class="card text-center py-6 transition-all opacity-60 grayscale"
        disabled
      >
        <div class="text-3xl mb-3">📊</div>
        <h3 class="font-bold text-gray-900">Code-barres</h3>
        <p class="text-xs text-gray-500 mt-1">Bientôt disponible</p>
      </button>
      
      <button 
        @click="addManually"
        class="card text-center py-6 transition-all hover:scale-[1.02] active:scale-95"
      >
        <div class="text-3xl mb-3">✏️</div>
        <h3 class="font-bold text-dark-900">Manuel</h3>
        <p class="text-xs text-gray-500 mt-1">Saisie rapide</p>
      </button>
    </div>

    <!-- Info Card -->
    <div v-if="!receiptStore.scannedItems.length && !receiptStore.isScanning" class="card mt-6 bg-surface-50 border-dashed border-2 border-primary-200/50 shadow-none relative z-10">
      <div class="flex gap-4">
        <div class="text-2xl pt-1">💡</div>
        <div>
          <h4 class="font-bold text-dark-900">Astuce de pro</h4>
          <p class="text-sm text-gray-600 mt-1 leading-relaxed">
            Pour de meilleurs résultats, prenez le ticket bien à plat dans un endroit éclairé. L'IA détectera automatiquement les noms, quantités et dates !
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReceiptStore } from '~/stores/receipt'
import { useFridgeStore } from '~/stores/fridge'

const receiptStore = useReceiptStore()
const fridgeStore = useFridgeStore()
const router = useRouter()

async function takePhoto() {
  try {
    // Dynamic import to avoid SSR/build issues
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    })

    if (image.base64String) {
      await receiptStore.scanReceipt(image.base64String)
    }
  } catch (error: any) {
    // Fallback for web: use file input instead
    if (error.message?.includes('not implemented') || error.message?.includes('not available')) {
      // Trigger file input as fallback
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.click()
    } else {
      console.error('Camera error:', error)
      alert('Erreur caméra. Utilisez l\'option "Importer photo" à la place.')
    }
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const base64String = e.target?.result as string
      // Remove data URL prefix for API
      const base64Content = base64String.split(',')[1]
      await receiptStore.scanReceipt(base64Content)
    }
    
    reader.readAsDataURL(file)
  }
}

function resetScan() {
  receiptStore.clearScannedItems()
}

function removeItem(index: number) {
  receiptStore.scannedItems.splice(index, 1)
  if (receiptStore.scannedItems.length === 0) {
    resetScan()
  }
}

async function addAllToFridge() {
  const items = receiptStore.scannedItems
  let successCount = 0
  
  for (const item of items) {
    const result = await fridgeStore.addItem({
      name: item.name,
      quantity: item.quantity,
      unit: 'pièce', // Default unit
      expirationDate: item.expirationDate,
      storageLocation: determineStorage(item.category),
    })
    
    if (result.success) successCount++
  }
  
  alert(`${successCount} articles ajoutés au frigo !`)
  resetScan()
  router.push('/fridge')
}

function addManually() {
  // Redirect to fridge with add mode open (can be implemented later or redirect to fridge)
  router.push('/fridge')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getCategoryEmoji(category?: string): string {
  if (!category) return '🥘'
  const lower = category.toLowerCase()
  if (lower.includes('légume') || lower.includes('fruit')) return '🥦'
  if (lower.includes('viande') || lower.includes('poisson')) return '🥩'
  if (lower.includes('lait') || lower.includes('fromage')) return '🧀'
  if (lower.includes('boisson')) return '🥤'
  if (lower.includes('dessert') || lower.includes('sucre')) return '🍪'
  if (lower.includes('pain') || lower.includes('boulangerie')) return '🥖'
  return '🥘'
}

function determineStorage(category?: string): 'fridge' | 'freezer' | 'pantry' {
  if (!category) return 'fridge'
  const lower = category.toLowerCase()
  if (lower.includes('conserve') || lower.includes('sec') || lower.includes('pâtes') || lower.includes('riz')) return 'pantry'
  if (lower.includes('surgelé') || lower.includes('glace')) return 'freezer'
  return 'fridge'
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
