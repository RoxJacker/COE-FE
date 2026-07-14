<script setup>
import { ref, onMounted, computed } from 'vue'
import { usuariosService } from '@/services/usuarios.service.js'
import { unidadesService } from '@/services/unidades.service.js'

// Estado
const pestañaActiva = ref('operadores') // 'operadores' o 'unidades'
const usuarios = ref([])
const unidades = ref([])
const cargando = ref(false)
const error = ref('')
const exitoMsg = ref('')

// Modales
const mostrarModalUsuario = ref(false)
const mostrarModalUnidad = ref(false)
const editandoId = ref(null)

// Formularios
const formUsuario = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'operador',
  unidadAsignada: ''
})

const formUnidad = ref({
  nombre: '',
  tipo: 'Ambulancia',
  base: 'Base 1 - Zapopan Centro',
  turno: 'matutino',
  responsable: ''
})

// Cargar datos
const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const [resUsuarios, resUnidades] = await Promise.all([
      usuariosService.listar(),
      unidadesService.listar()
    ])
    usuarios.value = resUsuarios
    unidades.value = resUnidades
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar los datos del servidor'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})

// === Operadores CRUD ===
const abrirCrearUsuario = () => {
  editandoId.value = null
  formUsuario.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'operador',
    unidadAsignada: ''
  }
  mostrarModalUsuario.value = true
}

const abrirEditarUsuario = (user) => {
  editandoId.value = user._id
  formUsuario.value = {
    nombre: user.nombre,
    email: user.email,
    password: '', // Dejar vacío a menos que se quiera cambiar
    rol: user.rol,
    unidadAsignada: user.unidadAsignada?._id || user.unidadAsignada || ''
  }
  mostrarModalUsuario.value = true
}

const guardarUsuario = async () => {
  error.value = ''
  exitoMsg.value = ''
  
  if (!formUsuario.value.nombre || !formUsuario.value.email || (!editandoId.value && !formUsuario.value.password)) {
    error.value = 'Por favor completa todos los campos obligatorios.'
    return
  }

  try {
    const payload = { ...formUsuario.value }
    if (!payload.unidadAsignada) delete payload.unidadAsignada
    if (editandoId.value && !payload.password) delete payload.password // No cambiar contraseña si se deja vacía

    if (editandoId.value) {
      await usuariosService.actualizar(editandoId.value, payload)
      exitoMsg.value = 'Usuario actualizado correctamente'
    } else {
      await usuariosService.crear(payload)
      exitoMsg.value = 'Usuario registrado correctamente'
    }
    
    mostrarModalUsuario.value = false
    await cargarDatos()
    setTimeout(() => { exitoMsg.value = '' }, 4000)
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar el usuario'
  }
}

const eliminarUsuario = async (id) => {
  if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) return
  error.value = ''
  exitoMsg.value = ''
  try {
    await usuariosService.eliminar(id)
    exitoMsg.value = 'Usuario desactivado'
    await cargarDatos()
    setTimeout(() => { exitoMsg.value = '' }, 4000)
  } catch (err) {
    error.value = 'Error al desactivar el usuario'
  }
}

// === Unidades CRUD ===
const abrirCrearUnidad = () => {
  editandoId.value = null
  formUnidad.value = {
    nombre: '',
    tipo: 'Ambulancia',
    base: 'Base 1 - Zapopan Centro',
    turno: 'matutino',
    responsable: ''
  }
  mostrarModalUnidad.value = true
}

const abrirEditarUnidad = (uni) => {
  editandoId.value = uni._id
  formUnidad.value = {
    nombre: uni.nombre,
    tipo: uni.tipo,
    base: uni.base,
    turno: uni.turno,
    responsable: uni.responsable || ''
  }
  mostrarModalUnidad.value = true
}

