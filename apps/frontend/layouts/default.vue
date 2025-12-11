<template>
  <div class="min-h-screen bg-surface-50 pb-24">
    <slot />
    
    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <div class="flex justify-around items-center h-16">
        <NuxtLink to="/" class="bottom-nav-item group" active-class="active">
          <div class="relative p-1 transition-transform group-active:scale-95">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-[10px] font-medium mt-1 block text-center opacity-70 group-[.active]:opacity-100">Accueil</span>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/fridge" class="bottom-nav-item group" active-class="active">
          <div class="relative p-1 transition-transform group-active:scale-95">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="text-[10px] font-medium mt-1 block text-center opacity-70 group-[.active]:opacity-100">Frigo</span>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/scan" class="bottom-nav-item group" active-class="active">
          <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-3.5 -mt-8 shadow-glow ring-4 ring-surface-50 transition-transform group-active:scale-95">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-medium mt-1 block text-center opacity-70 group-[.active]:opacity-100">Scan</span>
        </NuxtLink>
        
        <NuxtLink to="/shopping" class="bottom-nav-item group" active-class="active">
          <div class="relative p-1 transition-transform group-active:scale-95">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-[10px] font-medium mt-1 block text-center opacity-70 group-[.active]:opacity-100">Courses</span>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/profile" class="bottom-nav-item group" active-class="active">
          <div class="relative p-1 transition-transform group-active:scale-95">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-[10px] font-medium mt-1 block text-center opacity-70 group-[.active]:opacity-100">Profil</span>
          </div>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
