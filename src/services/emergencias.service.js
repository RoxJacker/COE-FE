import api from '@/services/api.js'

export const emergenciasService = {
  // Listar activas (para mapa y lista principal)
  async activas() {
    const { data } = await api.get('/emergencias/activas')
    return data
  },

  // Listar con filtros y paginación
  async listar(params = {}) {
    const { data } = await api.get('/emergencias', { params })
    return data
  },

  // Obtener una emergencia por ID
  async obtener(id) {
    const { data } = await api.get(`/emergencias/${id}`)
    return data
  },

  // Crear nueva emergencia
  async crear(payload) {
    const { data } = await api.post('/emergencias', payload)
    return data
  },

  // Actualizar emergencia
  async actualizar(id, payload) {
    const { data } = await api.put(`/emergencias/${id}`, payload)
    return data
  },

  // Asignar unidad
  async asignarUnidad(id, unidadId) {
    const { data } = await api.patch(`/emergencias/${id}/asignar`, { unidadId })
    return data
  },

  // Cambiar estado
  async cambiarEstado(id, estado) {
    const { data } = await api.patch(`/emergencias/${id}/estado`, { estado })
    return data
  },
}
