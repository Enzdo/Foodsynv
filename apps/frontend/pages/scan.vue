<template>
  <div class="px-4 pt-4">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Scanner</h1>
      <p class="text-gray-500">Ajoutez des articles rapidement</p>
    </header>

    <!-- Scan Options -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <button 
        @click="selectedMode = 'fridge'"
        class="card text-center py-6 transition-all"
        :class="selectedMode === 'fridge' ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
      >
        <div class="text-4xl mb-2">📷</div>
        <h3 class="font-semibold text-gray-900">Photo du frigo</h3>
        <p class="text-xs text-gray-500 mt-1">IA détecte les aliments</p>
      </button>
      
      <button 
        @click="selectedMode = 'receipt'"
        class="card text-center py-6 transition-all"
        :class="selectedMode === 'receipt' ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
      >
        <div class="text-4xl mb-2">🧾</div>
        <h3 class="font-semibold text-gray-900">Ticket de caisse</h3>
        <p class="text-xs text-gray-500 mt-1">OCR automatique</p>
      </button>
      
      <button 
        @click="selectedMode = 'barcode'"
        class="card text-center py-6 transition-all"
        :class="selectedMode === 'barcode' ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
      >
        <div class="text-4xl mb-2">📊</div>
        <h3 class="font-semibold text-gray-900">Code-barres</h3>
        <p class="text-xs text-gray-500 mt-1">Scan produit</p>
      </button>
      
      <button 
        @click="selectedMode = 'manual'"
        class="card text-center py-6 transition-all"
        :class="selectedMode === 'manual' ? 'ring-2 ring-primary-500 bg-primary-50' : ''"
      >
        <div class="text-4xl mb-2">✏️</div>
        <h3 class="font-semibold text-gray-900">Ajout manuel</h3>
        <p class="text-xs text-gray-500 mt-1">Saisie directe</p>
      </button>
    </div>

    <!-- Action Button -->
    <button 
      @click="startScan"
      class="w-full btn-primary py-4 text-lg"
      :disabled="!selectedMode"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {{ buttonText }}
    </button>

    <!-- Info Card -->
    <div class="card mt-6 bg-primary-50 border-primary-200">
      <div class="flex gap-3">
        <div class="text-2xl">💡</div>
        <div>
          <h4 class="font-medium text-primary-900">Astuce</h4>
          <p class="text-sm text-primary-700 mt-1">
            Pour de meilleurs résultats, assurez-vous que la photo est bien éclairée et que les produits sont visibles.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ScanMode = 'fridge' | 'receipt' | 'barcode' | 'manual' | null

const selectedMode = ref<ScanMode>(null)

const buttonText = computed(() => {
  switch (selectedMode.value) {
    case 'fridge': return 'Photographier le frigo'
    case 'receipt': return 'Scanner le ticket'
    case 'barcode': return 'Scanner le code-barres'
    case 'manual': return 'Ajouter manuellement'
    default: return 'Sélectionnez une option'
  }
})

function startScan() {
  if (!selectedMode.value) return
  
  // TODO: Implement actual scanning logic with Capacitor Camera
  console.log('Starting scan mode:', selectedMode.value)
  alert(`Mode ${selectedMode.value} - Fonctionnalité à implémenter`)
}
</script>
