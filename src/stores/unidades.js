import { defineStore } from 'pinia'
import { ref } from 'vue'
import { unidadesService } from '@/services/unidades.service.js'

export const useUnidadesStore = defineStore('unidades', () => {
  const unidades = ref([])
  const cargando = ref(false)
  const error = ref(null)

  const cargarUnidades = async () => {
    cargando.value = true
    error.value = null
    try {
      unidades.value = await unidadesService.listar()
    } catch (err) {
      error.value = err.response?.data?.mensaje || 'Error al cargar unidades'
    } finally {
      cargando.value = false
    }
  }

  const actualizarUbicacion = (unidadId, lat, lng) => {
    const unidad = unidades.value.find((u) => u._id === unidadId)
    if (unidad) {
      if (!unidad.ultimaUbicacion) {
        unidad.ultimaUbicacion = { lat, lng }
      } else {
        unidad.ultimaUbicacion.lat = lat
        unidad.ultimaUbicacion.lng = lng
      }
      unidad.ultimaUbicacion.actualizadoEn = new Date()
    }
  }

  const actualizarEstado = (unidadId, estado) => {
    const unidad = unidades.value.find((u) => u._id === unidadId)
    if (unidad) {
      unidad.estado = estado
    }
  }

  return {
    unidades,
    cargando,
    error,
    cargarUnidades,
    actualizarUbicacion,
    actualizarEstado,
  }
})
