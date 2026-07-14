import { ref, onUnmounted } from 'vue'

// Intervalo de throttle en ms — emite al servidor cada 20 segundos
const GPS_THROTTLE_MS = 20000

export const useGeolocalizacion = () => {
  const rastreando = ref(false)
  const latitud = ref(null)
  const longitud = ref(null)
  const error = ref(null)
  let watchId = null
  let ultimaEmision = 0 // timestamp de la última vez que se llamó al callback

  const iniciarRastreo = (onUpdateCallback) => {
    if (!('geolocation' in navigator)) {
      error.value = 'Geolocalización no soportada por el navegador.'
      return
    }

    if (watchId !== null) return // Ya está activo

    rastreando.value = true
    error.value = null

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        latitud.value = lat
        longitud.value = lng
        error.value = null

        // Throttle: solo invocar el callback (que emite por socket y escribe en BD)
        // cada GPS_THROTTLE_MS milisegundos para no saturar el servidor
        const ahora = Date.now()
        if (onUpdateCallback && (ahora - ultimaEmision) >= GPS_THROTTLE_MS) {
          ultimaEmision = ahora
          onUpdateCallback({ lat, lng })
        }
      },
      (err) => {
        console.error('Error de geolocalización:', err)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            error.value = 'Permiso denegado por el usuario.'
            break
          case err.POSITION_UNAVAILABLE:
            error.value = 'Señal GPS no disponible.'
            break
          case err.TIMEOUT:
            error.value = 'Tiempo de espera de geolocalización agotado.'
            break
          default:
            error.value = 'Error desconocido al obtener ubicación.'
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000, // Aceptar posición cacheada de hasta 10s para ahorrar batería
      }
    )
  }

  const detenerRastreo = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    rastreando.value = false
    latitud.value = null
    longitud.value = null
  }

  onUnmounted(() => {
    detenerRastreo()
  })

  return {
    rastreando,
    latitud,
    longitud,
    error,
    iniciarRastreo,
    detenerRastreo,
  }
}
