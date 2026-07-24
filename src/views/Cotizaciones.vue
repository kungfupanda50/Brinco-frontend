<template>
  <div class="w-full">
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Cotizaciones</h1>
        <p class="text-slate-500 font-medium">
          Gestión de presupuestos, cobros de anticipo y conversión a órdenes de trabajo.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="cargarCotizaciones"
          class="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#06b6d4] rounded-xl transition-all shadow-sm"
        >
          <span :class="{ 'animate-spin': cargando }" class="material-icons">refresh</span>
        </button>
        <button
          @click="abrirModalCrear"
          class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span class="material-icons">add_circle</span> Nueva Cotización
        </button>
      </div>
    </header>

    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-xs">
        Cargando cotizaciones...
      </p>
    </div>

    <div v-else class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              No. Cotización
            </th>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Cliente
            </th>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Fecha
            </th>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total
            </th>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Saldo
            </th>
            <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Estado
            </th>
            <th
              class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="c in cotizaciones" :key="c.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4 font-black text-slate-800 text-sm">{{ c.numero_cotizacion }}</td>
            <td class="px-6 py-4 font-bold text-slate-700 text-sm">{{ c.cliente_nombre }}</td>
            <td class="px-6 py-4 text-sm text-slate-500">
              {{ new Date(c.fecha_creacion).toLocaleDateString('es-GT') }}
            </td>
            <td class="px-6 py-4 font-bold text-slate-700 text-sm">
              {{ c.moneda_simbolo }} {{ Number(c.total).toFixed(2) }}
            </td>
            <td
              class="px-6 py-4 font-black text-sm"
              :class="saldo(c) > 0 ? 'text-red-500' : 'text-emerald-500'"
            >
              {{ c.moneda_simbolo }} {{ saldo(c).toFixed(2) }}
            </td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                :class="estadoColor(c.estado)"
              >
                {{ c.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="reimprimir(c.id)"
                  class="p-2 text-slate-400 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  title="Reimprimir PDF"
                >
                  <span class="material-icons text-lg">picture_as_pdf</span>
                </button>

                <button
                  v-if="c.estado.toLowerCase() === 'borrador'"
                  @click="cambiarEstado(c.id, 'Aceptada')"
                  class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                  title="Aceptar Cotización"
                >
                  <span class="material-icons text-lg">check_circle</span>
                </button>

                <button
                  v-if="c.estado.toLowerCase() === 'aceptada'"
                  @click="generarOrden(c.id)"
                  class="px-3 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1"
                  title="Generar Orden de Trabajo"
                >
                  <span class="material-icons text-sm">build</span> Orden
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="cotizaciones.length === 0">
            <td
              colspan="7"
              class="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
            >
              No hay cotizaciones registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL PARA NUEVA COTIZACIÓN -->
    <!-- MODAL SELECCIÓN DE CLIENTE PARA NUEVA COTIZACIÓN -->
    <div
      v-if="mostrarModalPresupuesto && !clienteSeleccionadoId"
      class="fixed inset-0 z-[600] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="mostrarModalPresupuesto = false"
      ></div>
      <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
        <h2 class="text-2xl font-black text-slate-900 mb-6">Nueva Cotización</h2>
        <p class="text-sm text-slate-500 mb-4">Selecciona el cliente para generar la cotización:</p>

        <select
          v-model="clienteSeleccionadoId"
          class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700 mb-6"
        >
          <option :value="null" disabled>Seleccione un cliente...</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre_completo }}</option>
        </select>

        <div class="flex justify-end gap-3">
          <button
            @click="mostrarModalPresupuesto = false"
            class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL REAL DE PRESUPUESTO -->
    <Presupuesto
      v-if="mostrarModalPresupuesto && clienteSeleccionadoId"
      :cliente-id="clienteSeleccionadoId"
      :orden-id="null"
      @cerrar="cerrarModalPresupuesto"
    />
  </div>
</template>

<script setup>
import Presupuesto from './Presupuesto.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
const router = useRouter()
const cargando = ref(true)
const cotizaciones = ref([])

const cargarCotizaciones = async () => {
  try {
    cargando.value = true
    const { data } = await api.get('/presupuestos')
    cotizaciones.value = data
  } catch (err) {
    console.error(err)
    alert('Error al cargar cotizaciones')
  } finally {
    cargando.value = false
  }
}

const saldo = (c) => {
  return Number(c.total) - Number(c.total_pagado || 0)
}

const estadoColor = (estado) => {
  switch (estado) {
    case 'Borrador':
      return 'bg-slate-100 text-slate-600'
    case 'Aceptada':
      return 'bg-cyan-100 text-cyan-700'
    case 'Convertida':
      return 'bg-emerald-100 text-emerald-700'
    case 'Rechazada':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const cambiarEstado = async (id, estado) => {
  try {
    await api.patch(`/presupuestos/${id}/estado`, { estado })
    await cargarCotizaciones()
  } catch (err) {
    alert('Error al cambiar estado')
  }
}

const reimprimir = async (id) => {
  try {
    const response = await api.get(`/presupuestos/${id}/pdf`, {
      responseType: 'text',
      timeout: 60000,
    })
    const printWindow = window.open('', '_blank')
    printWindow.document.write(response.data)
    printWindow.document.close()
    printWindow.onload = function () {
      printWindow.print()
    }
  } catch (err) {
    alert('Error al generar PDF')
  }
}

const generarOrden = (id) => {
  // Usamos el enrutador de Vue en lugar de window.location
  router.push({ path: '/nueva-orden', query: { presupuesto_id: id } })
}

// NUEVAS VARIABLES PARA EL MODAL
const mostrarModalPresupuesto = ref(false)
const clienteSeleccionadoId = ref(null)
const clientes = ref([])

const abrirModalCrear = async () => {
  // Cargamos los clientes para que puedas elegir a quién cotizarle
  try {
    const { data } = await api.get('/clientes')
    clientes.value = data

    // Si solo hay un cliente o para forzar la selección, lo dejamos en null
    clienteSeleccionadoId.value = null
    mostrarModalPresupuesto.value = true
  } catch (err) {
    alert('Error al cargar clientes')
  }
}

const cerrarModalPresupuesto = () => {
  mostrarModalPresupuesto.value = false
  cargarCotizaciones() // Recargamos la tabla al cerrar
}

onMounted(cargarCotizaciones)
</script>
