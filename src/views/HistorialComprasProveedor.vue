<template>
  <div class="w-full">
    <!-- Encabezado -->
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
              class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-amber-100"
              >Abastecimiento</span
            >
          </div>
          <h1 class="text-4xl font-black text-slate-900 leading-tight">
            {{ proveedor?.nombre_empresa || (cargando ? 'Cargando...' : 'Historial de Compras') }}
          </h1>
          <div class="flex items-center gap-4 mt-2 text-slate-500 font-medium text-sm">
            <span class="flex items-center gap-1.5">
              <span class="material-icons text-xs text-slate-400">local_shipping</span>
              NIT: {{ proveedor?.nit || 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumen de Compras -->
      <div v-if="!error && compras.length > 0" class="grid grid-cols-2 gap-4">
        <div
          class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[140px]"
        >
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
            >Inversión Total</span
          >
          <span class="text-2xl font-black text-[#06b6d4]">Q {{ totalCompras.toFixed(2) }}</span>
        </div>
        <div
          class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[140px]"
        >
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
            >Entradas</span
          >
          <span class="text-2xl font-black text-slate-900">{{ compras.length }}</span>
        </div>
      </div>
    </header>

    <!-- ESTADOS DE CARGA Y ERROR -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
        Sincronizando facturas de compra...
      </p>
    </div>

    <div
      v-else-if="error"
      class="p-16 bg-red-50 rounded-[3rem] border border-red-100 text-center shadow-sm"
    >
      <span class="material-icons text-5xl text-red-500 mb-6">cloud_off</span>
      <h3 class="text-2xl font-black text-red-900 mb-2">Error de Sincronización</h3>
      <p class="text-red-600 mb-8 max-w-md mx-auto">{{ error }}</p>
      <button
        @click="cargarDatos"
        class="bg-red-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
      >
        Reintentar Conexión
      </button>
    </div>

    <!-- LISTADO DE COMPRAS -->
    <div v-else>
      <div
        v-if="compras.length > 0"
        class="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr
                class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-100"
              >
                <th class="px-10 py-6">No. Documento</th>
                <th class="px-10 py-6">Fecha de Entrada</th>
                <th class="px-10 py-6 text-right">Monto Facturado (Q)</th>
                <th class="px-10 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="compra in compras"
                :key="compra.id"
                class="hover:bg-slate-50/30 transition-all group"
              >
                <td class="px-10 py-8">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300"
                    >
                      <span class="material-icons text-lg">description</span>
                    </div>
                    <span class="font-mono text-sm font-bold text-slate-700">{{
                      compra.documento_referencia || 'S/N'
                    }}</span>
                  </div>
                </td>
                <td class="px-10 py-8">
                  <p class="font-black text-slate-800 text-sm">
                    {{ formatearFecha(compra.fecha_entrada) }}
                  </p>
                </td>
                <td class="px-10 py-8 text-right">
                  <span
                    class="text-xl font-black text-slate-900 group-hover:text-[#06b6d4] transition-colors"
                    >Q {{ Number(compra.total_compra).toFixed(2) }}</span
                  >
                </td>
                <td class="px-10 py-8 text-center">
                  <button
                    title="Ver Detalle de Productos"
                    class="p-3 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons">inventory</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer
          class="p-8 bg-slate-50/30 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center"
        >
          Sincronizado con el Módulo de Entrada de Mercancía
        </footer>
      </div>

      <!-- ESTADO VACÍO -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-200 text-center shadow-sm"
      >
        <div
          class="w-32 h-32 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center mb-8"
        >
          <span class="material-icons text-7xl">shopping_cart_checkout</span>
        </div>
        <h3 class="text-2xl font-black text-slate-800 mb-2">Sin historial de abastecimiento</h3>
        <p class="text-slate-400 font-medium mb-10 max-w-sm mx-auto">
          Aún no has registrado entradas de mercancía para este proveedor en el sistema.
        </p>
        <router-link
          to="/entrada-mercancia"
          class="bg-[#06b6d4] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <span class="material-icons">input</span> Registrar Primera Entrada
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const compras = ref([])
const proveedor = ref(null)
const cargando = ref(true)
const error = ref(null)

const totalCompras = computed(() => {
  return compras.value.reduce((acc, c) => acc + Number(c.total_compra || 0), 0)
})

// Función principal de carga de datos
const cargarDatos = async () => {
  const proveedorId = route.params.id
  if (!proveedorId) return

  try {
    cargando.value = true
    error.value = null

    // 1. Cargar Historial de Compras (GET /api/proveedores/:id/compras)
    const resCompras = await api.get(`/proveedores/${proveedorId}/compras`)
    compras.value = Array.isArray(resCompras.data) ? resCompras.data : []

    // 2. Cargar Datos del Proveedor para el título
    const resProv = await api.get('/proveedores')
    const dataProv = resProv.data.find((p) => p.id === parseInt(proveedorId))
    if (dataProv) {
      proveedor.value = dataProv
    }
  } catch (err) {
    console.error('Error cargando historial:', err)
    error.value = 'No se pudo establecer conexión con el servidor backend.'
  } finally {
    cargando.value = false
  }
}

// CORRECCIÓN DE REACTIVIDAD: Vigilamos el cambio de ID en la URL
// Si el usuario cambia de un proveedor a otro directamente, los datos se refrescarán.
watch(
  () => route.params.id,
  (nuevoId) => {
    if (nuevoId) cargarDatos()
  },
)

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  const date = new Date(fechaStr)
  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(cargarDatos)
</script>
