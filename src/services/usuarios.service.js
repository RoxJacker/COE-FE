import api from '@/services/api.js'

export const usuariosService = {
  async listar() {
    const { data } = await api.get('/usuarios')
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/usuarios/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/usuarios', payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/usuarios/${id}`, payload)
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`/usuarios/${id}`)
    return data
  }
}