const guardarUnidad = async () => {
  error.value = ''
  exitoMsg.value = ''

  if (!formUnidad.value.nombre || !formUnidad.value.tipo || !formUnidad.value.base) {
    error.value = 'Por favor completa los campos obligatorios de la unidad.'
    return
  }

  try {
    if (editandoId.value) {
      await unidadesService.actualizar(editandoId.value, formUnidad.value)
      exitoMsg.value = 'Unidad actualizada correctamente'
    } else {
      await unidadesService.crear(formUnidad.value)
      exitoMsg.value = 'Unidad registrada correctamente'
    }
    mostrarModalUnidad.value = false
    await cargarDatos()
    setTimeout(() => { exitoMsg.value = '' }, 4000)
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar la unidad'
  }
}

const eliminarUnidad = async (id) => {
  if (!confirm('¿Estás seguro de que deseas desactivar esta unidad?')) return
  error.value = ''
  exitoMsg.value = ''
  try {
    await unidadesService.eliminar(id)
    exitoMsg.value = 'Unidad desactivada'
    await cargarDatos()
    setTimeout(() => { exitoMsg.value = '' }, 4000)
  } catch (err) {
    error.value = 'Error al desactivar la unidad'
  }
}

// Catálogos estáticos de apoyo
const tiposUnidad = ['Bomba', 'Ambulancia', 'Rescate', 'Pipas', 'Mando']
const basesList = [
  'Base 1 - Zapopan Centro',
  'Base 2 - Tesistán',
  'Base 3 - Guadalupe',
  'Base 4 - Federalismo'
]
</script>

