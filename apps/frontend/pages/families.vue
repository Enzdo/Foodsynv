<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mes Familles</h1>
      <p class="text-gray-500">Sélectionnez une famille pour continuer</p>
    </header>

    <!-- Loading State -->
    <div v-if="familyStore.isLoading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement...</p>
    </div>

    <!-- No Family State -->
    <div v-else-if="!familyStore.hasFamily" class="text-center py-12">
      <div class="text-6xl mb-4">👨‍👩‍👧‍👦</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Pas encore de famille</h3>
      <p class="text-gray-500 mb-6">Créez une famille ou rejoignez-en une existante</p>
      
      <div class="space-y-3">
        <button @click="showCreateModal = true" class="w-full btn-primary py-3">
          ➕ Créer une famille
        </button>
        <button @click="showJoinModal = true" class="w-full btn-outline py-3">
          🔗 Rejoindre une famille
        </button>
      </div>
    </div>

    <!-- Family List -->
    <div v-else class="space-y-4">
      <div 
        v-for="family in familyStore.families" 
        :key="family.id"
        class="card"
        :class="familyStore.currentFamily?.id === family.id ? 'ring-2 ring-primary-500' : ''"
      >
        <div class="flex items-center gap-4">
          <div 
            @click="selectFamily(family)"
            class="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-2xl cursor-pointer"
          >
            👨‍👩‍👧‍👦
          </div>
          <div @click="selectFamily(family)" class="flex-1 cursor-pointer">
            <h3 class="font-semibold text-gray-900">{{ family.name }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{{ family.role }}</span>
              <span>•</span>
              <span>Code: {{ family.inviteCode }}</span>
            </div>
          </div>
          <div v-if="familyStore.currentFamily?.id === family.id" class="text-primary-500 mr-2">
            ✓
          </div>
          <NuxtLink 
            :to="`/family/${family.id}`" 
            class="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            title="Paramètres"
          >
            ⚙️
          </NuxtLink>
        </div>
      </div>

      <!-- Add Family Buttons -->
      <div class="pt-4 border-t border-gray-200 space-y-3">
        <button @click="showCreateModal = true" class="w-full btn-outline py-3">
          ➕ Créer une nouvelle famille
        </button>
        <button @click="showJoinModal = true" class="w-full btn-outline py-3">
          🔗 Rejoindre une autre famille
        </button>
      </div>
    </div>

    <!-- Create Family Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="showCreateModal = false">
      <div class="bg-white w-full rounded-t-3xl p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Créer une famille</h2>
        
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleCreateFamily" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la famille</label>
            <input
              v-model="createForm.name"
              type="text"
              required
              class="input"
              placeholder="Ex: Famille Dupont"
            />
          </div>

          <div class="flex gap-3">
            <button type="button" @click="showCreateModal = false" class="flex-1 btn-outline">
              Annuler
            </button>
            <button type="submit" class="flex-1 btn-primary" :disabled="familyStore.isLoading">
              {{ familyStore.isLoading ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Family Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="showJoinModal = false">
      <div class="bg-white w-full rounded-t-3xl p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Rejoindre une famille</h2>
        
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleJoinFamily" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code d'invitation</label>
            <input
              v-model="joinForm.inviteCode"
              type="text"
              required
              class="input text-center text-lg tracking-widest uppercase"
              placeholder="ABCD1234"
              maxlength="8"
            />
            <p class="text-xs text-gray-500 mt-1">Demandez le code à un membre de la famille</p>
          </div>

          <div class="flex gap-3">
            <button type="button" @click="showJoinModal = false" class="flex-1 btn-outline">
              Annuler
            </button>
            <button type="submit" class="flex-1 btn-primary" :disabled="familyStore.isLoading">
              {{ familyStore.isLoading ? 'Connexion...' : 'Rejoindre' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const router = useRouter()
const route = useRoute()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const error = ref('')

const createForm = reactive({ name: '' })
const joinForm = reactive({ inviteCode: '' })

// Get redirect destination from query
const redirectTo = computed(() => (route.query.redirect as string) || '/')

function selectFamily(family: any) {
  familyStore.setCurrentFamily(family)
  router.push(redirectTo.value)
}

async function handleCreateFamily() {
  error.value = ''
  const result = await familyStore.createFamily(createForm.name)
  
  if (result.success) {
    showCreateModal.value = false
    createForm.name = ''
    // Auto-select the new family and redirect
    if (result.family) {
      router.push(redirectTo.value)
    }
  } else {
    error.value = result.message
  }
}

async function handleJoinFamily() {
  error.value = ''
  const result = await familyStore.joinFamily(joinForm.inviteCode)
  
  if (result.success) {
    showJoinModal.value = false
    joinForm.inviteCode = ''
    // Auto-select the joined family and redirect
    if (result.family) {
      router.push(redirectTo.value)
    }
  } else {
    error.value = result.message
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
})
</script>
