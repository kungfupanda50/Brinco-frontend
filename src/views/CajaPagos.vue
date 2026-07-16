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
// ESTADO CAJA
// =========================================================
const cajaActual = ref({
  abierta: false,
  id: null,
  fecha_apertura: null,
  monto_inicial: 0,
})

const modalApertura = ref(false)
const modalCierre = ref(false)

const aperturaForm = ref({ monto_inicial: 0 })
const cierreForm = ref({ monto_real: 0, observaciones: '' })

const seleccionarOrigenOrden = () => {
  formulario.value.tipo_origen = 'ORDEN'
  cambioTipoOrigen()
}

const seleccionarOrigenGeneral = () => {
  formulario.value.tipo_origen = 'GENERAL'
  cambioTipoOrigen()
}

// =========================================================
// MOVIMIENTOS
// =========================================================
const transacciones = ref([])
const stats = ref({ ingresos_hoy: 0, egresos_hoy: 0, fondo_inicial: 0 })

// =========================================================
// CATALOGOS
// =========================================================
const metodosPago = ref([])
const ordenesActivas = ref([])

// =========================================================
// FORMULARIO MOVIMIENTO
// =========================================================
const modalRegistro = ref(false)

const formulario = ref({
  tipo_origen: 'ORDEN',
  orden_id: null,
  descripcion_general: '',
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

const ordenSeleccionada = computed(() => {
  if (!formulario.value.orden_id) return null
  return ordenesActivas.value.find((o) => o.id == formulario.value.orden_id) || null
})

const requiereOrden = computed(() => formulario.value.tipo_origen === 'ORDEN')
const requiereDescripcionGeneral = computed(() => formulario.value.tipo_origen === 'GENERAL')

const pagosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return transacciones.value.filter((pago) => {
    const coincideTipo = filtroTipo.value === 'Todos' || pago.tipo_movimiento === filtroTipo.value
    const coincideTexto =
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
    return coincideTipo && coincideTexto
  })
})

// =========================================================
// CAMBIO TIPO MOVIMIENTO
// =========================================================
const cambiarTipoMovimiento = (tipo) => {
  formulario.value.tipo_movimiento = tipo
  formulario.value.categoria_pago = tipo === 'Ingreso' ? 'Venta / Abono' : 'Gasto / Devolución'
}

// =========================================================
// CARGAR DATOS
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

    if (metodosPago.value.length && !formulario.value.metodo_pago_id) {
      formulario.value.metodo_pago_id = metodosPago.value[0].id
    }
  } catch (err) {
    console.error('Error cargando caja', err)
    error.value = 'No se pudo cargar información de caja.'
  } finally {
    cargando.value = false
  }
}

// =========================================================
// APERTURA Y CIERRE CAJA
// =========================================================
const abrirCaja = async () => {
  try {
    procesandoCaja.value = true
    await api.post('/caja/apertura', aperturaForm.value)
    modalApertura.value = false
    await cargarDatos()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al abrir caja.')
  } finally {
    procesandoCaja.value = false
  }
}

const cerrarCaja = async () => {
  try {
    procesandoCaja.value = true
    await api.post('/caja/cierre', cierreForm.value)
    modalCierre.value = false
    await cargarDatos()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al cerrar caja.')
  } finally {
    procesandoCaja.value = false
  }
}

