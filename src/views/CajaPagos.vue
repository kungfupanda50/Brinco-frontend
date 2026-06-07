<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span
            class="bg-cyan-50 text-[#06b6d4] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-cyan-100"
            >Módulo Financiero</span
          >
        </div>
        <h1 class="text-4xl font-black text-slate-900 mb-1">Caja y Pagos</h1>
        <p class="text-slate-500 font-medium">
          Control de flujo de efectivo, abonos de clientes y gastos operativos.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="abrirModalRegistro"
          class="px-6 py-3 bg-[#06b6d4] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <span class="material-icons">add_circle</span> Registrar Pago
        </button>
      </div>
    </header>

    <!-- Resumen Financiero -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <!-- Ingresos -->
      <div
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6"
          >
            <span class="material-icons text-2xl">trending_up</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ingresos del Día
          </p>
          <h2 class="text-4xl font-black text-slate-900">
            Q {{ Number(stats.ingresos_hoy).toFixed(2) }}
          </h2>
        </div>
      </div>

      <!-- Egresos -->
      <div
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6"
          >
            <span class="material-icons text-2xl">trending_down</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Egresos del Día
          </p>
          <h2 class="text-4xl font-black text-slate-900">
            Q {{ Number(stats.egresos_hoy).toFixed(2) }}
          </h2>
        </div>
      </div>

      <!-- Saldo Actual -->
      <div
        class="bg-[#06b6d4] p-8 rounded-[2.5rem] shadow-xl shadow-cyan-500/20 relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md"
          >
            <span class="material-icons text-2xl">account_balance_wallet</span>
          </div>
          <p class="text-[10px] font-black text-cyan-100 uppercase tracking-widest mb-1">
            Saldo Disponible (Caja + Fondo)
          </p>
          <h2 class="text-4xl font-black text-white">Q {{ saldoDisponible.toFixed(2) }}</h2>
        </div>
      </div>
    </div>

    <!-- Listado de Transacciones -->
    <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div
        class="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30"
      >
        <div class="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            @click="filtroTipo = 'Todos'"
            :class="filtroTipo === 'Todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'"
            class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all"
          >
            Todos
          </button>
          <button
            @click="filtroTipo = 'Ingreso'"
            :class="
              filtroTipo === 'Ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
            "
            class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all"
          >
            Ingresos
          </button>
        </div>

        <div class="relative w-full md:w-80">
          <span
            class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            >search</span
          >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar referencia o nota..."
            class="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-sm focus:ring-4 focus:ring-[#06b6d4]/10 transition-all shadow-inner"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] border-b border-slate-100"
          >
            <tr>
              <th class="px-10 py-6">Fecha / Hora</th>
              <th class="px-10 py-6">Concepto / Vínculo</th>
              <th class="px-10 py-6 text-center">Método</th>
              <th class="px-10 py-6 text-right">Monto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="pago in pagosFiltrados"
              :key="pago.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-10 py-8">
                <p class="font-black text-slate-800 text-sm">
                  {{ formatearFecha(pago.fecha_pago) }}
                </p>
                <p class="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  {{ extraerHora(pago.fecha_pago) }}
                </p>
              </td>
              <td class="px-10 py-8">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span
                      :class="
                        pago.tipo_movimiento === 'Ingreso'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      "
                      class="px-2 py-0.5 rounded text-[8px] font-black border border-current"
                    >
                      {{ pago.tipo_movimiento }}
                    </span>
                    <p class="font-black text-slate-700 text-sm">{{ pago.categoria_pago }}</p>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">
                    {{ pago.orden_num ? 'Orden #BC-' + pago.orden_num : 'Ingreso Directo' }}
                    <span v-if="pago.cliente_nombre" class="text-slate-400"
                      >• {{ pago.cliente_nombre }}</span
                    >
                  </p>
                  <p
                    v-if="pago.nota_pago"
                    class="text-[10px] text-slate-400 italic mt-1 font-medium"
                  >
                    "{{ pago.nota_pago }}"
                  </p>
                </div>
              </td>
              <td class="px-10 py-8 text-center">
                <span
                  class="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-600 border border-slate-100"
                >
                  {{ pago.metodo_pago }}
                </span>
              </td>
              <td
                :class="pago.tipo_movimiento === 'Ingreso' ? 'text-emerald-600' : 'text-amber-600'"
                class="px-10 py-8 text-right font-black text-xl"
              >
                Q {{ Number(pago.monto).toFixed(2) }}
              </td>
            </tr>
            <tr v-if="pagosFiltrados.length === 0">
              <td colspan="4" class="py-32 text-center text-slate-300">
                <span class="material-icons text-7xl mb-4 opacity-10">history_toggle_off</span>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">
                  Sin transacciones registradas
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: REGISTRAR MOVIMIENTO -->
    <div v-if="modalRegistro" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Registrar Pago</h2>
            <p class="text-xs font-bold text-[#06b6d4] uppercase mt-1">
              Sincronización Corregida VUE
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardarMovimiento" class="p-8 space-y-6">
          <div class="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              @click="formulario.tipo_movimiento = 'Ingreso'"
              :class="
                formulario.tipo_movimiento === 'Ingreso'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-400'
              "
              class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
            >
              Ingreso (+)
            </button>
            <button
              type="button"
              @click="formulario.tipo_movimiento = 'Egreso'"
              :class="
                formulario.tipo_movimiento === 'Egreso'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-400'
              "
              class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
            >
              Egreso (-)
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Monto (Q)</label
              >
              <input
                v-model.number="formulario.monto"
                required
                type="number"
                step="0.01"
                class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-3xl text-slate-700 outline-none focus:ring-4 focus:ring-[#06b6d4]/10"
                placeholder="0.00"
              />
            </div>

            <!-- Vínculo a Orden (CORREGIDO: Incluye órdenes entregadas) -->
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Vincular a Orden</label
              >
              <select
                v-model="formulario.orden_id"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#06b6d4]/10"
              >
                <option value="">
                  {{ cargandoOrdenes ? 'Cargando órdenes...' : 'Ingreso Suelto (Sin orden)' }}
                </option>
                <option v-for="o in ordenesActivas" :key="o.id" :value="o.id">
                  #BC-{{ o.id }} - {{ o.cliente_nombre }} (Q
                  {{ Number(o.total_quetzales).toFixed(2) }})
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Método</label
              >
              <select
                v-model="formulario.metodo_pago"
                required
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Referencia</label
              >
              <input
                v-model="formulario.referencia_pago"
                type="text"
                placeholder="Ej. No. Boleta"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none"
              />
            </div>

            <!-- NUEVO: Campo de Observaciones en el Modal -->
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Observaciones / Notas</label
              >
              <textarea
                v-model="formulario.nota_pago"
                rows="2"
                placeholder="Detalle adicional del movimiento..."
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#06b6d4]/10 resize-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            :disabled="guardando"
            class="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            <span
              v-if="guardando"
              class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span v-else class="material-icons">check_circle</span>
            {{ guardando ? 'GRABANDO...' : 'CONFIRMAR TRANSACCIÓN' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- ESTADO REACTIVO ---
const transacciones = ref([])
const ordenesActivas = ref([])
const cargando = ref(true)
const cargandoOrdenes = ref(false)
const guardando = ref(false)
const error = ref(null)

// Datos base de estadísticas (Contadores superiores)
const stats = ref({
  ingresos_hoy: 0,
  egresos_hoy: 0,
  fondo_inicial: 0,
})

// --- FILTROS Y FORMULARIO ---
const busqueda = ref('')
const filtroTipo = ref('Todos')
const modalRegistro = ref(false)
const formulario = ref({
  tipo_movimiento: 'Ingreso',
  monto: null,
  orden_id: '',
  metodo_pago: 'Efectivo',
  referencia_pago: '',
  nota_pago: '',
  categoria_pago: 'Venta',
})

// --- PROPIEDADES COMPUTADAS ---

const saldoDisponible = computed(() => {
  return (
    (Number(stats.value.fondo_inicial) || 0) + stats.value.ingresos_hoy - stats.value.egresos_hoy
  )
})

const pagosFiltrados = computed(() => {
  if (!Array.isArray(transacciones.value)) return []
  return transacciones.value.filter((p) => {
    const matchTipo = filtroTipo.value === 'Todos' || p.tipo_movimiento === filtroTipo.value
    const search = busqueda.value.toLowerCase()
    const matchBusqueda =
      (p.referencia_pago || '').toLowerCase().includes(search) ||
      (p.nota_pago || '').toLowerCase().includes(search) ||
      (p.cliente_nombre || '').toLowerCase().includes(search)
    return matchTipo && matchBusqueda
  })
})

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    cargando.value = true
    error.value = null

    // Llamadas paralelas a los endpoints corregidos
    const [resPagos, resResumen, resOrd] = await Promise.all([
      api.get('/pagos'),
      api.get('/caja/resumen'),
      api.get('/ordenes'),
    ])

    transacciones.value = resPagos.data
    stats.value = resResumen.data

    // CORRECCIÓN: Se cargan todas las órdenes que no estén canceladas (incluye Entregadas)
    // Esto permite registrar abonos pendientes o devoluciones.
    ordenesActivas.value = resOrd.data.filter((o) => o.estado !== 'Cancelado')

    console.log('✅ Caja sincronizada correctamente.')
  } catch (err) {
    console.error('Error sincronizando caja:', err)
    error.value = 'No se pudo sincronizar con el servidor financiero.'
  } finally {
    cargando.value = false
  }
}

