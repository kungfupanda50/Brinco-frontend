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

// =========================================================
// GUARDAR MOVIMIENTO
// =========================================================

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

    const metodo = metodosPago.value.find((item) => item.id === formulario.value.metodo_pago_id)

    if (metodo?.requiere_referencia && !formulario.value.referencia_pago.trim()) {
      alert('Este método de pago requiere referencia.')

      return
    }

    guardando.value = true

    await api.post(
      '/pagos',

      formulario.value,
    )

    modalRegistro.value = false

    await cargarDatos()
  } catch (err) {
    console.error(
      'Error guardando movimiento',

      err,
    )

    alert(err.response?.data?.error || 'No se pudo guardar movimiento.')
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

            <input
              v-model.number="formulario.monto"
              type="number"
              step="0.01"
              placeholder="Monto"
              class="w-full px-4 py-3 rounded-xl border"
            />

            <select v-model="formulario.metodo_pago_id" class="w-full px-4 py-3 rounded-xl border">
              <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
                {{ metodo.nombre }}
              </option>
            </select>

            <input
              v-model="formulario.referencia_pago"
              placeholder="Referencia"
              class="w-full px-4 py-3 rounded-xl border"
            />

            <textarea
              v-model="formulario.nota_pago"
              placeholder="Nota"
              class="w-full px-4 py-3 rounded-xl border"
            ></textarea>

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
