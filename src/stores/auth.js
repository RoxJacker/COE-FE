import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ─────────────────────────────────────────────────────────────────
  const token = ref(localStorage.getItem('coe_token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('coe_usuario') || 'null'))
  const cargando = ref(false)
  const error = ref(null)

  // ── Getters ────────────────────────────────────────────────────────────────
  const estaAutenticado = computed(() => !!token.value)
  const rol = computed(() => usuario.value?.rol || null)
  const esOperador = computed(() => ['operador', 'admin'].includes(rol.value))
  const esCampo = computed(() => rol.value === 'campo')
  const esAdmin = computed(() => rol.value === 'admin')

  // ── Acciones ───────────────────────────────────────────────────────────────
  const iniciarSesion = async (email, password) => {
    cargando.value = true
    error.value = null
    try {
      const { data } = await api.post('/auth/login', { email, password })
      token.value = data.token
      usuario.value = data.usuario
      localStorage.setItem('coe_token', data.token)
      localStorage.setItem('coe_usuario', JSON.stringify(data.usuario))
      return { exito: true, rol: data.usuario.rol }
    } catch (err) {
      error.value = err.response?.data?.mensaje || 'Error al iniciar sesión'
      return { exito: false, error: error.value }
    } finally {
      cargando.value = false
    }
  }

  const cerrarSesion = () => {
    token.value = null
    usuario.value = null
    error.value = null
    localStorage.removeItem('coe_token')
    localStorage.removeItem('coe_usuario')
  }

  const limpiarError = () => {
    error.value = null
  }

  return {
    token,
    usuario,
    cargando,
    error,
    estaAutenticado,
    rol,
    esOperador,
    esCampo,
    esAdmin,
    iniciarSesion,
    cerrarSesion,
    limpiarError,
  }
})