const abrirModalRegistro = () => {
  formulario.value = {
    tipo_movimiento: 'Ingreso',
    monto: null,
    orden_id: '',
    metodo_pago: 'Efectivo',
    referencia_pago: '',
    nota_pago: '',
    categoria_pago: 'Venta',
  }
  modalRegistro.value = true
}

const cerrarModal = () => {
  modalRegistro.value = false
}

const guardarMovimiento = async () => {
  try {
    if (!formulario.value.monto || formulario.value.monto <= 0) {
      alert('Por favor ingresa un monto válido.')
      return
    }

    guardando.value = true

    // Definir categoría lógica según el tipo
    if (formulario.value.tipo_movimiento === 'Egreso') {
      formulario.value.categoria_pago = 'Gasto / Devolución'
    } else {
      formulario.value.categoria_pago = 'Venta / Abono'
    }

    await api.post('/pagos', formulario.value)

    // REFRESCO AUTOMÁTICO: Forzamos la recarga de toda la pantalla
    await cargarDatos()
    cerrarModal()
    console.log('✅ Transacción guardada y pantalla actualizada.')
  } catch (err) {
    console.error('Error al grabar transacción:', err)
    alert('Error técnico al intentar registrar el pago.')
  } finally {
    guardando.value = false
  }
}

const formatearFecha = (str) => {
  if (!str) return 'N/A'
  return new Date(str).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const extraerHora = (str) => {
  if (!str) return ''
  return new Date(str).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
}

onMounted(cargarDatos)
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
