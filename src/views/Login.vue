<template>
  <div class="login-layout">
    <!-- Capa de fondo con blobs dinámicos mejorados v3.8 -->
    <div class="decor-blob-1 animate-pulse-slow"></div>
    <div class="decor-blob-2 animate-pulse-slow"></div>

    <div class="login-card-container">
      <div class="login-card shadow-2xl animate-in fade-in zoom-in duration-500">
        <div class="login-header">
          <!-- ÁREA DE AVATAR REDISEÑADA -->
          <div class="avatar-view-master mb-8">
            <div class="relative inline-block">
              <!-- Texto de prueba en rojo -->
              <p class="text-red-500 font-bold bg-white p-2 z-50 absolute">{{ userAvatar }}</p>

              <div
                class="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-700 transform"
                :class="{ 'scale-110 shadow-cyan-500/20 ring-8 ring-cyan-50': userAvatar }"
              >
                <transition name="avatar-fade" mode="out-in">
                  <!-- Fotografía Real del Usuario -->
                  <img
                    v-if="userAvatar"
                    :key="userAvatar"
                    :src="userAvatar"
                    class="w-full h-full object-cover"
                    alt="Foto de perfil"
                  />
                  <!-- Icono por defecto si no hay foto o no ha escrito el usuario -->
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                    <span class="material-icons text-6xl">person</span>
                  </div>
                </transition>
              </div>

              <!-- Indicador de Estatus Visual -->
              <div
                v-if="userName"
                class="absolute -bottom-2 right-2 bg-emerald-500 text-white w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg animate-in slide-in-from-bottom-2"
              >
                <span class="material-icons text-lg">verified</span>
              </div>
            </div>
          </div>

          <div class="text-center">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {{ userName ? '¡Hola, ' + userName + '!' : 'Acceso al Sistema' }}
            </h1>
            <div class="h-6 mt-2">
              <p
                v-if="!userName"
                class="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-in fade-in"
              >
                Brinco Creativo · Operaciones Internas
              </p>
              <p
                v-else
                class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-top-1"
              >
                {{ userRol || 'Colaborador Autorizado' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulario de Autenticación -->
        <form @submit.prevent="handleLogin" class="login-form space-y-6 mt-10">
          <div class="flex flex-col gap-2 text-left group">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-[#06b6d4] transition-colors"
              >ID de Usuario</label
            >
            <div class="relative">
              <span
                class="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#06b6d4] transition-colors"
                >alternate_email</span
              >
              <input
                class="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-[#06b6d4]/20 focus:ring-8 focus:ring-[#06b6d4]/5 transition-all font-bold text-slate-700 shadow-inner"
                placeholder="Ingresa tu ID..."
                required
                type="text"
                v-model="credenciales.usuario"
                @input="handleUserTyping"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 text-left group">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 group-focus-within:text-[#06b6d4] transition-colors"
              >Clave Maestra</label
            >
            <div class="relative">
              <span
                class="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#06b6d4] transition-colors"
                >lock_open</span
              >
              <input
                class="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-[#06b6d4]/20 focus:ring-8 focus:ring-[#06b6d4]/5 transition-all font-bold text-slate-700 shadow-inner"
                placeholder="••••••••"
                required
                type="password"
                v-model="credenciales.password"
              />
            </div>
          </div>

          <div
            class="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100 flex items-center justify-center gap-2 animate-in shake-x"
            v-if="error"
          >
            <span class="material-icons text-sm">report_problem</span> {{ error }}
          </div>

          <div class="pt-4">
            <button
              :disabled="cargando"
              class="w-full py-5 bg-[#06b6d4] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] hover:bg-[#0891b2] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              type="submit"
            >
              <span
                class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
                v-if="cargando"
              ></span>
              <span class="material-icons" v-else>login</span>
              {{ cargando ? 'VALIDANDO PERFIL...' : 'ENTRAR AL TALLER' }}
            </button>
          </div>
        </form>

        <div class="login-footer pt-10 border-t border-slate-50 mt-10">
          <div class="flex flex-col gap-4">
            <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
              SISTEMA DE GESTIÓN v3.8 PRO
            </p>
            <div class="flex justify-center gap-6">
              <button
                class="text-[10px] font-bold text-slate-400 hover:text-[#06b6d4] transition-colors"
              >
                ¿Problemas de acceso?
              </button>
              <span class="text-slate-200">|</span>
              <button
                class="text-[10px] font-bold text-slate-400 hover:text-[#06b6d4] transition-colors"
              >
                Contactar Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const credenciales = ref({ usuario: '', password: '' })
const cargando = ref(false)
const error = ref('')
// const apiBase = 'http://localhost:3000'
const userAvatar = ref(null)
const userName = ref('')
const userRol = ref('')
const typingTimer = ref(null)

const handleUserTyping = () => {
  clearTimeout(typingTimer.value)
  if (!credenciales.value.usuario || credenciales.value.usuario.length < 2) {
    userAvatar.value = null
    userName.value = ''
    userRol.value = ''
    return
  }
  typingTimer.value = setTimeout(async () => {
    try {
      const response = await api.get(`/usuarios/perfil/${credenciales.value.usuario}`)
      if (response.data) {
        userAvatar.value = response.data.avatar_url
        userName.value = response.data.nombre.split(' ')[0]
        userRol.value = response.data.rol
      } else {
        resetProfile()
      }
    } catch {
      resetProfile()
    }
  }, 500)
}

const resetProfile = () => {
  userAvatar.value = null
  userName.value = ''
  userRol.value = ''
}

const handleLogin = async () => {
  try {
    cargando.value = true
    error.value = ''
    const response = await api.post('/login', credenciales.value)
    if (response.data.success) {
      const { token, user } = response.data
      const flatUser = { ...user, ...user.permisos }
      delete flatUser.permisos
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_brinco', JSON.stringify(flatUser))
      router.push('/')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo conectar con el servidor'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* ESTRUCTURA MAESTRA DE LAYOUT */
.login-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f9fb;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  overflow-y: auto;
  font-family: 'Outfit', sans-serif;
  padding: 24px;
}

.login-card-container {
  width: 100%;
  max-width: 460px;
  perspective: 1000px;
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 4rem;
  padding: 60px 48px;
  text-align: center;
  position: relative;
  z-index: 10;
  border: 1px solid white;
}

/* BLOBS DE FONDO (v3.8) */
.decor-blob-1 {
  position: absolute;
  top: -15%;
  right: -10%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(247, 249, 251, 0) 70%);
  border-radius: 50%;
}

.decor-blob-2 {
  position: absolute;
  bottom: -20%;
  left: -15%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(247, 249, 251, 0) 70%);
  border-radius: 50%;
}

/* ANIMACIONES Y TRANSICIONES */
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.avatar-fade-enter-active,
.avatar-fade-leave-active {
  transition: all 0.5s ease;
}

.avatar-fade-enter-from,
.avatar-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) rotate(-10deg);
  filter: blur(10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

/* RESPONSIVE DESIGN ADAPTATIONS */
@media (max-width: 640px) {
  .login-card {
    padding: 48px 24px;
    border-radius: 3rem;
  }
  .avatar-view-master .w-36 {
    width: 110px;
    height: 110px;
  }
}

.shake-x {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
