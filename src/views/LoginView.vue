<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const rolSeleccionado = ref('operador') // 'operador' | 'campo'
const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)

const manejarLogin = async () => {
  if (!email.value || !password.value) return

  const resultado = await authStore.iniciarSesion(email.value, password.value)

  if (resultado.exito) {
    if (resultado.rol === 'campo') {
      router.push('/campo')
    } else {
      router.push('/operador')
    }
  }
}

const placeholderEmail = {
  operador: 'nombre.apellido@zapopan.gob.mx',
  campo:    'unidad o correo institucional',
}
</script>

<template>
  <div class="login-pagina">

    <!-- ── Panel izquierdo ─────────────────────────────────────── -->
    <div class="login-panel-izq">
      <!-- Fondo decorativo -->
      <div class="splash-rojo"></div>

      <div class="panel-contenido">
        <!-- Logo + nombre -->
        <div class="logo-wrap">
          <div class="logo-icono">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M12.017 2C9.265 2 7.046 4.267 7 7.02c-.003.28.015.557.056.829C5.87 9.36 5 10.99 5 12.845 5 16.226 7.82 19 11.25 19h7.5C21.09 19 23 17.05 23 14.667c0-1.832-1.09-3.41-2.67-4.097A5.033 5.033 0 0 0 17 6a5.03 5.03 0 0 0-4.983-4z"/>
              <path d="M9 22c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-2c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"/>
            </svg>
          </div>
          <div>
            <h1 class="logo-titulo">COE Zapopan</h1>
            <p class="logo-subtitulo">Centro de Operaciones de Emergencia</p>
          </div>
        </div>

        <!-- Descripción -->
        <div class="panel-descripcion">
          <p>Sistema de gestión de emergencias de la Coordinación Municipal de Protección Civil y Bomberos.</p>
        </div>

        <!-- Escudo oficial -->
        <div class="escudo-wrap">
          <!-- Placeholder del escudo — reemplazar con imagen real -->
          <div class="escudo-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90" fill="none">
              <path d="M40 2 L78 16 L78 50 Q78 74 40 88 Q2 74 2 50 L2 16 Z" fill="rgba(220,38,38,0.15)" stroke="rgba(220,38,38,0.4)" stroke-width="2"/>
              <text x="40" y="50" text-anchor="middle" fill="rgba(220,38,38,0.7)" font-size="11" font-family="Inter" font-weight="600">ZAPOPAN</text>
            </svg>
          </div>
        </div>

        <p class="acceso-exclusivo">Acceso exclusivo para personal autorizado</p>
      </div>
    </div>

    <!-- ── Panel derecho ───────────────────────────────────────── -->
    <div class="login-panel-der">
      <div class="login-form-wrap">

        <!-- Título -->
        <div class="login-encabezado">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales institucionales para continuar.</p>
        </div>

        <!-- Selector de rol -->
        <div class="selector-rol">
          <button
            id="btn-rol-operador"
            class="rol-opcion"
            :class="{ activo: rolSeleccionado === 'operador' }"
            @click="rolSeleccionado = 'operador'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
            <span>Operador COE</span>
          </button>
          <button
            id="btn-rol-campo"
            class="rol-opcion"
            :class="{ activo: rolSeleccionado === 'campo' }"
            @click="rolSeleccionado = 'campo'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <span>Unidad en campo</span>
          </button>
        </div>

        <!-- Formulario -->
        <form id="form-login" @submit.prevent="manejarLogin" novalidate>
          <!-- Error -->
          <div v-if="authStore.error" class="login-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {{ authStore.error }}
          </div>

          <!-- Email -->
          <div class="form-campo">
            <label class="form-label" for="input-email">Usuario o correo institucional</label>
            <div class="input-grupo">
              <svg class="input-icono" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                id="input-email"
                v-model="email"
                class="input"
                type="email"
                :placeholder="placeholderEmail[rolSeleccionado]"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-campo">
            <label class="form-label" for="input-password">Contraseña</label>
            <div class="input-grupo">
              <svg class="input-icono" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                id="input-password"
                v-model="password"
                class="input"
                :type="mostrarPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password"
                required
              />
              <button type="button" class="btn-ver-pass" @click="mostrarPassword = !mostrarPassword">
                <svg v-if="!mostrarPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Botón login -->
          <button
            id="btn-ingresar"
            type="submit"
            class="btn btn-primario w-full btn-login"
            :disabled="authStore.cargando"
          >
            <span v-if="authStore.cargando" class="spinner"></span>
            <span v-else>Ingresar al sistema</span>
          </button>
        </form>

        <p class="login-ayuda">¿Olvidaste tu contraseña? Contacta al administrador</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Layout dividido ──────────────────────────────────────── */
