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
// CATALOGOS
// =========================================================

const metodosPago = ref([])

const ordenesActivas = ref([])

// =========================================================
// FORMULARIO MOVIMIENTO
// =========================================================

const modalRegistro = ref(false)

const formulario = ref({
  // Asociación del movimiento
  tipo_origen: 'ORDEN', // ORDEN | GENERAL
  orden_id: null,
  descripcion_general: '',

  // Datos del movimiento
  monto: null,
  tipo_movimiento: 'Ingreso',
  categoria_pago: 'Venta / Abono',

  // Pago
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
  if (!formulario.value.orden_id) {
    return null
  }

  return ordenesActivas.value.find((o) => o.id == formulario.value.orden_id) || null
})

const requiereOrden = computed(() => {
  return formulario.value.tipo_origen === 'ORDEN'
})

const requiereDescripcionGeneral = computed(() => {
  return formulario.value.tipo_origen === 'GENERAL'
})

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
    console.error(
      'Error cargando caja',

      err,
    )

    error.value = 'No se pudo cargar información de caja.'
  } finally {
    cargando.value = false
  }
}

// =========================================================
// APERTURA CAJA
// =========================================================

const abrirCaja = async () => {
  console.log('Entró a abrirCaja')
  try {
    procesandoCaja.value = true

    await api.post(
      '/caja/apertura',

      aperturaForm.value,
    )

    modalApertura.value = false

    await cargarDatos()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al abrir caja.')
  } finally {
    procesandoCaja.value = false
  }
}

// =========================================================
// CIERRE CAJA
// =========================================================

