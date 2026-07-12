<template>
  <div class="w-full">
    <!-- ========================================================= -->
    <!-- ENCABEZADO -->
    <!-- ========================================================= -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span
            class="bg-cyan-50 text-[#06b6d4] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-cyan-100"
          >
            Módulo Financiero
          </span>
        </div>

        <h1 class="text-4xl font-black text-slate-900 mb-1">Caja y Pagos</h1>

        <p class="text-slate-500 font-medium">
          Control de efectivo, movimientos financieros y cierres de caja.
        </p>
      </div>

      <div class="flex gap-3">
        <!-- CAJA CERRADA -->

        <button
          v-if="!cajaActual.abierta"
          @click="modalApertura = true"
          class="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
        >
          <span class="material-icons"> lock_open </span>

          Abrir Caja
        </button>

        <!-- CAJA ABIERTA -->

        <template v-if="cajaActual.abierta">
          <button
            @click="modalRegistro = true"
            class="px-6 py-3 bg-[#06b6d4] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
          >
            <span class="material-icons"> add_circle </span>

            Registrar Movimiento
          </button>

          <button
            @click="modalCierre = true"
            class="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <span class="material-icons"> point_of_sale </span>

            Cerrar Caja
          </button>
        </template>
      </div>
    </header>

    <!-- ========================================================= -->
    <!-- ESTADO ACTUAL DE CAJA -->
    <!-- ========================================================= -->

    <div
      class="mb-10 rounded-[2rem] border p-6 flex flex-col md:flex-row justify-between gap-5"
      :class="
        cajaActual.abierta ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'
      "
    >
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center"
          :class="cajaActual.abierta ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'"
        >
          <span class="material-icons text-3xl">
            {{ cajaActual.abierta ? 'account_balance_wallet' : 'lock' }}
          </span>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Estado de Caja
          </p>

          <h2
            class="text-xl font-black"
            :class="cajaActual.abierta ? 'text-emerald-700' : 'text-slate-600'"
          >
            {{ cajaActual.abierta ? 'Caja Abierta' : 'Caja Cerrada' }}
          </h2>

          <p v-if="cajaActual.abierta" class="text-sm text-slate-500 font-medium">
            Apertura:
            {{ formatearFecha(cajaActual.fecha_apertura) }}

            - Fondo inicial: Q {{ Number(cajaActual.monto_inicial).toFixed(2) }}
          </p>
        </div>
      </div>

      <div v-if="!cajaActual.abierta" class="text-sm font-bold text-slate-500 flex items-center">
        Debe abrir una caja para registrar movimientos.
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- RESUMEN FINANCIERO -->
    <!-- ========================================================= -->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <!-- INGRESOS -->

      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div
          class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="material-icons"> trending_up </span>
        </div>

        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ingresos del Día
        </p>

        <h2 class="text-4xl font-black text-slate-900">
          Q {{ Number(stats.ingresos_hoy).toFixed(2) }}
        </h2>
      </div>

      <!-- EGRESOS -->

      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div
          class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="material-icons"> trending_down </span>
        </div>

        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Egresos del Día
        </p>

        <h2 class="text-4xl font-black text-slate-900">
          Q {{ Number(stats.egresos_hoy).toFixed(2) }}
        </h2>
      </div>

      <!-- SALDO -->

      <div class="bg-[#06b6d4] p-8 rounded-[2.5rem] shadow-xl shadow-cyan-500/20">
        <div
          class="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="material-icons"> account_balance_wallet </span>
        </div>

        <p class="text-[10px] font-black text-cyan-100 uppercase tracking-widest">
          Saldo Disponible
        </p>

        <h2 class="text-4xl font-black text-white">Q {{ saldoDisponible.toFixed(2) }}</h2>
      </div>
    </div>
    <!-- ========================================================= -->
    <!-- LISTADO DE TRANSACCIONES -->
    <!-- ========================================================= -->

    <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div
        class="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30"
      >
        <div class="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            @click="filtroTipo = 'Todos'"
            :class="filtroTipo === 'Todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'"
            class="px-6 py-2 rounded-lg text-xs font-black uppercase"
          >
            Todos
          </button>

          <button
            type="button"
            @click="cambiarTipoMovimiento('Ingreso')"
            :class="
              formulario.tipo_movimiento === 'Ingreso'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400'
            "
            class="flex-1 py-3 rounded-xl text-xs font-black uppercase"
          >
            Ingreso (+)
          </button>

          <button
            type="button"
            @click="cambiarTipoMovimiento('Egreso')"
            :class="
              formulario.tipo_movimiento === 'Egreso' ? 'bg-amber-500 text-white' : 'text-slate-400'
            "
            class="flex-1 py-3 rounded-xl text-xs font-black uppercase"
          >
            Egreso (-)
          </button>
        </div>

        <div class="relative w-full md:w-80">
          <span
            class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          >
            search
          </span>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar referencia, cliente u orden..."
            class="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-sm focus:ring-4 focus:ring-[#06b6d4]/10"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]"
          >
            <tr>
              <th class="px-10 py-6">Fecha / Hora</th>

              <th class="px-10 py-6">Concepto</th>

              <th class="px-10 py-6 text-center">Método</th>

              <th class="px-10 py-6 text-right">Monto</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-50">
            <tr v-for="pago in pagosFiltrados" :key="pago.id" class="hover:bg-slate-50/40">
              <td class="px-10 py-8">
                <p class="font-black text-slate-800 text-sm">
                  {{ formatearFecha(pago.fecha_pago) }}
                </p>

                <p class="text-xs text-slate-400">
                  {{ extraerHora(pago.fecha_pago) }}
                </p>
              </td>

              <td class="px-10 py-8">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-1 rounded text-[9px] font-black"
                      :class="
                        pago.tipo_movimiento === 'Ingreso'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      "
                    >
                      {{ pago.tipo_movimiento }}
                    </span>

                    <span class="font-black text-slate-700">
                      {{ pago.categoria_pago }}
                    </span>
                  </div>

                  <p class="text-xs text-slate-500">
                    <span v-if="pago.orden_num"> Orden #BC-{{ pago.orden_num }} </span>

                    <span v-else> Movimiento directo </span>

                    <span v-if="pago.cliente_nombre"> • {{ pago.cliente_nombre }} </span>
                  </p>

                  <p v-if="pago.nota_pago" class="text-[10px] italic text-slate-400">
                    "{{ pago.nota_pago }}"
                  </p>
                </div>
              </td>

              <td class="px-10 py-8 text-center">
                <span class="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black">
                  {{ obtenerNombreMetodo(pago) }}
                </span>
              </td>

              <td
                class="px-10 py-8 text-right text-xl font-black"
                :class="pago.tipo_movimiento === 'Ingreso' ? 'text-emerald-600' : 'text-amber-600'"
              >
                Q {{ Number(pago.monto).toFixed(2) }}
              </td>
            </tr>

            <tr v-if="pagosFiltrados.length === 0">
              <td colspan="4" class="py-32 text-center text-slate-300">
                <span class="material-icons text-6xl opacity-20"> history_toggle_off </span>

                <p class="text-xs font-black uppercase">Sin movimientos registrados</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL APERTURA DE CAJA -->
    <!-- ========================================================= -->

    <div v-if="modalApertura" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        @click="modalApertura = false"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      ></div>

      <div class="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
        <h2 class="text-2xl font-black mb-6">Apertura de Caja</h2>

        <label class="text-xs font-black text-slate-400 uppercase"> Fondo inicial </label>

        <input
          v-model.number="aperturaForm.monto_inicial"
          type="number"
          step="0.01"
          class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-2xl font-black"
        />

        <button
          @click="abrirCaja"
          :disabled="procesandoCaja"
          class="w-full mt-6 py-4 bg-emerald-500 text-white rounded-2xl font-black"
        >
          {{ procesandoCaja ? 'PROCESANDO...' : 'ABRIR CAJA' }}
        </button>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL CIERRE DE CAJA -->
    <!-- ========================================================= -->

    <div v-if="modalCierre" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="modalCierre = false" class="absolute inset-0 bg-slate-900/60"></div>

      <div class="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
        <h2 class="text-2xl font-black mb-6">Cierre de Caja</h2>

        <label class="text-xs font-black text-slate-400 uppercase"> Efectivo contado </label>

        <input
          v-model.number="cierreForm.monto_real"
          type="number"
          step="0.01"
          class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-2xl font-black"
        />

        <textarea
          v-model="cierreForm.observaciones"
          rows="3"
          placeholder="Observaciones..."
          class="w-full mt-4 px-5 py-3 bg-slate-50 rounded-2xl"
        ></textarea>

        <button
          @click="cerrarCaja"
          :disabled="procesandoCaja"
          class="w-full mt-6 py-4 bg-amber-500 text-white rounded-2xl font-black"
        >
          {{ procesandoCaja ? 'CERRANDO...' : 'CONFIRMAR CIERRE' }}
        </button>
      </div>
    </div>
    <!-- ========================================================= -->
    <!-- MODAL REGISTRAR MOVIMIENTO -->
    <!-- ========================================================= -->

    <div v-if="modalRegistro" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <!-- HEADER -->

        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Registrar Movimiento</h2>

            <p class="text-xs font-bold text-[#06b6d4] uppercase mt-1">Caja operativa</p>
          </div>

          <button @click="cerrarModal" class="text-slate-400 hover:text-slate-700">
            <span class="material-icons"> close </span>
          </button>
        </header>

        <form @submit.prevent="guardarMovimiento" class="p-8 space-y-6">
          <!-- TIPO MOVIMIENTO -->

          <div class="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              @click="
                formulario.tipo_movimiento = 'Ingreso'
                formulario.categoria_pago = 'Venta / Abono'
              "
              :class="
                formulario.tipo_movimiento === 'Ingreso'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400'
              "
              class="flex-1 py-3 rounded-xl text-xs font-black uppercase"
            >
              Ingreso (+)
            </button>

            <button
              type="button"
              @click="
                formulario.tipo_movimiento = 'Egreso'
                formulario.categoria_pago = 'Gasto / Devolución'
              "
              :class="
                formulario.tipo_movimiento === 'Egreso'
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-400'
              "
              class="flex-1 py-3 rounded-xl text-xs font-black uppercase"
            >
              Egreso (-)
            </button>
          </div>

          <!-- MONTO -->

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase"> Monto (Q) </label>

            <input
              v-model.number="formulario.monto"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full mt-2 px-6 py-4 bg-slate-50 rounded-2xl text-3xl font-black"
            />
          </div>

          <!-- ORDEN -->

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase"> Vincular Orden </label>

            <select
              v-model="formulario.orden_id"
              class="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl font-bold"
            >
              <option value="">Movimiento sin orden</option>

              <option v-for="orden in ordenesActivas" :key="orden.id" :value="orden.id">
                #BC-{{ orden.id }}

                -

                {{ orden.cliente_nombre }}

                (Q {{ Number(orden.total_quetzales).toFixed(2) }})
              </option>
            </select>
          </div>

          <!-- METODO PAGO -->

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase"> Método de Pago </label>

            <select
              v-model.number="formulario.metodo_pago_id"
              required
              class="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl font-bold"
            >
              <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
                {{ metodo.nombre }}
              </option>
            </select>
          </div>

          <!-- REFERENCIA -->

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase"> Referencia </label>

            <input
              v-model="formulario.referencia_pago"
              type="text"
              placeholder="Boleta, voucher, autorización..."
              class="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl font-bold"
            />
          </div>

          <!-- NOTAS -->

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase"> Observaciones </label>

            <textarea
              v-model="formulario.nota_pago"
              rows="3"
              placeholder="Detalle del movimiento..."
              class="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl resize-none"
            ></textarea>
          </div>

          <!-- BOTON -->

          <button
            type="submit"
            :disabled="guardando"
            class="w-full py-5 bg-slate-900 text-white rounded-3xl font-black flex justify-center items-center gap-3 disabled:opacity-50"
          >
            <span
              v-if="guardando"
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>

            <span v-else class="material-icons"> check_circle </span>

            {{ guardando ? 'GUARDANDO...' : 'CONFIRMAR MOVIMIENTO' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// =========================================================
// ESTADO GENERAL
// =========================================================

const cargando = ref(true)
const guardando = ref(false)
const procesandoCaja = ref(false)
const error = ref(null)

// =========================================================
// ESTADO DE CAJA
// =========================================================

const cajaActual = ref({
  abierta: false,
  id: null,
  nombre: '',
  fecha_apertura: null,
  monto_inicial: 0,
})

const modalApertura = ref(false)
const modalCierre = ref(false)

const aperturaForm = ref({
  monto_inicial: 0,
})

const cierreForm = ref({
  monto_real: 0,
  observaciones: '',
})

// =========================================================
// MOVIMIENTOS
// =========================================================

const transacciones = ref([])

const stats = ref({
  ingresos_hoy: 0,
  egresos_hoy: 0,
  fondo_inicial: 0,
})

// =========================================================
// CATÁLOGOS
// =========================================================

const metodosPago = ref([])
const ordenesActivas = ref([])

// =========================================================
// FORMULARIO MOVIMIENTO
// =========================================================

const modalRegistro = ref(false)

const formulario = ref({
  orden_id: '',
  monto: null,
  tipo_movimiento: 'Ingreso',
  categoria_pago: 'Venta / Abono',
  metodo_pago_id: null,
  referencia_pago: '',
  nota_pago: '',
})

// =========================================================
// FILTROS
// =========================================================

const busqueda = ref('')
const filtroTipo = ref('Todos')

// =========================================================
// COMPUTADAS
// =========================================================

const saldoDisponible = computed(() => {
  return (
    Number(stats.value.fondo_inicial || 0) +
    Number(stats.value.ingresos_hoy || 0) -
    Number(stats.value.egresos_hoy || 0)
  )
})

const pagosFiltrados = computed(() => {
  if (!Array.isArray(transacciones.value)) {
    return []
  }

  const texto = busqueda.value.toLowerCase()

  return transacciones.value.filter((pago) => {
    const coincideTipo = filtroTipo.value === 'Todos' || pago.tipo_movimiento === filtroTipo.value

    const coincideBusqueda =
      String(pago.referencia_pago || '')
        .toLowerCase()
        .includes(texto) ||
      String(pago.nota_pago || '')
        .toLowerCase()
        .includes(texto) ||
      String(pago.cliente_nombre || '')
        .toLowerCase()
        .includes(texto) ||
      String(pago.orden_num || '').includes(texto)

    return coincideTipo && coincideBusqueda
  })
})

// =========================================================
// CARGA PRINCIPAL
// =========================================================

const cargarDatos = async () => {
  try {
    cargando.value = true
    error.value = null

    const [resCaja, resResumen, resPagos, resOrdenes, resMetodos] = await Promise.all([
      api.get('/caja/abierta'),

      api.get('/caja/resumen'),

      api.get('/pagos'),

      api.get('/ordenes'),

      api.get('/catalogos/metodos-pago'),
    ])

    cajaActual.value = resCaja.data

    stats.value = resResumen.data

    transacciones.value = Array.isArray(resPagos.data) ? resPagos.data : []

    ordenesActivas.value = resOrdenes.data.filter((orden) => orden.estado !== 'Cancelado')

    metodosPago.value = Array.isArray(resMetodos.data) ? resMetodos.data : []

    // Selección inicial del primer método disponible

    if (metodosPago.value.length && !formulario.value.metodo_pago_id) {
      formulario.value.metodo_pago_id = metodosPago.value[0].id
    }
  } catch (err) {
    console.error('Error cargando módulo caja:', err)

    error.value = 'No se pudo cargar la información de caja.'
  } finally {
    cargando.value = false
  }
}

// =========================================================
// APERTURA DE CAJA
// =========================================================

const abrirCaja = async () => {
  try {
    if (aperturaForm.value.monto_inicial === null || aperturaForm.value.monto_inicial < 0) {
      alert('Ingrese un monto inicial válido.')

      return
    }

    procesandoCaja.value = true

    await api.post('/caja/apertura', aperturaForm.value)

    modalApertura.value = false

    aperturaForm.value = {
      monto_inicial: 0,
    }

    await cargarDatos()
  } catch (err) {
    console.error('Error apertura caja:', err)

    alert(err.response?.data?.error || 'No se pudo abrir la caja.')
  } finally {
    procesandoCaja.value = false
  }
}

// =========================================================
// CIERRE DE CAJA
// =========================================================

const cerrarCaja = async () => {
  try {
    if (cierreForm.value.monto_real === null || cierreForm.value.monto_real < 0) {
      alert('Ingrese el monto contado.')

      return
    }

    procesandoCaja.value = true

    await api.post('/caja/cierre', cierreForm.value)

    modalCierre.value = false

    cierreForm.value = {
      monto_real: 0,
      observaciones: '',
    }

    await cargarDatos()
  } catch (err) {
    console.error('Error cierre caja:', err)

    alert(err.response?.data?.error || 'No se pudo cerrar la caja.')
  } finally {
    procesandoCaja.value = false
  }
}

// =========================================================
// REGISTRO DE MOVIMIENTO
// =========================================================

const abrirModalRegistro = () => {
  formulario.value = {
    orden_id: '',

    monto: null,

    tipo_movimiento: 'Ingreso',

    categoria_pago: 'Venta / Abono',

    metodo_pago_id: metodosPago.value.length ? metodosPago.value[0].id : null,

    referencia_pago: '',

    nota_pago: '',
  }

  modalRegistro.value = true
}

const cerrarModal = () => {
  modalRegistro.value = false
}

const cambiarTipoMovimiento = (tipo) => {
  formulario.value.tipo_movimiento = tipo

  formulario.value.categoria_pago = tipo === 'Ingreso' ? 'Venta / Abono' : 'Gasto / Devolución'
}

const guardarMovimiento = async () => {
  try {
    if (!cajaActual.value.abierta) {
      alert('Debe abrir una caja antes de registrar movimientos.')

      return
    }

    if (!formulario.value.monto || formulario.value.monto <= 0) {
      alert('Ingrese un monto válido.')

      return
    }

    if (!formulario.value.metodo_pago_id) {
      alert('Seleccione un método de pago.')

      return
    }

    const metodo = metodosPago.value.find((m) => m.id === formulario.value.metodo_pago_id)

    if (metodo?.requiere_referencia && !formulario.value.referencia_pago.trim()) {
      alert('Este método requiere referencia.')

      return
    }

    guardando.value = true

    await api.post('/pagos', formulario.value)

    await cargarDatos()

    cerrarModal()
  } catch (err) {
    console.error('Error guardando movimiento:', err)

    alert(err.response?.data?.error || 'Error al registrar movimiento.')
  } finally {
    guardando.value = false
  }
}

// =========================================================
// UTILIDADES
// =========================================================

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'

  return new Date(fecha).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const extraerHora = (fecha) => {
  if (!fecha) return ''

  return new Date(fecha).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const obtenerNombreMetodo = (pago) => {
  if (pago.metodo_pago_nombre) {
    return pago.metodo_pago_nombre
  }

  const metodo = metodosPago.value.find((m) => m.id === pago.metodo_pago_id)

  return metodo ? metodo.nombre : 'Sin especificar'
}

// =========================================================
// INICIO
// =========================================================

onMounted(cargarDatos)
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
