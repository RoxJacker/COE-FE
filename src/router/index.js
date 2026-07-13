import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Pública ─────────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { publica: true },
    },

    // ── Operador COE ─────────────────────────────────────────────────────────
    {
      path: '/operador',
      name: 'OperadorLayout',
      component: () => import('@/views/operador/OperadorLayout.vue'),
      meta: { roles: ['operador', 'admin'] },
      children: [
        {
          path: '',
          name: 'Emergencias',
          component: () => import('@/views/operador/EmergenciasView.vue'),
        },
        {
          path: 'mapa',
          name: 'Mapa',
          component: () => import('@/views/operador/MapaView.vue'),
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/operador/DashboardView.vue'),
        },
        {
          path: 'reportes',
          name: 'Reportes',
          component: () => import('@/views/operador/ReportesView.vue'),
        },
      ],
    },

    // ── Unidad en campo ──────────────────────────────────────────────────────
    {
      path: '/campo',
      name: 'CampoLayout',
      component: () => import('@/views/campo/CampoLayout.vue'),
      meta: { roles: ['campo'] },
      children: [
        {
          path: '',
          name: 'CampoInicio',
          component: () => import('@/views/campo/CampoView.vue'),
        },
      ],
    },

    // ── Redirecciones ────────────────────────────────────────────────────────
    {
      path: '/',
      redirect: () => {
        const auth = useAuthStore()
        if (!auth.estaAutenticado) return '/login'
        if (auth.esOperador) return '/operador'
        if (auth.esCampo) return '/campo'
        return '/login'
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ── Navigation Guard ─────────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Ruta pública: dejar pasar (si ya está autenticado, redirigir a su vista)
  if (to.meta.publica) {
    if (auth.estaAutenticado) {
      return next(auth.esOperador ? '/operador' : '/campo')
    }
    return next()
  }

  // Sin autenticación: al login
  if (!auth.estaAutenticado) {
    return next('/login')
  }

  // Verificar rol
  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    return next(auth.esOperador ? '/operador' : '/campo')
  }

  next()
})

export default router
