<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-secondary-400/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-md mx-auto">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="text-6xl mb-4 inline-block drop-shadow-md">🚀</div>
        <h1 class="text-3xl font-bold mb-2 text-dark-900">
          Rejoindre <span class="text-gradient">FoodSync</span>
        </h1>
        <p class="text-gray-500 font-medium">Commencez à économiser dès aujourd'hui</p>
      </div>

      <!-- Register Form -->
      <div class="card backdrop-blur-sm bg-white/90">
        <h2 class="text-xl font-bold text-dark-900 mb-8 text-center">Créer un compte ✨</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 shadow-sm">
          <span class="text-xl">⚠️</span>
          {{ error }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="label">Prénom</label>
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
              <label for="lastName" class="label">Nom</label>
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
            <label for="password" class="label">Mot de passe</label>
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
            <label for="confirmPassword" class="label">Confirmer</label>
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
            class="w-full btn-primary py-4 mt-2 text-lg shadow-primary-500/30 hover:shadow-primary-500/50"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Création...
            </span>
            <span v-else>S'inscrire</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-500 text-sm font-medium">
            Déjà un compte ?
            <NuxtLink to="/login" class="text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Se connecter
            </NuxtLink>
          </p>
        </div>
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
