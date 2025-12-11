<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-secondary-400/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-md mx-auto">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="text-7xl mb-4 animate-bounce hover:animate-spin cursor-pointer transition-all duration-500 inline-block drop-shadow-lg">🍽️</div>
        <h1 class="text-4xl font-bold mb-2 text-dark-900">
          Food<span class="text-gradient">Sync</span>
        </h1>
        <p class="text-gray-500 font-medium">Gérez votre frigo intelligemment</p>
      </div>

      <!-- Login Form -->
      <div class="card backdrop-blur-sm bg-white/90">
        <h2 class="text-xl font-bold text-dark-900 mb-8 text-center">Bon retour ! 👋</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 shadow-sm">
          <span class="text-xl">⚠️</span>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="email" class="label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="votre@email.com"
              autocomplete="email"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5 ml-1">
              <label for="password" class="block text-sm font-semibold text-gray-700">Mot de passe</label>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="w-full btn-primary py-4 mt-2 text-lg shadow-primary-500/30 hover:shadow-primary-500/50"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-500 text-sm font-medium">
            Pas encore de compte ?
            <NuxtLink to="/register" class="text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Créer un compte
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Demo Info -->
      <div class="mt-8 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20 shadow-sm text-xs font-medium text-gray-500">
          ✨ Version prototype v0.1.0
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const error = ref('')

async function handleLogin() {
  error.value = ''
  
  const result = await authStore.login(form.email, form.password)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }
}

// Redirect if already logged in
onMounted(() => {
  authStore.init()
  if (authStore.isLoggedIn) {
    router.push('/')
  }
})
</script>