// =========================================================
// MODAL MOVIMIENTO
// =========================================================
const abrirModalRegistro = () => {
  formulario.value = {
    tipo_origen: 'ORDEN',
    orden_id: null,
    descripcion_general: '',
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

const cambioTipoOrigen = () => {
  if (formulario.value.tipo_origen === 'GENERAL') {
    formulario.value.orden_id = null
  } else {
    formulario.value.descripcion_general = ''
  }
}

// =========================================================
// GUARDAR MOVIMIENTO
// =========================================================
const guardarMovimiento = async () => {
  try {
    if (!cajaActual.value.abierta) {
      alert('Debe abrir una caja antes de registrar movimientos.')
      return
    }
    if (!formulario.value.monto || Number(formulario.value.monto) <= 0) {
      alert('Ingrese un monto válido.')
      return
    }
    if (!formulario.value.metodo_pago_id) {
      alert('Seleccione un método de pago.')
      return
    }
    if (requiereOrden.value && !formulario.value.orden_id) {
      alert('Debe seleccionar una orden de trabajo.')
      return
    }
    if (requiereDescripcionGeneral.value && !formulario.value.descripcion_general.trim()) {
      alert('Debe indicar el motivo del ingreso o egreso.')
      return
    }

    const metodo = metodosPago.value.find((m) => m.id == formulario.value.metodo_pago_id)
    if (metodo?.requiere_referencia && !formulario.value.referencia_pago.trim()) {
      alert('Este método de pago requiere una referencia.')
      return
    }

    // PAYLOAD AJUSTADO A LOS NOMBRES DEL BACKEND
    const payload = {
      orden_id: requiereOrden.value ? formulario.value.orden_id : null,
      origen_pago: formulario.value.tipo_origen, // <-- Ajustado
      descripcion_origen: requiereDescripcionGeneral.value
        ? formulario.value.descripcion_general.trim()
        : null, // <-- Ajustado
      monto: Number(formulario.value.monto),
      tipo_movimiento: formulario.value.tipo_movimiento,
      categoria_pago: formulario.value.categoria_pago,
      metodo_pago_id: formulario.value.metodo_pago_id,
      referencia_pago: formulario.value.referencia_pago.trim() || null,
      nota_pago: formulario.value.nota_pago.trim() || null,
    }

    guardando.value = true
    await api.post('/pagos', payload)
    await cargarDatos()
    cerrarModal()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Error al registrar el movimiento.')
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
  return new Date(fecha).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
}

const obtenerNombreMetodo = (pago) => {
  if (pago.metodo_pago_nombre) return pago.metodo_pago_nombre
  const metodo = metodosPago.value.find((item) => item.id === pago.metodo_pago_id)
  return metodo ? metodo.nombre : 'Sin especificar'
}

onMounted(cargarDatos)
</script>

<template>
  <div class="w-full p-6">
    <!-- CARGANDO -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-xs">
        Cargando caja...
      </p>
    </div>

    <div v-else>
      <!-- HEADER -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-4xl font-black text-slate-900 mb-2">Caja y Pagos</h1>
          <p class="text-slate-500 font-medium">Control de ingresos, egresos y métodos de pago.</p>
        </div>
        <div class="flex gap-3">
          <button
            v-if="!cajaActual.abierta"
            @click="modalApertura = true"
            class="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            Abrir Caja
          </button>
          <button
            v-if="cajaActual.abierta"
            @click="modalCierre = true"
            class="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            Cerrar Caja
          </button>
          <button
            @click="abrirModalRegistro"
            :disabled="!cajaActual.abierta"
            class="px-6 py-3 rounded-2xl bg-[#06b6d4] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100"
          >
            Nuevo Movimiento
          </button>
        </div>
      </header>

      <!-- ALERTA ERROR -->
      <div
        v-if="error"
        class="mb-6 bg-red-50 text-red-600 p-6 rounded-[2rem] font-bold border border-red-100"
      >
        {{ error }}
      </div>

      <!-- TARJETAS RESUMEN -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">
            Fondo Inicial
          </p>
          <p class="text-3xl font-black text-slate-900 mt-2">
            Q {{ Number(stats.fondo_inicial).toFixed(2) }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">Ingresos</p>
          <p class="text-3xl font-black text-emerald-500 mt-2">
            Q {{ Number(stats.ingresos_hoy).toFixed(2) }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">Egresos</p>
          <p class="text-3xl font-black text-amber-500 mt-2">
            Q {{ Number(stats.egresos_hoy).toFixed(2) }}
          </p>
        </div>
        <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
          <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">Disponible</p>
          <p class="text-3xl font-black text-[#06b6d4] mt-2">Q {{ saldoDisponible.toFixed(2) }}</p>
        </div>
      </section>

      <!-- ESTADO CAJA -->
      <section class="bg-white rounded-[2rem] shadow-sm p-6 mb-8 border border-slate-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">
              Estado Actual
            </p>
            <p
              class="text-xl font-black mt-1"
              :class="cajaActual.abierta ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ cajaActual.abierta ? 'Caja Abierta' : 'Caja Cerrada' }}
            </p>
          </div>
          <div v-if="cajaActual.fecha_apertura" class="text-right">
            <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest">Apertura</p>
            <p class="font-bold text-slate-700">
              {{ formatearFecha(cajaActual.fecha_apertura) }} ·
              {{ extraerHora(cajaActual.fecha_apertura) }}
            </p>
          </div>
        </div>
      </section>

      <!-- FILTROS -->
      <section class="bg-white rounded-[2rem] shadow-sm p-4 mb-6 border border-slate-200">
        <div class="flex flex-col md:flex-row gap-4">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar referencia, cliente u orden..."
            class="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-medium"
          />
          <select
            v-model="filtroTipo"
            class="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
          >
            <option>Todos</option>
            <option>Ingreso</option>
            <option>Egreso</option>
          </select>
        </div>
      </section>

      <!-- TABLA MOVIMIENTOS -->
      <section class="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Fecha
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Método
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Referencia
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right"
                >
                  Monto
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="pago in pagosFiltrados"
                :key="pago.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-700 text-sm">
                    {{ formatearFecha(pago.fecha_pago) }}
                  </p>
                  <p class="text-xs text-slate-400">{{ extraerHora(pago.fecha_pago) }}</p>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    :class="
                      pago.tipo_movimiento === 'Ingreso'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{ pago.tipo_movimiento }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-700 text-sm">{{ obtenerNombreMetodo(pago) }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-700 text-sm">{{ pago.referencia_pago || '-' }}</p>
                  <p class="text-xs text-slate-400">{{ pago.nota_pago }}</p>
                </td>
                <td
                  class="px-6 py-4 text-right font-black text-sm"
                  :class="
                    pago.tipo_movimiento === 'Ingreso' ? 'text-emerald-500' : 'text-amber-500'
                  "
                >
                  Q {{ Number(pago.monto).toFixed(2) }}
                </td>
              </tr>
              <tr v-if="pagosFiltrados.length === 0">
                <td
                  colspan="5"
                  class="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
                >
                  No existen movimientos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- MODAL REGISTRO MOVIMIENTO -->
      <div v-if="modalRegistro" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="cerrarModal"></div>
        <div
          class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-slate-900">Registrar Movimiento</h2>
            <button
              @click="cerrarModal"
              class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center"
            >
              <span class="material-icons">close</span>
            </button>
          </div>

          <form @submit.prevent="guardarMovimiento" class="space-y-5">
            <div class="flex gap-3">
              <button
                type="button"
                @click="cambiarTipoMovimiento('Ingreso')"
                class="flex-1 py-3 rounded-2xl font-black text-sm transition-all"
                :class="
                  formulario.tipo_movimiento === 'Ingreso'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                Ingreso (+)
              </button>
              <button
                type="button"
                @click="cambiarTipoMovimiento('Egreso')"
                class="flex-1 py-3 rounded-2xl font-black text-sm transition-all"
                :class="
                  formulario.tipo_movimiento === 'Egreso'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                Egreso (-)
              </button>
            </div>

            <div>
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Origen del movimiento</label
              >
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="seleccionarOrigenOrden"
                  class="py-3 rounded-2xl font-bold text-sm transition-all"
                  :class="
                    formulario.tipo_origen === 'ORDEN'
                      ? 'bg-[#06b6d4] text-white'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  Orden de trabajo
                </button>
                <button
                  type="button"
                  @click="seleccionarOrigenGeneral"
                  class="py-3 rounded-2xl font-bold text-sm transition-all"
                  :class="
                    formulario.tipo_origen === 'GENERAL'
                      ? 'bg-[#06b6d4] text-white'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  Movimiento general
                </button>
              </div>
            </div>

            <div v-if="requiereOrden">
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Orden de trabajo</label
              >
              <select
                v-model="formulario.orden_id"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700"
              >
                <option :value="null">Seleccione una orden</option>
                <option v-for="orden in ordenesActivas" :key="orden.id" :value="orden.id">
                  #{{ orden.id }} - {{ orden.cliente_nombre }}
                </option>
              </select>
              <div
                v-if="ordenSeleccionada"
                class="mt-3 rounded-2xl bg-cyan-50 p-4 text-sm border border-cyan-100"
              >
                <div class="font-bold text-slate-700">
                  Cliente: {{ ordenSeleccionada.cliente_nombre }}
                </div>
                <div class="text-slate-500">
                  Total: Q {{ Number(ordenSeleccionada.total_quetzales).toFixed(2) }}
                </div>
              </div>
            </div>

            <div v-if="requiereDescripcionGeneral">
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Descripción</label
              >
              <input
                v-model="formulario.descripcion_general"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-medium"
                placeholder="Ejemplo: Pago de energía eléctrica"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Monto</label
              >
              <input
                v-model.number="formulario.monto"
                type="number"
                step="0.01"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-black text-slate-700 text-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Método de Pago</label
              >
              <select
                v-model="formulario.metodo_pago_id"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700"
              >
                <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
                  {{ metodo.nombre }}
                </option>
              </select>
            </div>

            <div>
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Referencia</label
              >
              <input
                v-model="formulario.referencia_pago"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-medium"
                placeholder="Ej: Transferencia BAC"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Nota</label
              >
              <textarea
                v-model="formulario.nota_pago"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-medium resize-none"
                rows="2"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="guardando"
              class="w-full py-4 rounded-2xl bg-[#06b6d4] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : 'Guardar Movimiento' }}
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL APERTURA DE CAJA -->
      <div v-if="modalApertura" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          @click="modalApertura = false"
        ></div>
        <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
          <h2 class="text-2xl font-black text-slate-900 mb-6">Apertura de Caja</h2>
          <div class="space-y-5">
            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2"
                >Fondo Inicial</label
              >
              <input
                v-model.number="aperturaForm.monto_inicial"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-black text-slate-700 text-lg"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button
              @click="modalApertura = false"
              class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="abrirCaja"
              :disabled="procesandoCaja"
              class="px-8 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {{ procesandoCaja ? 'Abriendo...' : 'Abrir Caja' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CIERRE DE CAJA (EL QUE FALTABA) -->
      <div v-if="modalCierre" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          @click="modalCierre = false"
        ></div>
        <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
          <h2 class="text-2xl font-black text-slate-900 mb-2">Cierre de Caja</h2>
          <p class="text-sm text-slate-500 mb-6">
            Sistema esperado:
            <span class="font-black text-slate-700">Q {{ saldoDisponible.toFixed(2) }}</span>
          </p>

          <div class="space-y-5">
            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2"
                >Monto Real en Caja</label
              >
              <input
                v-model.number="cierreForm.monto_real"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-black text-slate-700 text-lg"
                placeholder="0.00"
              />
            </div>
            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2"
                >Observaciones</label
              >
              <textarea
                v-model="cierreForm.observaciones"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-medium resize-none"
                rows="3"
                placeholder="Notas de cierre, faltantes o sobrantes..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button
              @click="modalCierre = false"
              class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="cerrarCaja"
              :disabled="procesandoCaja"
              class="px-8 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase shadow-lg shadow-amber-500/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {{ procesandoCaja ? 'Cerrando...' : 'Confirmar Cierre' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-icons {
  font-size: inherit;
  vertical-align: middle;
}
</style>
