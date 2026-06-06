<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
    >
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Proveedores</h1>
        <p class="text-slate-500 font-medium">
          Administra tu red de abastecimiento y consulta el historial de compras.
        </p>
      </div>
      <button
        @click="abrirModalCreacion"
        class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span class="material-icons">local_shipping</span> Nuevo Proveedor
      </button>
    </header>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
        <div class="relative flex-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >search</span
          >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre, contacto o NIT..."
            class="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#06b6d4]/10 outline-none text-sm transition-all shadow-inner"
          />
        </div>
      </div>

      <!-- Estados de Carga y Error -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-24">
        <div
          class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
          Sincronizando con base de datos...
        </p>
      </div>

      <div v-else-if="error" class="p-12 text-center">
        <div
          class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span class="material-icons text-4xl">cloud_off</span>
        </div>
        <h3 class="text-xl font-black text-red-900 mb-2">Error de Conexión</h3>
        <p class="text-red-600 mb-8 max-w-md mx-auto">{{ error }}</p>
        <button
          @click="cargarProveedores"
          class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
        >
          Reintentar Carga
        </button>
      </div>

      <!-- Tabla de Proveedores -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50">
            <tr
              class="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
            >
              <th class="px-8 py-5">Empresa / NIT</th>
              <th class="px-8 py-5">Contacto Principal</th>
              <th class="px-8 py-5">Ubicación y Datos</th>
              <th class="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="prov in proveedoresFiltrados"
              :key="prov.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center font-black text-lg shadow-sm border border-cyan-100 group-hover:scale-110 transition-transform"
                  >
                    {{ prov.nombre_empresa ? prov.nombre_empresa.charAt(0) : '?' }}
                  </div>
                  <div>
                    <p class="font-black text-slate-800 text-base leading-tight">
                      {{ prov.nombre_empresa }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">
                      NIT: {{ prov.nit || 'S/N' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-1">
                  <p class="text-sm font-bold text-slate-700">
                    {{ prov.contacto_nombre || 'N/A' }}
                  </p>
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span class="material-icons text-xs">phone</span> {{ prov.telefono || 'N/A' }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                    <span class="material-icons text-xs text-[#06b6d4]">email</span>
                    {{ prov.email || 'Sin correo' }}
                  </div>
                  <p class="text-[10px] text-slate-400 truncate max-w-xs">
                    {{ prov.direccion || 'Sin dirección registrada' }}
                  </p>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div
                  class="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="irAlHistorial(prov.id)"
                    title="Historial de Compras"
                    class="p-3 text-slate-400 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">receipt_long</span>
                  </button>
                  <button
                    @click="abrirModalEdicion(prov)"
                    title="Editar Proveedor"
                    class="p-3 text-slate-400 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">edit</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="proveedoresFiltrados.length === 0">
              <td colspan="4" class="py-24 text-center">
                <span class="material-icons text-slate-200 text-5xl mb-4">local_shipping</span>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  No se encontraron proveedores
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div
        class="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
      >
        <span>Total: {{ proveedores.length }} Proveedores Registrados</span>
        <span class="text-[#06b6d4]">Mostrando: {{ proveedoresFiltrados.length }}</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL DE PROVEEDOR (CREACIÓN / EDICIÓN) -->
    <!-- ========================================== -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">
              {{ editando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
            </h2>
            <p class="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mt-1">
              Gestión de cadena de suministro
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardarProveedor" class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Nombre de la Empresa / Razón Social</label
              >
              <input
                v-model="formulario.nombre_empresa"
                required
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Contacto Principal</label
              >
              <input
                v-model="formulario.contacto_nombre"
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >NIT / Identificación</label
              >
              <input
                v-model="formulario.nit"
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Email de Contacto</label
              >
              <input
                v-model="formulario.email"
                type="email"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Teléfono</label
              >
              <input
                v-model="formulario.telefono"
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Dirección de Oficinas / Bodega</label
              >
              <textarea
                v-model="formulario.direccion"
                rows="3"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-4 pt-4 border-t border-slate-50">
            <button
              type="button"
              @click="cerrarModal"
              class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex-[2] py-4 bg-[#06b6d4] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span
                v-if="guardando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <span v-else class="material-icons text-sm">save</span>
              {{ editando ? 'Guardar Cambios' : 'Registrar Proveedor' }}
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
import { useRouter } from 'vue-router'

const router = useRouter()

// --- ESTADO ---
const proveedores = ref([])
const cargando = ref(true)
const error = ref(null)
const guardando = ref(false)

// --- FILTROS ---
const busqueda = ref('')

// --- MODAL ---
const modalAbierto = ref(false)
const editando = ref(false)
const proveedorId = ref(null)
const formulario = ref({
  nombre_empresa: '',
  contacto_nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  nit: '',
})

// --- PROPIEDADES COMPUTADAS ---

const proveedoresFiltrados = computed(() => {
  if (!Array.isArray(proveedores.value)) return []

  const search = busqueda.value.toLowerCase()
  return proveedores.value.filter((p) => {
    const matchEmpresa = (p.nombre_empresa || '').toLowerCase().includes(search)
    const matchContacto = (p.contacto_nombre || '').toLowerCase().includes(search)
    const matchNIT = (p.nit || '').toLowerCase().includes(search)
    return matchEmpresa || matchContacto || matchNIT
  })
})

// --- MÉTODOS ---

const cargarProveedores = async () => {
  try {
    cargando.value = true
    error.value = null
    const response = await api.get('/proveedores')
    proveedores.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Error cargando proveedores:', err)
    error.value = 'No se pudo establecer conexión con el servidor backend.'
  } finally {
    cargando.value = false
  }
}

const abrirModalCreacion = () => {
  editando.value = false
  proveedorId.value = null
  formulario.value = {
    nombre_empresa: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    nit: '',
  }
  modalAbierto.value = true
}

const abrirModalEdicion = (prov) => {
  editando.value = true
  proveedorId.value = prov.id
  formulario.value = { ...prov }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardarProveedor = async () => {
  try {
    guardando.value = true
    if (editando.value) {
      await api.put('/proveedores/' + proveedorId.value, formulario.value)
    } else {
      await api.post('/proveedores', formulario.value)
    }
    await cargarProveedores()
    cerrarModal()
  } catch (err) {
    alert('Error técnico al intentar guardar el proveedor.')
  } finally {
    guardando.value = false
  }
}

const irAlHistorial = (id) => {
  router.push('/proveedores/' + id + '/compras')
}

onMounted(cargarProveedores)
</script>

<style scoped>
.group:hover .material-icons {
  transform: translateY(-1px);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
