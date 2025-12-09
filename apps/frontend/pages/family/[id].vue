<template>
  <div class="px-4 pt-4 pb-24">
    <!-- Header -->
    <header class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 bg-gray-100 rounded-xl">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ family?.name || 'Famille' }}</h1>
        <p class="text-gray-500 text-sm">Paramètres de la famille</p>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="family">
      <!-- Family Info Card -->
      <div class="card mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-3xl">
            👨‍👩‍👧‍👦
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-gray-900">{{ family.name }}</h2>
            <p class="text-sm text-gray-500">Créée le {{ formatDate(family.createdAt) }}</p>
          </div>
        </div>

        <!-- Invite Code -->
        <div class="bg-gray-50 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Code d'invitation</p>
              <p class="text-lg font-mono font-bold text-gray-900">{{ family.inviteCode }}</p>
            </div>
            <button 
              @click="copyInviteCode" 
              class="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
            >
              {{ copied ? '✓ Copié' : '📋 Copier' }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Partagez ce code pour inviter des membres</p>
        </div>
      </div>

      <!-- Members Section -->
      <section class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          👥 Membres ({{ members.length }})
        </h3>
        
        <div class="space-y-3">
          <div 
            v-for="member in members" 
            :key="member.id"
            class="card flex items-center gap-4"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-lg text-white font-bold">
              {{ getMemberInitials(member) }}
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">
                {{ member.user?.firstName }} {{ member.user?.lastName }}
                <span v-if="member.userId === family.ownerId" class="text-xs text-primary-600">(Propriétaire)</span>
              </h4>
              <p class="text-sm text-gray-500">{{ member.user?.email }}</p>
            </div>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="member.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ member.role === 'admin' ? 'Admin' : 'Membre' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="space-y-3">
        <button 
          v-if="isOwner"
          class="w-full card flex items-center gap-4 py-3 text-left"
        >
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            ✏️
          </div>
          <span class="flex-1 font-medium text-gray-900">Modifier le nom</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button 
          @click="handleLeaveFamily"
          class="w-full card flex items-center gap-4 py-3 text-left"
          :class="isOwner ? 'opacity-50' : ''"
          :disabled="isOwner"
        >
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            🚪
          </div>
          <div class="flex-1">
            <span class="font-medium text-red-600">Quitter la famille</span>
            <p v-if="isOwner" class="text-xs text-gray-500">Transférez d'abord la propriété</p>
          </div>
        </button>
      </section>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">😕</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Famille introuvable</h3>
      <NuxtLink to="/families" class="text-primary-600 font-medium">Retour aux familles</NuxtLink>
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
const config = useRuntimeConfig()

const isLoading = ref(true)
const family = ref<any>(null)
const members = ref<any[]>([])
const copied = ref(false)

const familyId = computed(() => Number(route.params.id))

const isOwner = computed(() => {
  return family.value?.ownerId === authStore.user?.id
})

function getMemberInitials(member: any) {
  if (member.user) {
    return `${member.user.firstName?.charAt(0) || ''}${member.user.lastName?.charAt(0) || ''}`.toUpperCase()
  }
  return '?'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function copyInviteCode() {
  if (family.value) {
    await navigator.clipboard.writeText(family.value.inviteCode)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

async function fetchFamilyDetails() {
  if (!authStore.token) return

  isLoading.value = true
  try {
    const response = await fetch(`${config.public.apiBase}/api/v1/families/${familyId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      family.value = data.family
      members.value = data.family.members || []
    }
  } catch (error) {
    console.error('Error fetching family details:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleLeaveFamily() {
  if (isOwner.value) return
  
  if (confirm('Êtes-vous sûr de vouloir quitter cette famille ?')) {
    const result = await familyStore.leaveFamily(familyId.value)
    if (result.success) {
      router.push('/families')
    }
  }
}

onMounted(async () => {
  authStore.init()
  
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  await fetchFamilyDetails()
})
</script>
