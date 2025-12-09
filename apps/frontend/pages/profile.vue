<template>
  <div class="px-4 pt-4 pb-24">
    <!-- Profile Header -->
    <div class="text-center mb-6">
      <div class="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold">
        {{ userInitials }}
      </div>
      <h1 class="text-xl font-bold text-gray-900">{{ authStore.user?.fullName || 'Utilisateur' }}</h1>
      <p class="text-gray-500">{{ authStore.user?.email || '' }}</p>
    </div>

    <!-- Current Family Card -->
    <NuxtLink to="/families" class="card mb-4 block">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
            <span class="text-xl">👨‍👩‍👧‍👦</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ familyStore.currentFamily?.name || 'Aucune famille' }}</h3>
            <p class="text-sm text-gray-500">
              {{ familyStore.hasFamily ? `${familyStore.families.length} famille(s)` : 'Créer ou rejoindre une famille' }}
            </p>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </NuxtLink>

    <!-- Menu Items -->
    <div class="space-y-2">
      <button class="card w-full flex items-center gap-4 py-3">
        <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span class="flex-1 text-left font-medium text-gray-900">Préférences</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button class="card w-full flex items-center gap-4 py-3">
        <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <span class="flex-1 text-left font-medium text-gray-900">Notifications</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button class="card w-full flex items-center gap-4 py-3">
        <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="flex-1 text-left font-medium text-gray-900">Statistiques</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button class="card w-full flex items-center gap-4 py-3">
        <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span class="flex-1 text-left font-medium text-gray-900">Recettes favorites</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button class="card w-full flex items-center gap-4 py-3">
        <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="flex-1 text-left font-medium text-gray-900">Aide & Support</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Logout Button -->
    <button @click="handleLogout" class="w-full mt-6 py-3 text-red-600 font-medium">
      Se déconnecter
    </button>

    <!-- Version -->
    <p class="text-center text-xs text-gray-400 mt-4">
      FoodSync v0.1.0
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const router = useRouter()

const userInitials = computed(() => {
  if (authStore.user) {
    return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`.toUpperCase()
  }
  return 'U'
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.init()
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>
