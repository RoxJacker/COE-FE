import api from '@/services/api.js'

export const unidadesService = {
  async listar(params = {}) {
    const { data } = await api.get('/unidades', { params })
    return data
  },

  async disponibles() {
    const { data } = await api.get('/unidades/disponibles')
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/unidades/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/unidades', payload)
    return data
  },

  async actualizarEstado(id, estado) {
    const { data } = await api.patch(`/unidades/${id}/estado`, { estado })
    return data
  },
}
