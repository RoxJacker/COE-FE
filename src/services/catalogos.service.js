import api from '@/services/api.js'

export const catalogosService = {
  async colonias(q = '') {
    const { data } = await api.get('/catalogos/colonias', { params: { q } })
    return data
  },

  async incidentes(params = {}) {
    const { data } = await api.get('/catalogos/incidentes', { params })
    return data
  },

  async categorias() {
    const { data } = await api.get('/catalogos/incidentes/categorias')
    return data
  },

  async dependencias(nivel) {
    const { data } = await api.get('/catalogos/dependencias', { params: { nivel } })
    return data
  },
}
