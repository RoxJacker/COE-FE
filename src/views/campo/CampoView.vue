<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useGeolocalizacion } from '@/composables/useGeolocalizacion.js'
import { useSocket } from '@/composables/useSocket.js'
import api from '@/services/api.js'

const auth = useAuthStore()
const { socket } = useSocket()
const { rastreando, latitud, longitud, error: gpsError, iniciarRastreo, detenerRastreo } = useGeolocalizacion()

const cargando = ref(false)
const unidadInfo = ref(null)
const emergenciaAsignada = ref(null)

// Estatus de la unidad
const estadoActual = computed(() => unidadInfo.value?.estado || 'disponible')

const estadoLabel = {
  disponible: 'Disponible en Base',
  en_camino: 'En Camino al Incidente',
  en_escena: 'Trabajando en Escena',
  regresando: 'Retornando a Base',
  fuera_de_servicio: 'Fuera de Servicio',
}

const estadoClase = {
  disponible: 'bg-verde',
  en_camino: 'bg-azul',
  en_escena: 'bg-rojo',
  regresando: 'bg-indigo',
  fuera_de_servicio: 'bg-gris',
}

// Cargar información de la unidad y su emergencia asignada
const cargarDatos = async () => {
  if (!auth.usuario?.unidadAsignada) return
  cargando.value = true
  try {
    // 1. Obtener detalles de la unidad (baseURL en api.js ya incluye /api)
    const resUnidad = await api.get(`/unidades/${auth.usuario.unidadAsignada}`)
    unidadInfo.value = resUnidad.data

    // 2. Buscar si tiene emergencia activa asignada
    const resEmergencias = await api.get('/emergencias/activas')
    const asignada = resEmergencias.data.find(
      (e) => e.unidadAsignada?._id === auth.usuario.unidadAsignada
    )
    emergenciaAsignada.value = asignada || null
  } catch (e) {
    console.error('Error cargando datos de campo:', e)
  } finally {
    cargando.value = false
  }
}

// Cambiar estado operativo de la unidad
const cambiarEstado = async (nuevoEstado) => {
  if (!auth.usuario?.unidadAsignada) return
  
  // Feedback háptico (vibración corta si es móvil)
  if ('vibrate' in navigator) {
    navigator.vibrate(40)
  }

  try {
    // 1. Actualizar el estado de la unidad
    const res = await api.patch(`/unidades/${auth.usuario.unidadAsignada}/estado`, {
      estado: nuevoEstado
    })
    unidadInfo.value = res.data

    // 2. Emitir por Socket para que los operadores se enteren de inmediato
    if (socket) {
      socket.emit('unidad:estado', {
        unidadId: auth.usuario.unidadAsignada,
        estado: nuevoEstado
      })
    }

    // 3. Si llegamos a escena, registrar tiempoEscena en la emergencia (KPI TPR)
    //    y cambiar el estado de la emergencia a en_atencion
    if (nuevoEstado === 'en_escena' && emergenciaAsignada.value?._id) {
      try {
        const resEm = await api.patch(`/emergencias/${emergenciaAsignada.value._id}/estado`, {
          estado: 'en_atencion'
        })
        emergenciaAsignada.value = resEm.data
      } catch (emErr) {
        console.warn('No se pudo actualizar el estado de la emergencia a en_atencion:', emErr)
      }
    }

    // 4. Si regresamos o quedamos disponibles, recargar datos frescos del servidor
    if (nuevoEstado === 'disponible' || nuevoEstado === 'regresando') {
      await cargarDatos()
    }
  } catch (e) {
    console.error('Error al cambiar de estado:', e)
  }
}

// Finalizar la emergencia desde la unidad de campo
const finalizarServicio = async () => {
  if (!emergenciaAsignada.value?._id) return
  
  if ('vibrate' in navigator) {
    navigator.vibrate([40, 40, 40])
  }
  
  try {
    cargando.value = true
    await api.patch(`/emergencias/${emergenciaAsignada.value._id}/estado`, {
      estado: 'cerrado'
    })
    emergenciaAsignada.value = null
    await cargarDatos()
  } catch (e) {
    console.error('Error al finalizar el servicio:', e)
  } finally {
    cargando.value = false
  }
}

// Transmitir coordenadas GPS por socket
const transmitirUbicacion = (coords) => {
  if (!auth.usuario?.unidadAsignada || !socket) return
  
  socket.emit('ubicacion:update', {
    unidadId: auth.usuario.unidadAsignada,
    lat: coords.lat,
    lng: coords.lng
  })
}