.login-pagina {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* ── Panel izquierdo (maroon institucional) ─────────────── */
.login-panel-izq {
  width: 380px;
  min-width: 320px;
  background: var(--maroon);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.splash-rojo {
  position: absolute;
  bottom: -80px;
  left: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 70%);
  pointer-events: none;
}

.panel-contenido {
  position: relative;
  z-index: 1;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icono {
  width: 52px;
  height: 52px;
  background: var(--rojo);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--sombra-roja);
  flex-shrink: 0;
}

.logo-titulo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.logo-subtitulo {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.panel-descripcion p {
  color: rgba(255,255,255,0.65);
  font-size: 0.875rem;
  line-height: 1.7;
}

.escudo-wrap {
  display: flex;
  justify-content: center;
  margin-top: auto;
  opacity: 0.7;
}

.escudo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.acceso-exclusivo {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  text-align: center;
}

/* ── Panel derecho (formulario) ──────────────────────────── */
.login-panel-der {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--bg-surface);
}

.login-form-wrap {
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.4s ease;
}

.login-encabezado {
  margin-bottom: 28px;
}
.login-encabezado h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--texto-blanco);
  margin-bottom: 6px;
}
.login-encabezado p {
  color: var(--texto-muted);
  font-size: 0.875rem;
}

/* ── Selector de rol ─────────────────────────────────────── */
.selector-rol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 28px;
}

.rol-opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--bg-card);
  border: 1.5px solid var(--borde);
  border-radius: var(--radio-lg);
  color: var(--texto-muted);
  font-family: var(--fuente);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--trans);
}

.rol-opcion:hover {
  border-color: var(--rojo-borde);
  color: var(--texto);
}

.rol-opcion.activo {
  border-color: var(--rojo);
  background: var(--rojo-suave);
  color: var(--rojo);
}

/* ── Error ───────────────────────────────────────────────── */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--alta-bg);
  border: 1px solid var(--rojo-borde);
  border-radius: var(--radio);
  padding: 10px 14px;
  color: #fca5a5;
  font-size: 0.82rem;
  margin-bottom: 16px;
}

/* ── Password toggle ─────────────────────────────────────── */
.input-grupo {
  position: relative;
}
.btn-ver-pass {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--texto-dim);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color var(--trans);
}
.btn-ver-pass:hover { color: var(--texto); }

/* ── Botón login ─────────────────────────────────────────── */
.btn-login {
  padding: 13px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 8px;
  border-radius: var(--radio-lg);
  letter-spacing: 0.2px;
}

/* ── Spinner ─────────────────────────────────────────────── */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}
@keyframes girar { to { transform: rotate(360deg); } }

/* ── Ayuda ───────────────────────────────────────────────── */
.login-ayuda {
  text-align: center;
  margin-top: 20px;
  font-size: 0.78rem;
  color: var(--texto-dim);
}

/* ── Responsive — móvil ──────────────────────────────────── */
@media (max-width: 680px) {
  .login-pagina { flex-direction: column; }
  .login-panel-izq {
    width: 100%;
    min-width: unset;
    min-height: 220px;
  }
  .panel-contenido { padding: 32px 24px; gap: 20px; }
  .escudo-wrap { display: none; }
  .login-panel-der { padding: 32px 20px; }
}
</style>
