<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col justify-center px-6 py-12">
    <!-- Logo -->
    <div class="text-center mb-6">
      <div class="text-5xl mb-3">🍽️</div>
      <h1 class="text-2xl font-bold text-white">FoodSync</h1>
    </div>

    <!-- Register Form -->
    <div class="card max-w-md mx-auto w-full">
      <h2 class="text-xl font-bold text-gray-900 mb-6 text-center">Créer un compte</h2>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="input"
              placeholder="Jean"
              autocomplete="given-name"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="input"
              placeholder="Dupont"
              autocomplete="family-name"
            />
          </div>
        </div>

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
            minlength="8"
            class="input"
            placeholder="Minimum 8 caractères"
            autocomplete="new-password"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="input"
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </div>

        <button
          type="submit"
          class="w-full btn-primary py-3"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading">Inscription en cours...</span>
          <span v-else>S'inscrire</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary-600 font-medium hover:underline">
            Se connecter
          </NuxtLink>
        </p>
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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const error = ref('')

async function handleRegister() {
  error.value = ''
  
  // Validate passwords match
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  // Validate password length
  if (form.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  
  const result = await authStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
  })
  
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
