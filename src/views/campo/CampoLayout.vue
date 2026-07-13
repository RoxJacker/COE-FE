<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useSocket } from '@/composables/useSocket.js'

const auth = useAuthStore()
const router = useRouter()
const { initSocket, disconnectSocket } = useSocket()

onMounted(() => {
  initSocket()
})

onUnmounted(() => {
  disconnectSocket()
})

const cerrarSesion = () => {
  auth.cerrarSesion()
  router.push('/login')
}

const nombreUnidad = computed(() => {
  return auth.usuario?.nombre || 'Unidad Móvil'
})
</script>

<template>
  <div class="campo-layout">
    <!-- Header móvil institucional -->
    <header class="campo-header">
      <div class="header-left">
        <div class="logo-circle">🚒</div>
        <div>
          <h2 class="header-title">{{ nombreUnidad }}</h2>
          <span class="header-subtitle">Unidad en Campo</span>
        </div>
      </div>
      <button class="btn-logout" @click="cerrarSesion" title="Cerrar sesión">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    </header>

    <!-- Contenedor de contenido móvil -->
    <main class="campo-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.campo-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  color: var(--texto);
  font-family: var(--fuente);
}

.campo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--borde);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-circle {
  font-size: 1.4rem;
}

.header-title {
  font-size: 0.95rem;
  margin: 0;
  font-weight: 700;
  color: var(--texto-blanco);
}

.header-subtitle {
  font-size: 0.72rem;
  color: var(--texto-muted);
}

.btn-logout {
  background: none;
  border: none;
  color: var(--texto-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all var(--trans);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.campo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
}
</style>
