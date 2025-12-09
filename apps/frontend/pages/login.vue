<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col justify-center px-6 py-12">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="text-6xl mb-4">🍽️</div>
      <h1 class="text-3xl font-bold text-white">FoodSync</h1>
      <p class="text-primary-100 mt-2">Gérez votre frigo intelligemment</p>
    </div>

    <!-- Login Form -->
    <div class="card max-w-md mx-auto w-full">
      <h2 class="text-xl font-bold text-gray-900 mb-6 text-center">Connexion</h2>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
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
          class="w-full btn-primary py-3"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Pas encore de compte ?
          <NuxtLink to="/register" class="text-primary-600 font-medium hover:underline">
            S'inscrire
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Demo Info -->
    <div class="mt-8 text-center text-primary-100 text-sm">
      <p>Version prototype</p>
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