<template>
  <div class="admin-view p-6 fade-in">
    <!-- Header de Módulo -->
    <div class="header-section mb-6">
      <div class="header-text">
        <h1 class="page-title">Administración y Catálogos</h1>
        <p class="page-subtitle">Alta, edición y desactivación de personal operativo y flota táctica en campo del COE.</p>
      </div>
      
      <!-- Alertas Rápidas -->
      <div class="header-actions">
        <div v-if="exitoMsg" class="toast-mini toast-exito">{{ exitoMsg }}</div>
        <div v-if="error" class="toast-mini toast-error">{{ error }}</div>
      </div>
    </div>

    <!-- Pestañas de Control -->
    <div class="controls-bar mb-6">
      <div class="tabs-container">
        <button 
          class="tab-btn" 
          :class="{ active: pestañaActiva === 'operadores' }" 
          @click="pestañaActiva = 'operadores'"
        >
          👤 OPERADORES
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: pestañaActiva === 'unidades' }" 
          @click="pestañaActiva = 'unidades'"
        >
          🚒 UNIDADES EN CAMPO
        </button>
      </div>

      <button 
        v-if="pestañaActiva === 'operadores'" 
        class="btn btn-red" 
        @click="abrirCrearUsuario"
      >
        ✚ REGISTRAR OPERADOR
      </button>
      <button 
        v-else 
        class="btn btn-red" 
        @click="abrirCrearUnidad"
      >
        ✚ REGISTRAR UNIDAD
      </button>
    </div>

    <!-- Spinner -->
    <div v-if="cargando" class="flex-center py-12">
      <div class="spinner-tactical"></div>
    </div>

    <div v-else class="main-panel">
      <!-- 1. Tabla de Operadores -->
      <div v-if="pestañaActiva === 'operadores'" class="table-container">
        <table class="a-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email de acceso</th>
              <th>Rol / Permisos</th>
              <th>Unidad asignada</th>
              <th>Estatus</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuarios" :key="user._id">
              <td class="font-bold text-white">{{ user.nombre }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="rol-badge" :class="user.rol">{{ user.rol.toUpperCase() }}</span>
              </td>
              <td>
                <span v-if="user.unidadAsignada" class="text-white">
                  {{ user.unidadAsignada.nombre || user.unidadAsignada }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span class="chip chip-green" v-if="user.activo">ACTIVO</span>
                <span class="chip chip-gray" v-else>INACTIVO</span>
              </td>
              <td class="text-right">
                <div class="actions-cell">
                  <button class="action-btn" title="Editar" @click="abrirEditarUsuario(user)">
                    ✏️
                  </button>
                  <button class="action-btn text-red-hover" title="Desactivar" @click="eliminarUsuario(user._id)">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="6" class="text-center py-12 text-muted">No hay operadores registrados en el sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. Tabla de Unidades -->
      <div v-else class="table-container">
        <table class="a-table">
          <thead>
            <tr>
              <th>Nombre de Unidad</th>
              <th>Tipo de Recurso</th>
              <th>Base operativa</th>
              <th>Turno</th>
              <th>Líder / Responsable</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="uni in unidades" :key="uni._id">
              <td class="font-bold text-white">{{ uni.nombre }}</td>
              <td>{{ uni.tipo }}</td>
              <td>{{ uni.base }}</td>
              <td class="uppercase text-muted">{{ uni.turno }}</td>
              <td>{{ uni.responsable || 'Sin asignar' }}</td>
              <td>
                <span class="status-chip">
                  <span class="dot" :class="'dot-' + (uni.estado === 'disponible' ? 'verde' : uni.estado === 'en_camino' ? 'amarillo' : 'rojo')"></span>
                  {{ uni.estado.toUpperCase().replace('_', ' ') }}
                </span>
              </td>
              <td class="text-right">
                <div class="actions-cell">
                  <button class="action-btn" title="Editar" @click="abrirEditarUnidad(uni)">
                    ✏️
                  </button>
                  <button class="action-btn text-red-hover" title="Desactivar" @click="eliminarUnidad(uni._id)">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="unidades.length === 0">
              <td colspan="7" class="text-center py-12 text-muted">No hay unidades en campo registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Usuario -->
    <div v-if="mostrarModalUsuario" class="overlay" @click.self="mostrarModalUsuario = false">
      <div class="modal-card blur-effect">
        <div class="panel-header">
          <h4>{{ editandoId ? 'Editar Operador' : 'Registrar Operador' }}</h4>
          <button class="btn-icono" @click="mostrarModalUsuario = false">✕</button>
        </div>

        <form @submit.prevent="guardarUsuario" class="form-emergencia">
          <div class="form-campo">
            <label class="form-label">Nombre Completo *</label>
            <input class="input" v-model="formUsuario.nombre" placeholder="Ej. Comandante José García" />
          </div>

          <div class="form-campo">
            <label class="form-label">Correo Electrónico *</label>
            <input class="input" type="email" v-model="formUsuario.email" placeholder="operador@coe.zapopan.gob.mx" />
          </div>

          <div class="form-campo">
            <label class="form-label">Contraseña {{ editandoId ? '(dejar vacío para no cambiar)' : '*' }}</label>
            <input class="input" type="password" v-model="formUsuario.password" placeholder="Contraseña de acceso" />
          </div>

          <div class="form-campo">
            <label class="form-label">Rol / Permisos *</label>
            <select class="input" v-model="formUsuario.rol">
              <option value="operador">Operador (C5 Central)</option>
              <option value="campo">Personal de Campo (Brigadas/Paramédicos)</option>
              <option value="admin">Administrador (Permisos CRUD completos)</option>
            </select>
          </div>

          <div v-if="formUsuario.rol === 'campo'" class="form-campo">
            <label class="form-label">Unidad Física Asignada</label>
            <select class="input" v-model="formUsuario.unidadAsignada">
              <option value="">Ninguna unidad</option>
              <option v-for="uni in unidades" :key="uni._id" :value="uni._id">
                {{ uni.nombre }} ({{ uni.tipo }})
              </option>
            </select>
          </div>

          <div class="form-acciones mt-4">
            <button type="button" class="btn btn-ghost" @click="mostrarModalUsuario = false">Cancelar</button>
            <button type="submit" class="btn btn-primario">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Unidad -->
    <div v-if="mostrarModalUnidad" class="overlay" @click.self="mostrarModalUnidad = false">
      <div class="modal-card blur-effect">
        <div class="panel-header">
          <h4>{{ editandoId ? 'Editar Unidad' : 'Registrar Unidad en Campo' }}</h4>
          <button class="btn-icono" @click="mostrarModalUnidad = false">✕</button>
        </div>

        <form @submit.prevent="guardarUnidad" class="form-emergencia">
          <div class="form-campo">
            <label class="form-label">Nombre de Unidad (ID Único) *</label>
            <input class="input" v-model="formUnidad.nombre" placeholder="Ej. Ambulancia 3, Bomba 2" />
          </div>

          <div class="form-campo">
            <label class="form-label">Tipo de Recurso *</label>
            <select class="input" v-model="formUnidad.tipo">
              <option v-for="t in tiposUnidad" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="form-campo">
            <label class="form-label">Base de Adscripción *</label>
            <select class="input" v-model="formUnidad.base">
              <option v-for="b in basesList" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <div class="form-campo">
            <label class="form-label">Turno *</label>
            <select class="input" v-model="formUnidad.turno">
              <option value="matutino">Matutino (06:00 - 14:00)</option>
              <option value="vespertino">Vespertino (14:00 - 22:00)</option>
              <option value="nocturno">Nocturno (22:00 - 06:00)</option>
            </select>
          </div>

          <div class="form-campo">
            <label class="form-label">Oficial Responsable / Líder</label>
            <input class="input" v-model="formUnidad.responsable" placeholder="Ej. Cmdt. Ernesto Torres" />
          </div>

          <div class="form-acciones mt-4">
            <button type="button" class="btn btn-ghost" @click="mostrarModalUnidad = false">Cancelar</button>
            <button type="submit" class="btn btn-primario">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  background-color: #0d0a0a;
  min-height: 100vh;
  color: #e5e7eb;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-title {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-bottom: 8px;
}
.page-subtitle {
  font-size: 0.9rem;
  color: #d32f2f;
  max-width: 600px;
}

.toast-mini {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  animation: fadeIn 0.2s ease;
}
.toast-exito {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.toast-error {
  background-color: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

/* Controles */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tabs-container {
  display: flex;
  background-color: #1a1212;
  border-radius: 6px;
  padding: 4px;
  border: 1px solid #2d1f1f;
}
.tab-btn {
  background: transparent;
  color: #9ca3af;
  border: none;
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { color: #ffffff; }
.tab-btn.active {
  background-color: #d32f2f;
  color: #ffffff;
}

.btn-red {
  background-color: #d32f2f;
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.4);
  font-weight: 800;
  padding: 10px 20px;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 0.5px;
}
.btn-red:hover { background-color: #b71c1c; }

/* Panel Principal y Tablas */
.main-panel {
  background-color: #1a1212;
  border: 1px solid #2d1f1f;
  border-radius: 8px;
  overflow: hidden;
}
.table-container {
  overflow-x: auto;
}
.a-table {
  width: 100%;
  border-collapse: collapse;
}
.a-table th {
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 1px;
  padding: 16px 24px;
  border-bottom: 1px solid #2d1f1f;
  text-transform: uppercase;
}
.a-table td {
  padding: 16px 24px;
  font-size: 0.85rem;
  border-bottom: 1px solid #2d1f1f;
  color: #d1d5db;
}
.a-table tr:hover {
  background-color: rgba(255, 255, 255, 0.01);
}

.rol-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}
.rol-badge.admin { background-color: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
.rol-badge.operador { background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.rol-badge.campo { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background-color: rgba(255,255,255,0.03);
  border: 1px solid #2d1f1f;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.action-btn:hover {
  opacity: 1;
}

/* Modales */
.modal-card {
  background-color: #150f0f;
  border: 1px solid #3d2222;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #2d1f1f;
  padding-bottom: 10px;
}
.panel-header h4 { margin: 0; color: #fff; font-size: 1.1rem; font-weight: 800; }

.form-emergencia {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Spinner */
.spinner-tactical {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(211, 47, 47, 0.2);
  border-top-color: #d32f2f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