// Google Maps Route URL helper
const googleMapsUrl = computed(() => {
  if (!emergenciaAsignada.value?.ubicacion) return '#'
  const u = emergenciaAsignada.value.ubicacion
  if (u.lat && u.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${u.lat},${u.lng}`
  }
  const query = encodeURIComponent(u.direccionCompleta || `${u.calle}, Zapopan, Jalisco`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
})

onMounted(async () => {
  await cargarDatos()
  
  // Iniciar rastreo satelital automáticamente al entrar
  iniciarRastreo(transmitirUbicacion)

  // Escuchar si los operadores nos asignan/quitan emergencias en tiempo real
  if (socket) {
    socket.on('emergencia:actualizada', async (em) => {
      // Si la emergencia actualizada nos fue asignada, o si nos quitaron de ella
      if (em.unidadAsignada?._id === auth.usuario.unidadAsignada) {
        emergenciaAsignada.value = em
      } else if (emergenciaAsignada.value?._id === em._id) {
        // Nos desasignaron o fue cerrada
        emergenciaAsignada.value = null
      }
    })
    socket.on('emergencia:nueva', async () => {
      // Recargar por si acaso
      await cargarDatos()
    })
  }
})

onUnmounted(() => {
  detenerRastreo()
  if (socket) {
    socket.off('emergencia:actualizada')
    socket.off('emergencia:nueva')
  }
})
</script>

<template>
  <div class="campo-view">
    <!-- Estatus GPS -->
    <div class="gps-card" :class="{ 'gps-error': gpsError }">
      <div class="gps-status-indicator">
        <span class="ping-dot" :class="{ running: rastreando && !gpsError, error: gpsError }"></span>
        <span class="texto-xs font-bold uppercase letter-spacing">
          {{ gpsError ? 'Error GPS' : (rastreando ? 'Transmitiendo ubicación' : 'GPS inactivo') }}
        </span>
      </div>
      <div v-if="gpsError" class="gps-error-msg texto-xs">
        {{ gpsError }}
      </div>
      <div v-else-if="latitud && longitud" class="gps-coords texto-xs">
        <span>Lat: {{ latitud.toFixed(5) }}</span>
        <span>Lng: {{ longitud.toFixed(5) }}</span>
      </div>
    </div>

    <!-- Estatus Actual -->
    <div class="status-indicator-hero" :class="estadoClase[estadoActual]">
      <span class="indicator-label">Estado Actual</span>
      <h2 class="indicator-value">{{ estadoLabel[estadoActual] }}</h2>
    </div>

    <!-- Secciones de emergencia asignada -->
    <div class="emergencia-card blur-effect" v-if="emergenciaAsignada">
      <div class="card-tag alert-red">SERVICIO ASIGNADO</div>
      <div class="card-header">
        <span class="folio-tag">{{ emergenciaAsignada.folio }}</span>
        <span class="chip chip-critica uppercase">{{ emergenciaAsignada.prioridad }}</span>
      </div>
      <h3 class="emergencia-tipo">{{ emergenciaAsignada.subtipo || emergenciaAsignada.tipo }}</h3>
      
      <div class="info-block">
        <span class="label">Dirección</span>
        <p class="value">{{ emergenciaAsignada.ubicacion?.direccionCompleta || emergenciaAsignada.direccion }}</p>
      </div>

      <div v-if="emergenciaAsignada.ubicacion?.referencias" class="info-block">
        <span class="label">Referencias</span>
        <p class="value text-amber">{{ emergenciaAsignada.ubicacion.referencias }}</p>
      </div>

      <div v-if="emergenciaAsignada.notas" class="info-block">
        <span class="label">Notas de Reporte</span>
        <p class="value italic">{{ emergenciaAsignada.notas }}</p>
      </div>

      <!-- Botón de navegación Google Maps -->
      <a :href="googleMapsUrl" target="_blank" class="btn btn-primario btn-maps w-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Navegar con Google Maps
      </a>

      <!-- Botón para finalizar servicio desde el campo -->
      <button 
        v-if="estadoActual === 'en_escena'" 
        @click="finalizarServicio" 
        class="btn btn-cerrar w-full text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Finalizar y Cerrar Servicio
      </button>
    </div>

    <div class="emergencia-card-vacia blur-effect text-center" v-else>
      <div class="icon-sleep">💤</div>
      <h4>Sin servicios pendientes</h4>
      <p class="texto-sm texto-muted">Mantente en tu base o zona asignada. El COE te notificará cuando se registre un reporte.</p>
    </div>

    <!-- Botones táctiles grandes para transición de estados -->
    <div class="btn-grid-campo">
      <button 
        class="btn-control disponible" 
        :class="{ active: estadoActual === 'disponible' }"
        @click="cambiarEstado('disponible')"
      >
        <span class="btn-icon">🟢</span>
        <span class="btn-text">Disponible</span>
      </button>

      <button 
        class="btn-control en-camino" 
        :class="{ active: estadoActual === 'en_camino' }"
        @click="cambiarEstado('en_camino')"
      >
        <span class="btn-icon">🔵</span>
        <span class="btn-text">En Camino</span>
      </button>

      <button 
        class="btn-control en-escena" 
        :class="{ active: estadoActual === 'en_escena' }"
        @click="cambiarEstado('en_escena')"
      >
        <span class="btn-icon">🔴</span>
        <span class="btn-text">En Escena</span>
      </button>

      <button 
        class="btn-control regresando" 
        :class="{ active: estadoActual === 'regresando' }"
        @click="cambiarEstado('regresando')"
      >
        <span class="btn-icon">🟣</span>
        <span class="btn-text">Regresando</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.campo-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

/* Tarjeta de GPS */
.gps-card {
  background: var(--bg-card);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.gps-card.gps-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.gps-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ping-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--texto-dim);
}

.ping-dot.running {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: gps-ping 1.6s infinite ease-in-out;
}

.ping-dot.error {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes gps-ping {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.gps-error-msg {
  color: #fca5a5;
  font-weight: 500;
}

.gps-coords {
  display: flex;
  gap: 12px;
  color: var(--texto-blanco);
  font-family: monospace;
}

/* Indicador de estado actual */
.status-indicator-hero {
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: background 0.3s;
}

.indicator-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 2px;
}

.indicator-value {
  font-size: 1.2rem;
  margin: 0;
  color: #fff;
  font-weight: 800;
}

.bg-verde { background: #10b981; }
.bg-azul { background: #3b82f6; }
.bg-rojo { background: #dc2626; }
.bg-indigo { background: #6366f1; }
.bg-gris { background: #6b7280; }

/* Tarjeta emergencia */
.emergencia-card {
  background: var(--bg-card);
  border: 1px solid var(--borde);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.card-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 4px 10px;
  border-bottom-left-radius: 8px;
}

.alert-red {
  background: #dc2626;
  color: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.folio-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--texto-dim);
}

.emergencia-tipo {
  margin: 0 0 16px 0;
  font-size: 1.15rem;
  color: var(--texto-blanco);
  line-height: 1.3;
}

.info-block {
  margin-bottom: 14px;
}

.info-block .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--texto-dim);
  display: block;
  margin-bottom: 2px;
}

.info-block .value {
  margin: 0;
  font-size: 0.88rem;
  color: var(--texto-blanco);
  line-height: 1.4;
}

.text-amber {
  color: #fcd34d !important;
}

.btn-maps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  font-size: 0.88rem;
  padding: 12px;
}

/* Tarjeta Vacía */
.emergencia-card-vacia {
  background: var(--bg-card);
  border: 1px dashed var(--borde);
  border-radius: 16px;
  padding: 32px 20px;
}

.icon-sleep {
  font-size: 2.2rem;
  margin-bottom: 12px;
}

.emergencia-card-vacia h4 {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  color: var(--texto-blanco);
}

.emergencia-card-vacia p {
  margin: 0;
  line-height: 1.4;
}

/* Botones de control táctil gigante */
.btn-grid-campo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: auto;
  padding-bottom: 12px;
}

.btn-control {
  border: 1px solid var(--borde);
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--trans);
  color: var(--texto);
}

.btn-control .btn-icon {
  font-size: 1.6rem;
}

.btn-control .btn-text {
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--fuente);
}

/* Estados activos en botones */
.btn-control.disponible.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
  transform: scale(0.97);
}

.btn-control.en-camino.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  transform: scale(0.97);
}

.btn-control.en-escena.active {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  transform: scale(0.97);
}

.btn-control.regresando.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  transform: scale(0.97);
}

.btn-cerrar {
  background: #dc2626;
  color: #fff;
  font-weight: 700;
  border: 1px solid #2d1f1f;
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all var(--trans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.btn-cerrar:hover {
  background: #b91c1c;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.4);
}
</style>