const cerrarCaja = async () => {
  try {
    procesandoCaja.value = true

    await api.post(
      '/caja/cierre',

      cierreForm.value,
    )

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

    // =====================================================
    // VALIDACIONES
    // =====================================================

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

    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {
      orden_id: requiereOrden.value ? formulario.value.orden_id : null,

      tipo_origen: formulario.value.tipo_origen,

      descripcion_general: requiereDescripcionGeneral.value
        ? formulario.value.descripcion_general.trim()
        : null,

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

  return new Date(fecha).toLocaleDateString(
    'es-GT',

    {
      day: '2-digit',

      month: 'short',

      year: 'numeric',
    },
  )
}

const extraerHora = (fecha) => {
  if (!fecha) return ''

  return new Date(fecha).toLocaleTimeString(
    'es-GT',

    {
      hour: '2-digit',

      minute: '2-digit',
    },
  )
}

const obtenerNombreMetodo = (pago) => {
  if (pago.metodo_pago_nombre) {
    return pago.metodo_pago_nombre
  }

  const metodo = metodosPago.value.find((item) => item.id === pago.metodo_pago_id)

  return metodo ? metodo.nombre : 'Sin especificar'
}

// =========================================================
// INICIO
// =========================================================

onMounted(cargarDatos)
</script>
<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <!-- =====================================================
         CARGANDO
    ====================================================== -->

    <div v-if="cargando" class="flex items-center justify-center h-64">
      <span class="material-icons animate-spin text-4xl text-cyan-500"> refresh </span>
    </div>

    <div v-else>
      <!-- =====================================================
           HEADER
      ====================================================== -->

      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900">Caja y Pagos</h1>

          <p class="text-sm text-slate-500 mt-1">Control de ingresos, egresos y métodos de pago</p>
        </div>

        <div class="flex gap-3">
          <button
            v-if="!cajaActual.abierta"
            @click="modalApertura = true"
            class="px-5 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm"
          >
            Abrir Caja
          </button>

          <button
            v-if="cajaActual.abierta"
            @click="modalCierre = true"
            class="px-5 py-3 rounded-2xl bg-amber-500 text-white font-black text-sm"
          >
            Cerrar Caja
          </button>

          <button
            @click="abrirModalRegistro"
            :disabled="!cajaActual.abierta"
            class="px-5 py-3 rounded-2xl bg-cyan-500 text-white font-black text-sm disabled:opacity-40"
          >
            Nuevo Movimiento
          </button>
        </div>

        <!-- ORIGEN DEL MOVIMIENTO -->

        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="
              formulario.tipo_origen = 'ORDEN'
              cambioTipoOrigen()
            "
            class="py-3 rounded-xl font-bold"
            :class="formulario.tipo_origen === 'ORDEN' ? 'bg-cyan-500 text-white' : 'bg-slate-100'"
          >
            Orden de trabajo
          </button>

          <button
            type="button"
            @click="
              formulario.tipo_origen = 'GENERAL'
              cambioTipoOrigen()
            "
            class="py-3 rounded-xl font-bold"
            :class="
              formulario.tipo_origen === 'GENERAL' ? 'bg-cyan-500 text-white' : 'bg-slate-100'
            "
          >
            Movimiento general
          </button>
        </div>
        <div v-if="requiereOrden">
          <label class="font-semibold text-slate-700"> Orden de trabajo </label>

          <select v-model="formulario.orden_id" class="w-full px-4 py-3 rounded-xl border">
            <option :value="null">Seleccione...</option>

            <option v-for="orden in ordenesActivas" :key="orden.id" :value="orden.id">
              #{{ orden.id }}
              -
              {{ orden.cliente_nombre }}
            </option>
          </select>
        </div>
        <div v-if="requiereDescripcionGeneral">
          <label class="font-semibold text-slate-700"> Descripción </label>

          <input
            v-model="formulario.descripcion_general"
            class="w-full px-4 py-3 rounded-xl border"
            placeholder="Ejemplo: Compra de café, pago de luz, retiro bancario..."
          />
        </div>
      </header>

      <!-- =====================================================
           ALERTA ERROR
      ====================================================== -->

      <div v-if="error" class="mb-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold">
        {{ error }}
      </div>

      <!-- =====================================================
           TARJETAS RESUMEN
      ====================================================== -->

      <section class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div class="bg-white rounded-3xl p-6 shadow-sm">
          <p class="text-xs uppercase font-black text-slate-400">Fondo inicial</p>

          <p class="text-3xl font-black text-slate-900 mt-2">
            Q {{ Number(stats.fondo_inicial).toFixed(2) }}
          </p>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm">
          <p class="text-xs uppercase font-black text-slate-400">Ingresos</p>

          <p class="text-3xl font-black text-emerald-500 mt-2">
            Q {{ Number(stats.ingresos_hoy).toFixed(2) }}
          </p>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm">
          <p class="text-xs uppercase font-black text-slate-400">Egresos</p>

          <p class="text-3xl font-black text-amber-500 mt-2">
            Q {{ Number(stats.egresos_hoy).toFixed(2) }}
          </p>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm">
          <p class="text-xs uppercase font-black text-slate-400">Disponible</p>

          <p class="text-3xl font-black text-cyan-500 mt-2">Q {{ saldoDisponible.toFixed(2) }}</p>
        </div>
      </section>

      <!-- =====================================================
           ESTADO CAJA
      ====================================================== -->

      <section class="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase font-black text-slate-400">Estado actual</p>

            <p
              class="text-xl font-black mt-1"
              :class="cajaActual.abierta ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ cajaActual.abierta ? 'Caja abierta' : 'Caja cerrada' }}
            </p>
          </div>

          <div v-if="cajaActual.fecha_apertura">
            <p class="text-xs text-slate-400">Apertura</p>

            <p class="font-bold text-slate-700">
              {{ formatearFecha(cajaActual.fecha_apertura) }}
            </p>
          </div>
        </div>
      </section>

      <!-- =====================================================
           FILTROS
      ====================================================== -->

      <section class="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar referencia, cliente u orden..."
            class="flex-1 px-4 py-3 rounded-2xl border border-slate-200"
          />

          <select v-model="filtroTipo" class="px-4 py-3 rounded-2xl border border-slate-200">
            <option>Todos</option>

            <option>Ingreso</option>

            <option>Egreso</option>
          </select>
        </div>
      </section>

      <!-- =====================================================
           TABLA MOVIMIENTOS
      ====================================================== -->

      <section class="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h2 class="text-xl font-black text-slate-900">Movimientos</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left p-4 text-xs font-black uppercase text-slate-400">Fecha</th>

                <th class="text-left p-4 text-xs font-black uppercase text-slate-400">Tipo</th>

                <th class="text-left p-4 text-xs font-black uppercase text-slate-400">Método</th>

                <th class="text-left p-4 text-xs font-black uppercase text-slate-400">
                  Referencia
                </th>

                <th class="text-right p-4 text-xs font-black uppercase text-slate-400">Monto</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="pago in pagosFiltrados" :key="pago.id" class="border-t border-slate-100">
                <td class="p-4">
                  <p class="font-bold text-slate-700">
                    {{ formatearFecha(pago.fecha_pago) }}
                  </p>

                  <p class="text-xs text-slate-400">
                    {{ extraerHora(pago.fecha_pago) }}
                  </p>
                </td>

                <td class="p-4">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-black"
                    :class="
                      pago.tipo_movimiento === 'Ingreso'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    "
                  >
                    {{ pago.tipo_movimiento }}
                  </span>
                </td>

                <td class="p-4">
                  <p class="font-bold text-slate-700">
                    {{ obtenerNombreMetodo(pago) }}
                  </p>
                </td>

                <td class="p-4">
                  <p class="font-bold text-slate-700">
                    {{ pago.referencia_pago || '-' }}
                  </p>

                  <p class="text-xs text-slate-400">
                    {{ pago.nota_pago }}
                  </p>
                </td>

                <td
                  class="p-4 text-right font-black"
                  :class="
                    pago.tipo_movimiento === 'Ingreso' ? 'text-emerald-500' : 'text-amber-500'
                  "
                >
                  Q {{ Number(pago.monto).toFixed(2) }}
                </td>
              </tr>

              <tr v-if="pagosFiltrados.length === 0">
                <td colspan="5" class="p-10 text-center text-slate-400 font-bold">
                  No existen movimientos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- =====================================================
           MODAL REGISTRO MOVIMIENTO
      ====================================================== -->

      <div v-if="modalRegistro" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60" @click="cerrarModal"></div>

        <div class="relative bg-white rounded-3xl w-full max-w-xl p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black">Registrar Movimiento</h2>

            <button @click="cerrarModal" class="text-slate-400">✕</button>
          </div>

          <form @submit.prevent="guardarMovimiento" class="space-y-5">
            <!-- Tipo de movimiento -->

            <div class="flex gap-3">
              <button
                type="button"
                @click="cambiarTipoMovimiento('Ingreso')"
                class="flex-1 py-3 rounded-xl font-black"
                :class="
                  formulario.tipo_movimiento === 'Ingreso'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100'
                "
              >
                Ingreso (+)
              </button>

              <button
                type="button"
                @click="cambiarTipoMovimiento('Egreso')"
                class="flex-1 py-3 rounded-xl font-black"
                :class="
                  formulario.tipo_movimiento === 'Egreso'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100'
                "
              >
                Egreso (-)
              </button>
            </div>

            <!-- Origen del movimiento -->

            <div>
              <label class="block mb-2 font-bold text-slate-700"> Origen del movimiento </label>

              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="
                    formulario.tipo_origen = 'ORDEN'
                    cambioTipoOrigen()
                  "
                  class="py-3 rounded-xl font-bold"
                  :class="
                    formulario.tipo_origen === 'ORDEN' ? 'bg-cyan-500 text-white' : 'bg-slate-100'
                  "
                >
                  Orden de trabajo
                </button>

                <button
                  type="button"
                  @click="
                    formulario.tipo_origen = 'GENERAL'
                    cambioTipoOrigen()
                  "
                  class="py-3 rounded-xl font-bold"
                  :class="
                    formulario.tipo_origen === 'GENERAL' ? 'bg-cyan-500 text-white' : 'bg-slate-100'
                  "
                >
                  Movimiento general
                </button>
              </div>
            </div>

            <!-- Orden -->

            <div v-if="requiereOrden">
              <label class="block mb-2 font-bold text-slate-700"> Orden de trabajo </label>

              <select v-model="formulario.orden_id" class="w-full px-4 py-3 rounded-xl border">
                <option :value="null">Seleccione una orden</option>

                <option v-for="orden in ordenesActivas" :key="orden.id" :value="orden.id">
                  #{{ orden.id }}
                  -
                  {{ orden.cliente_nombre }}
                </option>
              </select>

              <div v-if="ordenSeleccionada" class="mt-3 rounded-xl bg-cyan-50 p-3 text-sm">
                <div>
                  <strong>Cliente:</strong>

                  {{ ordenSeleccionada.cliente_nombre }}
                </div>

                <div>
                  <strong>Total:</strong>

                  Q {{ Number(ordenSeleccionada.total_quetzales).toFixed(2) }}
                </div>

                <div>
                  <strong>Estado:</strong>

                  {{ ordenSeleccionada.estado }}
                </div>
              </div>
            </div>

            <!-- Movimiento General -->

            <div v-if="requiereDescripcionGeneral">
              <label class="block mb-2 font-bold text-slate-700"> Descripción </label>

              <input
                v-model="formulario.descripcion_general"
                class="w-full px-4 py-3 rounded-xl border"
                placeholder="Ejemplo: Pago de energía eléctrica, compra de café, ingreso por alquiler, etc."
              />
            </div>

            <!-- Monto -->

            <input
              v-model.number="formulario.monto"
              type="number"
              step="0.01"
              placeholder="Monto"
              class="w-full px-4 py-3 rounded-xl border"
            />

            <!-- Método -->

            <select v-model="formulario.metodo_pago_id" class="w-full px-4 py-3 rounded-xl border">
              <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
                {{ metodo.nombre }}
              </option>
            </select>

            <!-- Referencia -->

            <input
              v-model="formulario.referencia_pago"
              placeholder="Referencia"
              class="w-full px-4 py-3 rounded-xl border"
            />

            <!-- Nota -->

            <textarea
              v-model="formulario.nota_pago"
              placeholder="Nota"
              class="w-full px-4 py-3 rounded-xl border"
            ></textarea>

            <!-- Guardar -->

            <button
              type="submit"
              :disabled="guardando"
              class="w-full py-4 rounded-xl bg-cyan-500 text-white font-black"
            >
              {{ guardando ? 'Guardando...' : 'Guardar Movimiento' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- MODAL APERTURA DE CAJA -->
  <!-- ========================================================= -->

  <div v-if="modalApertura" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">Apertura de Caja</h2>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Fondo inicial </label>

          <input
            v-model.number="aperturaForm.monto_inicial"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button
          @click="modalApertura = false"
          class="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
        >
          Cancelar
        </button>

        <button
          @click="abrirCaja"
          :disabled="procesandoCaja"
          class="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {{ procesandoCaja ? 'Abriendo...' : 'Abrir Caja' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-icons {
  font-size: inherit;
  vertical-align: middle;
}

input,
select,
textarea {
  outline: none;
  transition: all 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
}

button {
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}

table {
  border-collapse: collapse;
}
</style>
