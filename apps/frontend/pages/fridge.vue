<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mon Frigo</h1>
      <p class="text-gray-500">{{ familyStore.currentFamily?.name || 'Gérez votre inventaire' }}</p>
    </header>

    <!-- No Family Warning -->
    <div v-if="!familyStore.hasFamily" class="card mb-4 bg-yellow-50 border-yellow-200">
      <p class="text-yellow-800 text-sm">
        ⚠️ Vous devez d'abord créer ou rejoindre une famille.
      </p>
      <NuxtLink to="/family" class="text-primary-600 text-sm font-medium mt-2 inline-block">
        Gérer mes familles →
      </NuxtLink>
    </div>

    <!-- Storage Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        {{ tab.icon }} {{ tab.label }} ({{ getTabCount(tab.id) }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="fridgeStore.isLoading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement...</p>
    </div>

    <!-- Items List -->
    <div v-else class="space-y-3">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="card flex items-center gap-4"
        @click="openItemMenu(item)"
      >
        <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
          {{ item.emoji }}
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
          <p class="text-sm" :class="getExpirationClass(item.daysUntilExpiration)">
            {{ getExpirationText(item.daysUntilExpiration) }}
          </p>
        </div>
        <div class="text-right">
          <span class="text-sm font-medium text-gray-900">{{ item.quantity }}</span>
          <p class="text-xs text-gray-500">{{ item.unit || '' }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0 && !fridgeStore.isLoading" class="text-center py-12">
        <div class="text-6xl mb-4">🥡</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun article</h3>
        <p class="text-gray-500 mb-4">Ajoutez des articles à votre {{ activeTabLabel }}</p>
        <button @click="showAddModal = true" class="btn-primary">Ajouter un article</button>
      </div>
    </div>

    <!-- Add Button -->
    <button 
      v-if="familyStore.hasFamily"
      @click="showAddModal = true" 
      class="fixed bottom-24 right-4 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="showAddModal = false">
      <div class="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Ajouter un article</h2>
        
        <form @submit.prevent="handleAddItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input v-model="newItem.name" type="text" required class="input" placeholder="Ex: Lait" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input v-model.number="newItem.quantity" type="number" min="1" class="input" placeholder="1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <input v-model="newItem.unit" type="text" class="input" placeholder="L, kg, pcs..." />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
            <input v-model="newItem.expirationDate" type="date" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
            <select v-model="newItem.storageLocation" class="input">
              <option value="fridge">❄️ Frigo</option>
              <option value="freezer">🧊 Congélateur</option>
              <option value="pantry">🏠 Garde-manger</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showAddModal = false" class="flex-1 btn-outline">
              Annuler
            </button>
            <button type="submit" class="flex-1 btn-primary" :disabled="fridgeStore.isLoading">
              {{ fridgeStore.isLoading ? 'Ajout...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Item Action Modal -->
    <div v-if="selectedItem" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="selectedItem = null">
      <div class="bg-white w-full rounded-t-3xl p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
            {{ selectedItem.emoji }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedItem.name }}</h2>
            <p class="text-gray-500">{{ selectedItem.quantity }} {{ selectedItem.unit || '' }}</p>
          </div>
        </div>

        <!-- Edit quantity -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantité restante</label>
          <div class="flex gap-2 items-center">
            <input
              v-model.number="editQuantity"
              type="number"
              step="0.1"
              min="0"
              class="input flex-1"
            />
            <span class="text-sm text-gray-500 whitespace-nowrap">{{ selectedItem.unit || '' }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">Exemples : 4.5 L, 2 steaks restants…</p>
        </div>

        <!-- Edit expiration date -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de péremption</label>
          <input
            v-model="editExpirationDate"
            type="date"
            class="input"
          />
          <p class="text-xs text-gray-400 mt-1">Laisse vide si le produit n'a pas de date précise.</p>
        </div>

        <div class="space-y-3">
          <button @click="handleUpdateItem" class="w-full btn-primary py-3">
            💾 Mettre à jour
          </button>
          <button @click="handleConsumeItem" class="w-full btn-outline py-3">
            ✅ Marquer comme consommé
          </button>
          <button @click="handleDeleteItem" class="w-full btn-outline py-3 text-red-600 border-red-200">
            🗑️ Supprimer
          </button>
          <button @click="selectedItem = null" class="w-full btn-outline py-3">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useFridgeStore } from '~/stores/fridge'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const fridgeStore = useFridgeStore()
const router = useRouter()

const tabs = [
  { id: 'fridge' as const, label: 'Frigo', icon: '❄️' },
  { id: 'freezer' as const, label: 'Congélateur', icon: '🧊' },
  { id: 'pantry' as const, label: 'Garde-manger', icon: '🏠' },
]

const activeTab = ref<'fridge' | 'freezer' | 'pantry'>('fridge')
const showAddModal = ref(false)
const selectedItem = ref<any>(null)
const editQuantity = ref<number | null>(null)
const editExpirationDate = ref<string>('')

const newItem = reactive({
  name: '',
  quantity: 1,
  unit: '',
  expirationDate: '',
  storageLocation: 'fridge' as 'fridge' | 'freezer' | 'pantry',
})

const activeTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label || ''
})

const filteredItems = computed(() => {
  return fridgeStore.items.filter(item => item.storageLocation === activeTab.value)
})

function getTabCount(tabId: string) {
  return fridgeStore.items.filter(item => item.storageLocation === tabId).length
}

function getExpirationClass(days: number | null): string {
  if (days === null) return 'text-gray-500'
  if (days <= 2) return 'text-red-600'
  if (days <= 5) return 'text-orange-600'
  if (days <= 7) return 'text-yellow-600'
  return 'text-gray-500'
}

function getExpirationText(days: number | null): string {
  if (days === null) return 'Pas de date'
  if (days < 0) return 'Expiré'
  if (days === 0) return "Expire aujourd'hui"
  if (days === 1) return 'Expire demain'
  return `Expire dans ${days} jours`
}

function openItemMenu(item: any) {
  selectedItem.value = item
  editQuantity.value = item.quantity
  editExpirationDate.value = item.expirationDate || ''
}

async function handleAddItem() {
  const result = await fridgeStore.addItem({
    name: newItem.name,
    quantity: newItem.quantity,
    unit: newItem.unit || undefined,
    expirationDate: newItem.expirationDate || undefined,
    storageLocation: newItem.storageLocation,
  })

  if (result.success) {
    showAddModal.value = false
    // Reset form
    newItem.name = ''
    newItem.quantity = 1
    newItem.unit = ''
    newItem.expirationDate = ''
    newItem.storageLocation = 'fridge'
  }
}

async function handleConsumeItem() {
  if (selectedItem.value) {
    await fridgeStore.consumeItem(selectedItem.value.id)
    selectedItem.value = null
  }
}

async function handleDeleteItem() {
  if (selectedItem.value) {
    await fridgeStore.deleteItem(selectedItem.value.id)
    selectedItem.value = null
  }
}

async function handleUpdateItem() {
  if (!selectedItem.value || editQuantity.value === null) return

  const updates: any = {
    quantity: editQuantity.value,
  }

  if (editExpirationDate.value) {
    updates.expirationDate = editExpirationDate.value
  } else {
    // Permet d'effacer la date de péremption
    updates.expirationDate = null
  }

  const result = await fridgeStore.updateItem(selectedItem.value.id, updates)

  if (result.success && result.item) {
    selectedItem.value = result.item
  }
}

onMounted(async () => {
  authStore.init()
  
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await familyStore.fetchFamilies()
  familyStore.loadCurrentFamily()
  
  if (familyStore.currentFamilyId) {
    await fridgeStore.fetchItems()
  }
})

// Watch for family changes
watch(() => familyStore.currentFamilyId, async (newId) => {
  if (newId) {
    await fridgeStore.fetchItems()
  }
})
</script>
