import { ref, onUnmounted } from 'vue'

export const useGeolocalizacion = () => {
  const rastreando = ref(false)
  const latitud = ref(null)
  const longitud = ref(null)
  const error = ref(null)
  let watchId = null

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

        if (onUpdateCallback) {
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
        timeout: 10000,
        maximumAge: 0,
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
