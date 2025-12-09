<template>
  <div class="px-4 pt-4 pb-24">
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Liste de courses</h1>
        <p class="text-gray-500">{{ familyStore.currentFamily?.name || '' }} - {{ shoppingStore.remainingCount }} articles restants</p>
      </div>
      <button 
        v-if="shoppingStore.purchasedItems.length > 0"
        @click="handleClearPurchased" 
        class="p-2 bg-gray-100 rounded-xl"
        title="Supprimer les articles achetés"
      >
        🗑️
      </button>
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

    <!-- Add Item Input -->
    <div v-if="familyStore.hasFamily" class="flex gap-2 mb-6">
      <input 
        v-model="newItemName"
        type="text" 
        placeholder="Ajouter un article..."
        class="input flex-1"
        @keyup.enter="handleAddItem"
      />
      <button @click="handleAddItem" class="btn-primary px-4" :disabled="shoppingStore.isLoading">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="shoppingStore.isLoading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement...</p>
    </div>

    <!-- Shopping List -->
    <div v-else class="space-y-2">
      <div 
        v-for="item in shoppingStore.items" 
        :key="item.id"
        class="card flex items-center gap-3 py-3"
        :class="item.isPurchased ? 'opacity-50' : ''"
      >
        <button 
          @click="handleToggleItem(item.id)"
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="item.isPurchased ? 'bg-primary-500 border-primary-500' : 'border-gray-300'"
        >
          <svg v-if="item.isPurchased" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        
        <div class="flex-1">
          <span 
            class="font-medium"
            :class="item.isPurchased ? 'line-through text-gray-400' : 'text-gray-900'"
          >
            {{ item.name }}
          </span>
          <span v-if="item.quantity > 1" class="text-sm text-gray-500 ml-2">
            x{{ item.quantity }}
          </span>
        </div>
        
        <span 
          v-if="item.priority === 'high'"
          class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full"
        >
          Urgent
        </span>
        
        <button @click="handleRemoveItem(item.id)" class="p-1 text-gray-400 hover:text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="shoppingStore.items.length === 0 && !shoppingStore.isLoading" class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Liste vide</h3>
        <p class="text-gray-500">Ajoutez des articles à votre liste de courses</p>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="shoppingStore.items.length > 0" class="card mt-6 bg-gray-50">
      <div class="flex justify-between items-center">
        <span class="text-gray-600">Progression</span>
        <span class="font-semibold text-gray-900">{{ shoppingStore.purchasedItems.length }}/{{ shoppingStore.items.length }}</span>
      </div>
      <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${shoppingStore.progressPercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useShoppingStore } from '~/stores/shopping'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const shoppingStore = useShoppingStore()
const router = useRouter()

const newItemName = ref('')

async function handleAddItem() {
  if (!newItemName.value.trim()) return
  
  const result = await shoppingStore.addItem({
    name: newItemName.value.trim(),
  })
  
  if (result.success) {
    newItemName.value = ''
  }
}

async function handleToggleItem(id: number) {
  await shoppingStore.toggleItem(id)
}

async function handleRemoveItem(id: number) {
  await shoppingStore.deleteItem(id)
}

async function handleClearPurchased() {
  await shoppingStore.clearPurchased()
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
    await shoppingStore.fetchItems()
  }
})

// Watch for family changes
watch(() => familyStore.currentFamilyId, async (newId) => {
  if (newId) {
    await shoppingStore.fetchItems()
  }
})
</script>
