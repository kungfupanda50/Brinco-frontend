<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
    >
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Clientes</h1>
        <p class="text-slate-500 font-medium">
          Administra tu cartera de clientes, historial de pedidos y datos de facturación.
        </p>
      </div>
      <button
        @click="abrirModalCreacion"
        class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span class="material-icons">person_add</span> Añadir Cliente
      </button>
    </header>

    <!-- Barra de Búsqueda y Filtros Dinámicos -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
        <div class="relative flex-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >search</span
          >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre, email o NIT..."
            class="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#06b6d4]/10 outline-none text-sm transition-all shadow-inner"
          />
        </div>
        <div class="flex gap-3">
          <select
            v-model="filtroTipo"
            class="bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.nombre">
              {{ cat.nombre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Estados de Carga y Error -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-24">
        <div
          class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
          Consultando base de datos de clientes...
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
          @click="cargarDatos"
          class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
        >
          Reintentar Carga
        </button>
      </div>

      <!-- Tabla de Clientes -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50">
            <tr
              class="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
            >
              <th class="px-8 py-5">Cliente / NIT</th>
              <th class="px-8 py-5">Contacto y Ubicación</th>
              <th class="px-8 py-5 text-center">Categoría</th>
              <th class="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="client in clientesFiltrados"
              :key="client.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center font-black text-lg shadow-sm border border-cyan-100 group-hover:scale-110 transition-transform"
                  >
                    {{ client.nombre_completo ? client.nombre_completo.charAt(0) : '?' }}
                  </div>
                  <div>
                    <p class="font-black text-slate-800 text-base leading-tight">
                      {{ client.nombre_completo || 'Sin Nombre' }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">
                      NIT: {{ client.nit || 'C/F' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                    <span class="material-icons text-xs text-[#06b6d4]">email</span>
                    {{ client.email || 'Sin correo' }}
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span class="material-icons text-xs">phone</span> {{ client.telefono || 'N/A' }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-center">
                <span
                  :class="client.color_clase || 'bg-slate-50 text-slate-400 border-slate-100'"
                  class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                >
                  {{ client.categoria_nombre || 'Individual' }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div
                  class="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="irAlHistorial(client.id)"
                    title="Historial de Órdenes"
                    class="p-3 text-slate-400 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">receipt_long</span>
                  </button>
                  <button
                    @click="abrirModalEdicion(client)"
                    title="Editar Datos"
                    class="p-3 text-slate-400 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">edit</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="clientesFiltrados.length === 0">
              <td colspan="4" class="py-24 text-center">
                <span class="material-icons text-slate-200 text-5xl mb-4">person_search</span>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  No se encontraron clientes
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
        <span>Base de Datos: {{ clientes.length }} Clientes Registrados</span>
        <div class="flex gap-4">
          <span class="text-[#06b6d4]">Mostrando: {{ clientesFiltrados.length }}</span>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL DE CLIENTE (CREACIÓN / EDICIÓN) -->
    <!-- ========================================== -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">
              {{ editando ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h2>
            <p class="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mt-1">
              Gestión de cartera comercial dinámica
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardarCliente" class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Nombre Completo / Razón Social</label
              >
              <input
                v-model="formulario.nombre_completo"
                required
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Categoría de Cliente</label
              >
              <select
                v-model="formulario.categoria_id"
                required
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              >
                <option value="" disabled>Seleccione...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
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
                required
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
                required
                type="text"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Dirección de Envío</label
              >
              <textarea
                v-model="formulario.direccion_envio"
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
              {{ editando ? 'Guardar Cambios' : 'Registrar Cliente' }}
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
const clientes = ref([])
const categorias = ref([])
const cargando = ref(true)
const error = ref(null)
const guardando = ref(false)

// --- FILTROS ---
const busqueda = ref('')
const filtroTipo = ref('TODOS')

// --- MODAL ---
const modalAbierto = ref(false)
const editando = ref(false)
const clienteId = ref(null)
const formulario = ref({
  nombre_completo: '',
  email: '',
  telefono: '',
  nit: '',
  direccion_envio: '',
  categoria_id: '',
})

// --- PROPIEDADES COMPUTADAS ---

// Lógica de filtrado con protección contra valores nulos o indefinidos (Defensive Coding)
const clientesFiltrados = computed(() => {
  if (!Array.isArray(clientes.value)) return []

  const search = busqueda.value.toLowerCase()

  return clientes.value.filter((c) => {
    // Protección contra campos nulos en la DB
    const nombre = (c.nombre_completo || '').toLowerCase()
    const email = (c.email || '').toLowerCase()
    const nit = (c.nit || '').toLowerCase()
    const categoria = c.categoria_nombre || 'Individual'

    const matchNombre = nombre.includes(search)
    const matchNIT = nit.includes(search)
    const matchEmail = email.includes(search)

    const matchTipo = filtroTipo.value === 'TODOS' || categoria === filtroTipo.value

    return (matchNombre || matchNIT || matchEmail) && matchTipo
  })
})

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    cargando.value = true
    error.value = null

    // Llamadas paralelas a los endpoints dinámicos
    const [resClientes, resCats] = await Promise.all([
      api.get('/clientes'),
      api.get('/clientes/categorias'),
    ])

    // Asegurar que siempre sean arrays incluso si el API devuelve algo inesperado
    clientes.value = Array.isArray(resClientes.data) ? resClientes.data : []
    categorias.value = Array.isArray(resCats.data) ? resCats.data : []

    console.log('✅ Clientes y Categorías cargados con éxito.')
  } catch (err) {
    console.error('Error cargando datos de clientes:', err)
    error.value = 'No se pudo establecer conexión con el servidor backend.'
  } finally {
    cargando.value = false
  }
}

const abrirModalCreacion = () => {
  editando.value = false
  clienteId.value = null
  formulario.value = {
    nombre_completo: '',
    email: '',
    telefono: '',
    nit: '',
    direccion_envio: '',
    categoria_id: '',
  }
  modalAbierto.value = true
}

const abrirModalEdicion = (client) => {
  editando.value = true
  clienteId.value = client.id
  formulario.value = { ...client }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardarCliente = async () => {
  try {
    guardando.value = true
    if (editando.value) {
      await api.put(`/clientes/${clienteId.value}`, formulario.value)
    } else {
      await api.post('/clientes', formulario.value)
    }
    await cargarDatos()
    cerrarModal()
  } catch (err) {
    alert('Error técnico al intentar guardar el cliente.')
  } finally {
    guardando.value = false
  }
}

const irAlHistorial = (id) => {
  if (!id) return
  router.push(`/clientes/${id}/historial`)
}

onMounted(cargarDatos)
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
