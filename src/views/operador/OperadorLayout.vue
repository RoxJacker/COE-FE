<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useEmergenciasStore } from '@/stores/emergencias.js'
import { useSocket } from '@/composables/useSocket.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const emergenciasStore = useEmergenciasStore()

const { initSocket, disconnectSocket } = useSocket()

const horaActual = ref(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }))
let interval = null

onMounted(() => {
  initSocket()
  interval = setInterval(() => {
    horaActual.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  disconnectSocket()
  if (interval) clearInterval(interval)
})

const turnoActual = computed(() => {
  const h = new Date().getHours()
  if (h >= 6 && h < 14) return 'matutino'
  if (h >= 14 && h < 22) return 'vespertino'
  return 'nocturno'
})

const turnoLabel = computed(() => ({
  matutino: 'Turno matutino',
  vespertino: 'Turno vespertino',
  nocturno: 'Turno nocturno',
}[turnoActual.value]))

const tituloModulo = computed(() => {
  if (route.path === '/operador') return 'COE Zapopan'
  if (route.path.startsWith('/operador/mapa')) return 'Mapa Operativo'
  if (route.path.startsWith('/operador/dashboard')) return 'Dashboard Táctico'
  if (route.path.startsWith('/operador/reportes')) return 'Auditoría y Exportación'
  if (route.path.startsWith('/operador/admin')) return 'Administración de Recursos'
  return 'COE Zapopan'
})

const subtituloModulo = computed(() => {
  if (route.path === '/operador') return 'Emergencias activas'
  if (route.path.startsWith('/operador/admin')) return 'Catálogo de Operadores y Unidades'
  return 'COE Zapopan'
})

const inicialNombre = computed(() =>
  auth.usuario?.nombre?.charAt(0)?.toUpperCase() || 'U'
)

const navItems = computed(() => {
  const items = [
    { ruta: '/operador', nombre: 'Emergencias', icono: 'alerta' },
    { ruta: '/operador/mapa', nombre: 'Mapa', icono: 'mapa' },
    { ruta: '/operador/dashboard', nombre: 'Dashboard', icono: 'dashboard' },
    { ruta: '/operador/reportes', nombre: 'Reportes', icono: 'reportes' },
  ]
  if (auth.esAdmin) {
    items.push({ ruta: '/operador/admin', nombre: 'Administración', icono: 'admin' })
  }
  return items
})

const esActivo = (ruta) => {
  if (ruta === '/operador') return route.path === '/operador'
  return route.path.startsWith(ruta)
}

const cerrarSesion = () => {
  auth.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="layout-operador">
    <!-- ── Sidebar ────────────────────────────────────────────── -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icono-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.ruta"
          :to="item.ruta"
          class="nav-item"
          :class="{ activo: esActivo(item.ruta) }"
          :title="item.nombre"
        >
          <!-- Iconos SVG inline -->
          <svg v-if="item.icono === 'alerta'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <svg v-if="item.icono === 'mapa'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <svg v-if="item.icono === 'dashboard'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <svg v-if="item.icono === 'reportes'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <svg v-if="item.icono === 'admin'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.557 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.557 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </router-link>
      </nav>

      <!-- Cerrar sesión -->
      <div class="sidebar-footer">
        <button class="nav-item" @click="cerrarSesion" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- ── Contenido principal ─────────────────────────────────── -->
    <div class="layout-principal">
      <!-- Header -->
      <header class="header-operador">
        <div class="header-izq">
          <div class="logo-icono-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </div>
          <div>
            <h3 class="header-titulo">{{ tituloModulo }}</h3>
            <span class="texto-xs texto-muted">{{ subtituloModulo }}</span>
          </div>
        </div>
        <div class="header-der">
          <span class="turno-badge">
            <span class="dot dot-verde"></span>
            {{ turnoLabel }}
          </span>
          <span class="header-hora">{{ horaActual }}</span>
          <div class="avatar" :title="auth.usuario?.nombre">{{ inicialNombre }}</div>
        </div>
      </header>

      <!-- Contenido -->
      <main class="contenido-principal">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-operador {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* ── Sidebar ─────────────────────────────────────────────── */
.sidebar {
  width: 60px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--borde);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  flex-shrink: 0;
}

.sidebar-logo {
  margin-bottom: 20px;
  padding: 8px 0;
}

.logo-icono-sm {
  width: 36px;
  height: 36px;
  background: var(--rojo);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--texto-dim);
  text-decoration: none;
  transition: all var(--trans);
  cursor: pointer;
  background: none;
  border: none;
}
.nav-item:hover {
  color: var(--texto-blanco);
  background: var(--bg-card);
}
.nav-item.activo {
  color: var(--rojo);
  background: var(--rojo-suave);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 12px;
}

/* ── Layout principal ────────────────────────────────────── */
.layout-principal {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────────── */
.header-operador {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(23, 17, 17, 0.85); /* Transparent tactical color */
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--borde);
  flex-shrink: 0;
  z-index: 10;
}

.header-izq {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icono-header {
  width: 32px;
  height: 32px;
  background: var(--rojo);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.header-titulo {
  margin: 0;
  font-size: 1rem;
}

.header-der {
  display: flex;
  align-items: center;
  gap: 16px;
}

.turno-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--texto-muted);
  background: var(--bg-card);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--borde);
}

.header-hora {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--texto);
  font-variant-numeric: tabular-nums;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--maroon);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: default;
}

/* ── Contenido ───────────────────────────────────────────── */
.contenido-principal {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
