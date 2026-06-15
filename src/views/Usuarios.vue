<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
    >
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span
            class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-cyan-100"
          >
            Seguridad v3.5 - Gestión de Perfiles
          </span>
        </div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Usuarios</h1>
        <p class="text-slate-500 font-medium">
          Administra credenciales, fotografías de identificación y permisos granulares por módulo.
        </p>
      </div>
      <button
        @click="abrirModalCreacion"
        class="bg-[#06b6d4] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span class="material-icons">person_add</span> Agregar Usuario
      </button>
    </header>

    <!-- Toolbar de Filtros -->
    <div
      class="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-8"
    >
      <div class="flex gap-8 border-b md:border-b-0 border-slate-100 w-full md:w-auto px-4">
        <button
          @click="filtroRol = 'TODOS'"
          :class="
            filtroRol === 'TODOS'
              ? 'border-cyan-600 text-cyan-600 font-black'
              : 'text-slate-400 font-bold hover:text-slate-600'
          "
          class="pb-4 md:pb-0 border-b-2 border-transparent text-sm transition-all"
        >
          Todo el Equipo
        </button>
        <button
          @click="filtroRol = 'Administrador'"
          :class="
            filtroRol === 'Administrador'
              ? 'border-cyan-600 text-cyan-600 font-black'
              : 'text-slate-400 font-bold hover:text-slate-600'
          "
          class="pb-4 md:pb-0 border-b-2 border-transparent text-sm transition-all"
        >
          Administradores
        </button>
        <button
          @click="filtroRol = 'Operador'"
          :class="
            filtroRol === 'Operador'
              ? 'border-cyan-600 text-cyan-600 font-black'
              : 'text-slate-400 font-bold hover:text-slate-600'
          "
          class="pb-4 md:pb-0 border-b-2 border-transparent text-sm transition-all"
        >
          Taller y Logística
        </button>
      </div>

      <div class="relative w-full md:w-96">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          >search</span
        >
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o ID..."
          class="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium shadow-inner"
        />
      </div>
    </div>

    <!-- Estados de Carga y Error -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200"
    >
      <div
        class="w-14 h-14 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">
        Sincronizando perfiles y permisos...
      </p>
    </div>

    <!-- Grid de Usuarios -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <div
        v-for="user in usuariosFiltrados"
        :key="user.id"
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden group"
      >
        <div class="p-10">
          <div class="flex justify-between items-start mb-8">
            <div class="relative">
              <div
                class="w-24 h-24 rounded-[2rem] bg-slate-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-cover bg-center"
                :style="
                  user.avatar_url ? `background-image: url('${apiBase}${user.avatar_url}')` : ''
                "
              >
                <span
                  v-if="!user.avatar_url"
                  class="text-3xl font-black text-slate-300 uppercase"
                  >{{ user.nombre.charAt(0) }}</span
                >
              </div>
              <div
                :class="user.activo ? 'bg-emerald-500' : 'bg-slate-300'"
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm"
              ></div>
            </div>
            <button
              @click="abrirModalEdicion(user)"
              class="w-12 h-12 rounded-2xl text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 transition-all flex items-center justify-center"
            >
              <span class="material-icons">settings</span>
            </button>
          </div>

          <div class="mb-8">
            <h3 class="text-2xl font-black text-slate-800 leading-tight mb-1">{{ user.nombre }}</h3>
            <p class="text-xs text-slate-400 font-mono tracking-widest mb-6">@{{ user.usuario }}</p>

            <div class="flex gap-2">
              <span
                :class="
                  user.rol === 'Administrador'
                    ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'
                    : 'bg-cyan-50 text-cyan-600 border-cyan-100'
                "
                class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border"
              >
                {{ user.rol }}
              </span>
              <span
                class="px-4 py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                {{ contarPermisos(user) }} Accesos
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
            <div class="text-left">
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                Estado
              </p>
              <p
                :class="user.activo ? 'text-emerald-500' : 'text-slate-400'"
                class="text-xs font-black uppercase"
              >
                {{ user.activo ? 'Activo' : 'Bloqueado' }}
              </p>
            </div>
            <div class="text-right">
              <button
                @click="abrirModalEdicion(user)"
                class="text-[10px] font-black text-[#06b6d4] uppercase hover:underline"
              >
                Ver Permisos
              </button>
            </div>
          </div>
        </div>

        <button
          @click="abrirModalEdicion(user)"
          class="w-full py-5 bg-slate-50 group-hover:bg-[#06b6d4] group-hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
        >
          <span class="material-icons text-sm">vpn_key</span> Gestionar Perfil y Seguridad
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- MODAL MAESTRO: USUARIO, FOTO Y PERMISOS -->
    <!-- ================================================================= -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-black text-slate-900">
              {{ editando ? 'Configurar Perfil' : 'Nuevo Colaborador' }}
            </h2>
            <p class="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.2em] mt-2">
              Seguridad Granular v3.5
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardarUsuario" class="overflow-y-auto max-h-[75vh]">
          <div class="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- COLUMNA 1: FOTO Y DATOS BÁSICOS (4/12) -->
            <div class="lg:col-span-5 space-y-8">
              <!-- GESTIÓN DE AVATAR -->
              <div class="flex flex-col items-center text-center">
                <div class="relative group cursor-pointer">
                  <div
                    class="w-40 h-40 rounded-[3rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-cover bg-center"
                    :style="
                      avatarPreview
                        ? `background-image: url('${avatarPreview}')`
                        : formulario.avatar_url
                          ? `background-image: url('${apiBase}${formulario.avatar_url}')`
                          : ''
                    "
                  >
                    <span
                      v-if="!avatarPreview && !formulario.avatar_url"
                      class="material-icons text-6xl text-slate-300"
                      >person</span
                    >
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="manejarArchivo"
                    class="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="absolute -bottom-2 -right-2 w-12 h-12 bg-[#06b6d4] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <span class="material-icons">add_a_photo</span>
                  </button>
                </div>
                <p class="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fotografía de Identificación
                </p>
              </div>

              <div class="space-y-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3"
                    >Nombre Completo</label
                  >
                  <input
                    v-model="formulario.nombre"
                    required
                    type="text"
                    class="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3"
                    >ID Usuario</label
                  >
                  <input
                    v-model="formulario.usuario"
                    :disabled="editando"
                    required
                    type="text"
                    class="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 disabled:opacity-50"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label
                      class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3"
                      >Rol</label
                    >
                    <select
                      v-model="formulario.rol"
                      class="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                    >
                      <option value="Operador">Operador</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Logística">Logística</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label
                      class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3"
                      >Estatus</label
                    >
                    <select
                      v-model="formulario.activo"
                      class="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
                    >
                      <option :value="1">Activo</option>
                      <option :value="0">Bloqueado</option>
                    </select>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3"
                    >Nueva Contraseña</label
                  >
                  <input
                    v-model="formulario.password"
                    :required="!editando"
                    type="password"
                    placeholder="••••••••"
                    class="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <!-- COLUMNA 2: PANEL DE PERMISOS GRANULARES (7/12) -->
            <div class="lg:col-span-7 bg-slate-50 rounded-[2.5rem] p-8">
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#06b6d4]"
                >
                  <span class="material-icons">verified_user</span>
                </div>
                <h3 class="font-black text-slate-800 text-sm uppercase tracking-widest">
                  Accesos al Sistema
                </h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  v-for="(label, key) in mapaPermisos"
                  :key="key"
                  class="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-[#06b6d4]/30 transition-all group"
                >
                  <div class="relative flex items-center">
                    <input
                      type="checkbox"
                      v-model="formulario.permisos[key]"
                      :true-value="1"
                      :false-value="0"
                      class="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-[#06b6d4] checked:border-[#06b6d4] transition-all"
                    />
                    <span
                      class="material-icons absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform left-1"
                      >check</span
                    >
                  </div>
                  <span class="text-xs font-black text-slate-600 uppercase tracking-tight">{{
                    label
                  }}</span>
                </label>
              </div>

              <div class="mt-8 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                <p class="text-[10px] text-cyan-700 font-bold leading-relaxed">
                  <span class="material-icons text-[12px] align-middle mr-1">info</span>
                  Los cambios en los permisos se aplicarán la próxima vez que el usuario inicie
                  sesión. Los administradores suelen tener todos los accesos habilitados por
                  defecto.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer de Acciones -->
          <div class="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
            <button
              type="button"
              @click="cerrarModal"
              class="flex-1 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <span
                v-if="guardando"
                class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <span v-else class="material-icons text-sm">save</span>
              {{ editando ? 'Guardar Cambios' : 'Confirmar Registro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- CONFIGURACIÓN ---
const apiBase = 'http://localhost:3000'
const mapaPermisos = {
  p_dashboard: 'Panel de Control',
  p_clientes: 'Módulo Clientes',
  p_ordenes: 'Tablero de Órdenes',
  p_nueva_orden: 'Generar Presupuestos',
  p_inventario: 'Almacén de Insumos',
  p_proveedores: 'Proveedores',
  p_entrada_mercancia: 'Carga de Stock',
  p_caja: 'Caja y Pagos',
  p_cat_clientes: 'Categorías Clientes',
  p_cat_productos: 'Categorías Productos',
  p_usuarios: 'Gestión Usuarios',
}

// --- ESTADO REACTIVO ---
const usuarios = ref([])
const cargando = ref(true)
const guardando = ref(false)
const busqueda = ref('')
const filtroRol = ref('TODOS')

// Modal y Formulario
const modalAbierto = ref(false)
const editando = ref(false)
const usuarioId = ref(null)
const avatarFile = ref(null)
const avatarPreview = ref(null)

const formulario = ref({
  nombre: '',
  usuario: '',
  rol: 'Operador',
  password: '',
  activo: 1,
  avatar_url: null,
  permisos: {},
})

// --- PROPIEDADES COMPUTADAS ---

const usuariosFiltrados = computed(() => {
  if (!Array.isArray(usuarios.value)) return []
  const search = busqueda.value.toLowerCase()
  return usuarios.value.filter((u) => {
    const matchBusqueda =
      u.nombre.toLowerCase().includes(search) || u.usuario.toLowerCase().includes(search)
    const matchRol = filtroRol.value === 'TODOS' || u.rol === filtroRol.value
    return matchBusqueda && matchRol
  })
})

const contarPermisos = (user) => {
  return Object.keys(mapaPermisos).filter((key) => user[key] === 1).length
}

// --- MÉTODOS DE DATOS ---

const cargarUsuarios = async () => {
  try {
    cargando.value = true
    const response = await api.get('/usuarios')
    usuarios.value = response.data
  } catch (err) {
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

const abrirModalCreacion = () => {
  editando.value = false
  usuarioId.value = null
  avatarFile.value = null
  avatarPreview.value = null
  formulario.value = {
    nombre: '',
    usuario: '',
    rol: 'Operador',
    password: '',
    activo: 1,
    permisos: Object.keys(mapaPermisos).reduce((acc, key) => ({ ...acc, [key]: 1 }), {}),
  }
  modalAbierto.value = true
}

const abrirModalEdicion = (user) => {
  editando.value = true
  usuarioId.value = user.id
  avatarFile.value = null
  avatarPreview.value = null

  // Mapeamos los permisos desde el objeto de usuario plano
  const permisos = {}
  Object.keys(mapaPermisos).forEach((key) => {
    permisos[key] = user[key]
  })

  formulario.value = { ...user, password: '', permisos }
  modalAbierto.value = true
}

const manejarArchivo = (e) => {
  const file = e.target.files[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardarUsuario = async () => {
  try {
    guardando.value = true
    let currentId = usuarioId.value

    if (editando.value) {
      await api.put(`/usuarios/${currentId}`, formulario.value)
    } else {
      const res = await api.post('/usuarios', formulario.value)
      currentId = res.data.id
    }

    // Subida de Avatar si existe archivo nuevo
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      await api.post(`/usuarios/${currentId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    await cargarUsuarios()
    cerrarModal()
    alert('Usuario procesado correctamente.')
  } catch (err) {
    alert(err.response?.data?.error || 'Error técnico al guardar.')
  } finally {
    guardando.value = false
  }
}

onMounted(cargarUsuarios)
</script>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
