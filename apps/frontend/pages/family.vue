<template>
  <div class="px-4 pt-4 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Ma Famille</h1>
      <p class="text-gray-500">Gérez vos familles</p>
    </header>

    <!-- No Family State -->
    <div v-if="!familyStore.hasFamily && !showCreateForm && !showJoinForm" class="text-center py-12">
      <div class="text-6xl mb-4">👨‍👩‍👧‍👦</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Pas encore de famille</h3>
      <p class="text-gray-500 mb-6">Créez une famille ou rejoignez-en une existante</p>
      
      <div class="space-y-3">
        <button @click="showCreateForm = true" class="w-full btn-primary py-3">
          ➕ Créer une famille
        </button>
        <button @click="showJoinForm = true" class="w-full btn-outline py-3">
          🔗 Rejoindre une famille
        </button>
      </div>
    </div>

    <!-- Create Family Form -->
    <div v-if="showCreateForm" class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Créer une famille</h2>
      
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
          <button type="button" @click="showCreateForm = false" class="flex-1 btn-outline">
            Annuler
          </button>
          <button type="submit" class="flex-1 btn-primary" :disabled="familyStore.isLoading">
            {{ familyStore.isLoading ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Join Family Form -->
    <div v-if="showJoinForm" class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Rejoindre une famille</h2>
      
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
          <button type="button" @click="showJoinForm = false" class="flex-1 btn-outline">
            Annuler
          </button>
          <button type="submit" class="flex-1 btn-primary" :disabled="familyStore.isLoading">
            {{ familyStore.isLoading ? 'Connexion...' : 'Rejoindre' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Family List -->
    <div v-if="familyStore.hasFamily && !showCreateForm && !showJoinForm">
      <!-- Current Family Selector -->
      <div class="card mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Famille active</label>
        <select 
          v-model="selectedFamilyId" 
          @change="handleFamilyChange"
          class="input"
        >
          <option v-for="family in familyStore.families" :key="family.id" :value="family.id">
            {{ family.name }}
          </option>
        </select>
      </div>

      <!-- Current Family Details -->
      <div v-if="familyStore.currentFamily" class="card mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ familyStore.currentFamily.name }}</h2>
          <span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
            {{ familyStore.currentFamily.role || 'Membre' }}
          </span>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">Code d'invitation</span>
            <div class="flex items-center gap-2">
              <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {{ familyStore.currentFamily.inviteCode }}
              </code>
              <button @click="copyInviteCode" class="text-primary-600">
                📋
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button @click="showCreateForm = true" class="w-full btn-outline py-3">
          ➕ Créer une autre famille
        </button>
        <button @click="showJoinForm = true" class="w-full btn-outline py-3">
          🔗 Rejoindre une autre famille
        </button>
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

const showCreateForm = ref(false)
const showJoinForm = ref(false)
const error = ref('')
const selectedFamilyId = ref<number | null>(null)

const createForm = reactive({
  name: '',
})

const joinForm = reactive({
  inviteCode: '',
})

async function handleCreateFamily() {
  error.value = ''
  
  const result = await familyStore.createFamily(createForm.name)
  
  if (result.success) {
    showCreateForm.value = false
    createForm.name = ''
  } else {
    error.value = result.message
  }
}

async function handleJoinFamily() {
  error.value = ''
  
  const result = await familyStore.joinFamily(joinForm.inviteCode)
  
  if (result.success) {
    showJoinForm.value = false
    joinForm.inviteCode = ''
  } else {
    error.value = result.message
  }
}

function handleFamilyChange() {
  const family = familyStore.families.find(f => f.id === selectedFamilyId.value)
  if (family) {
    familyStore.setCurrentFamily(family)
  }
}

function copyInviteCode() {
  if (familyStore.currentFamily) {
    navigator.clipboard.writeText(familyStore.currentFamily.inviteCode)
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
  
  if (familyStore.currentFamily) {
    selectedFamilyId.value = familyStore.currentFamily.id
  }
})
</script>
