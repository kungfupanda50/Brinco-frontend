<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
    >
      <div class="flex items-center gap-4">
        <button
          @click="$router.back()"
          class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-[#06b6d4] hover:border-[#06b6d4]/30 transition-all flex items-center justify-center shadow-sm group"
        >
          <span class="material-icons group-hover:-translate-x-1 transition-transform"
            >arrow_back</span
          >
        </button>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="bg-cyan-50 text-[#06b6d4] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-cyan-100"
              >Perfil del Cliente</span
            >
          </div>
          <h1 class="text-4xl font-black text-slate-900 leading-tight">
            {{ cliente?.nombre_completo || (cargando ? 'Cargando...' : 'Cliente #' + clienteId) }}
          </h1>
          <div class="flex items-center gap-4 mt-2 text-slate-500 font-medium text-sm">
            <span class="flex items-center gap-1.5">
              <span class="material-icons text-xs text-[#06b6d4]">email</span>
              {{ cliente?.email || 'N/A' }}
            </span>
            <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span class="flex items-center gap-1.5">
              <span class="material-icons text-xs text-[#06b6d4]">phone</span>
              {{ cliente?.telefono || 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumen Financiero -->
      <div v-if="!error" class="grid grid-cols-2 gap-4">
        <div
          class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[140px]"
        >
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
            >Total Invertido</span
          >
          <span class="text-2xl font-black text-[#06b6d4]">Q {{ totalInvertido.toFixed(2) }}</span>
        </div>
        <div
          class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[140px]"
        >
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
            >Órdenes Totales</span
          >
          <span class="text-2xl font-black text-slate-900">{{ ordenes.length }}</span>
        </div>
      </div>
    </header>

    <!-- Barra de Herramientas -->
    <div
      v-if="!cargando && !error && ordenes.length > 0"
      class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4"
    >
      <div class="relative flex-1 w-full">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          >search</span
        >
        <input
          v-model="busqueda"
          type="text"
          placeholder="Filtrar por notas o ID..."
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium"
        />
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <select
          v-model="filtroEstado"
          class="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Producción">En Producción</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>
    </div>

    <!-- ESTADOS DE CARGA Y ERROR -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">
        Sincronizando historial...
      </p>
    </div>

    <div
      v-else-if="error"
      class="p-16 bg-red-50 rounded-[3rem] border border-red-100 text-center shadow-sm"
    >
      <span class="material-icons text-red-500 text-5xl mb-4">cloud_off</span>
      <h3 class="text-2xl font-black text-red-900 mb-2">Error de Conexión</h3>
      <p class="text-red-600 mb-8 max-w-md mx-auto">{{ error }}</p>
      <button
        @click="cargarDatos"
        class="bg-red-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
      >
        Reintentar
      </button>
    </div>

    <!-- LISTADO DE ÓRDENES -->
    <div v-else>
      <div
        v-if="ordenesFiltradas.length > 0"
        class="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr
                class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-100"
              >
                <th class="px-10 py-6">ID / Referencia</th>
                <th class="px-10 py-6">Fecha</th>
                <th class="px-10 py-6">Estatus</th>
                <th class="px-10 py-6">Notas</th>
                <th class="px-10 py-6 text-right">Monto (Q)</th>
                <th class="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="orden in ordenesFiltradas"
                :key="orden.id"
                class="hover:bg-slate-50/30 transition-all group"
              >
                <td class="px-10 py-8">
                  <span class="font-mono text-sm font-bold text-slate-500">#{{ orden.id }}</span>
                </td>
                <td class="px-10 py-8">
                  <p class="font-black text-slate-800 text-sm leading-tight">
                    {{ formatearFecha(orden.fecha_orden) }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                    {{ haceCuanto(orden.fecha_orden) }}
                  </p>
                </td>
                <td class="px-10 py-8">
                  <span
                    :class="claseEstado(orden.estado)"
                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                  >
                    {{ orden.estado || 'Desconocido' }}
                  </span>
                </td>
                <td class="px-10 py-8">
                  <p
                    class="text-xs text-slate-600 font-medium line-clamp-2 italic max-w-xs leading-relaxed"
                  >
                    {{ orden.notas_personalizacion || 'Sin especificaciones' }}
                  </p>
                </td>
                <td class="px-10 py-8 text-right">
                  <span
                    class="text-xl font-black text-slate-900 group-hover:text-[#06b6d4] transition-colors"
                    >Q {{ Number(orden.total_quetzales || 0).toFixed(2) }}</span
                  >
                </td>
                <td class="px-10 py-8 text-right">
                  <button
                    @click="$router.push(`/ordenes`)"
                    title="Ver en Tablero"
                    class="p-3 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ESTADO VACÍO -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-200 text-center shadow-sm"
      >
        <div
          class="w-32 h-32 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center mb-8 relative"
        >
          <span class="material-icons text-7xl">history_toggle_off</span>
        </div>
        <h3 class="text-2xl font-black text-slate-800 mb-2">Sin actividad comercial</h3>
        <p class="text-slate-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          Este cliente aún no tiene registros en el taller o los filtros no coinciden.
        </p>
        <router-link
          to="/nueva-orden"
          class="bg-[#06b6d4] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <span class="material-icons">add_circle</span> Crear Primera Orden
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'

// --- ESTADO ---
const route = useRoute()
const ordenes = ref([])
const cliente = ref(null)
const cargando = ref(true)
const error = ref(null)

const busqueda = ref('')
const filtroEstado = ref('TODOS')
const clienteId = route.params.id

// --- PROPIEDADES COMPUTADAS ---

const totalInvertido = computed(() => {
  if (!Array.isArray(ordenes.value)) return 0
  return ordenes.value.reduce((acc, o) => acc + Number(o.total_quetzales || 0), 0)
})

const ordenesFiltradas = computed(() => {
  if (!Array.isArray(ordenes.value)) return []
  const search = busqueda.value.toLowerCase()

  return ordenes.value.filter((o) => {
    const id = (o.id || '').toString()
    const notas = (o.notas_personalizacion || '').toLowerCase()
    const estado = o.estado || 'Desconocido'

    const matchBusqueda = id.includes(search) || notas.includes(search)
    const matchEstado = filtroEstado.value === 'TODOS' || estado === filtroEstado.value

    return matchBusqueda && matchEstado
  })
})

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    cargando.value = true
    error.value = null

    const [resHistorial, resClientes] = await Promise.all([
      api.get(`/clientes/${clienteId}/historial`),
      api.get('/clientes'),
    ])

    ordenes.value = Array.isArray(resHistorial.data) ? resHistorial.data : []

    if (Array.isArray(resClientes.data)) {
      const dataCliente = resClientes.data.find((c) => c.id === parseInt(clienteId))
      if (dataCliente) cliente.value = dataCliente
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Fallo en la comunicación con el servidor.'
  } finally {
    cargando.value = false
  }
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  const date = new Date(fechaStr)
  if (isNaN(date.getTime())) return 'Fecha inválida'
  return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })
}

const haceCuanto = (fechaStr) => {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const dif = ahora - fecha
  const dias = Math.floor(dif / (1000 * 60 * 60 * 24))
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 30) return `Hace ${dias} días`
  return `Hace ${Math.floor(dias / 30)} meses`
}

const claseEstado = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'En Producción':
      return 'bg-cyan-50 text-[#06b6d4] border-cyan-100'
    case 'Entregado':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'Cancelado':
      return 'bg-red-50 text-red-500 border-red-100'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
