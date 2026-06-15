<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Órdenes de Trabajo</h1>
        <p class="text-slate-500 font-medium">
          Control de producción, presupuestos rechazados y evidencias fotográficas.
        </p>
      </div>
      <div class="flex items-center gap-6">
        <!-- FILTRO: OCULTAR ENTREGADAS (Directiva Usuario) -->
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input
              v-model="ocultarEntregadas"
              type="checkbox"
              class="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-[#06b6d4] checked:border-[#06b6d4] transition-all"
            />
            <span
              class="material-icons absolute text-white text-sm scale-0 peer-checked:scale-100 transition-transform left-0.5"
              >check</span
            >
          </div>
          <span
            class="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-widest"
            >Ocultar Entregadas</span
          >
        </label>

        <div class="flex gap-3">
          <button
            @click="cargarOrdenes"
            class="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#06b6d4] rounded-xl transition-all shadow-sm"
            title="Actualizar Tablero"
          >
            <span :class="{ 'animate-spin': cargando }" class="material-icons">refresh</span>
          </button>
          <router-link
            to="/nueva-orden"
            class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span class="material-icons">add_circle</span> Nueva Orden
          </router-link>
        </div>
      </div>
    </header>

    <!-- Estados de Carga -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-xs">
        Sincronizando tablero de producción...
      </p>
    </div>

    <!-- Tablero Kanban -->
    <div v-else class="flex gap-6 overflow-x-auto pb-10 custom-scrollbar items-start">
      <!-- COLUMNA: PENDIENTES -->
      <div class="min-w-[320px] max-w-[320px] flex flex-col gap-4">
        <div class="flex items-center justify-between px-2 mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            ></div>
            <h2 class="font-black text-slate-700 uppercase tracking-wider text-sm">Pendientes</h2>
          </div>
          <span
            class="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full"
            >{{ ordenesPendientes.length }}</span
          >
        </div>
        <div class="space-y-4">
          <CardOrden
            v-for="orden in ordenesPendientes"
            :key="orden.id"
            :orden="orden"
            @mover="actualizarEstado"
            @rebajar="rebajarExistencias"
            @rechazar="rechazarPresupuesto"
            :procesando="actualizandoId === orden.id"
            column="Pendiente"
          />
        </div>
      </div>

      <!-- COLUMNA: EN PRODUCCIÓN -->
      <div class="min-w-[320px] max-w-[320px] flex flex-col gap-4">
        <div class="flex items-center justify-between px-2 mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 bg-[#06b6d4] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            ></div>
            <h2 class="font-black text-slate-700 uppercase tracking-wider text-sm">
              En Producción
            </h2>
          </div>
          <span
            class="bg-cyan-100 text-[#06b6d4] text-[10px] font-black px-2.5 py-1 rounded-full"
            >{{ ordenesProduccion.length }}</span
          >
        </div>
        <div class="space-y-4">
          <CardOrden
            v-for="orden in ordenesProduccion"
            :key="orden.id"
            :orden="orden"
            @mover="actualizarEstado"
            :procesando="actualizandoId === orden.id"
            column="En Producción"
          />
        </div>
      </div>

      <!-- COLUMNA: FINALIZADAS / ENTREGADAS -->
      <div class="min-w-[320px] max-w-[320px] flex flex-col gap-4">
        <div class="flex items-center justify-between px-2 mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            ></div>
            <h2 class="font-black text-slate-700 uppercase tracking-wider text-sm">Finalizadas</h2>
          </div>
          <span
            class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full"
            >{{ ordenesFinalizadas.length }}</span
          >
        </div>
        <div class="space-y-4">
          <CardOrden
            v-for="orden in ordenesFinalizadas"
            :key="orden.id"
            :orden="orden"
            @mover="actualizarEstado"
            @evidencias="abrirModalEvidencias"
            :procesando="actualizandoId === orden.id"
            column="Finalizadas"
          />
        </div>
      </div>

      <!-- COLUMNA: RECHAZADAS -->
      <div
        class="min-w-[320px] max-w-[320px] flex flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity"
      >
        <div class="flex items-center justify-between px-2 mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            ></div>
            <h2 class="font-black text-slate-700 uppercase tracking-wider text-sm">Rechazadas</h2>
          </div>
          <span class="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full">{{
            ordenesRechazadas.length
          }}</span>
        </div>
        <div class="space-y-4">
          <CardOrden
            v-for="orden in ordenesRechazadas"
            :key="orden.id"
            :orden="orden"
            @mover="actualizarEstado"
            :procesando="actualizandoId === orden.id"
            column="Rechazado"
          />
        </div>
      </div>
    </div>

    <!-- MODAL DE EVIDENCIAS -->
    <div v-if="modalEvidencias" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        @click="modalEvidencias = false"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      ></div>
      <div
        class="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Evidencias de Trabajo</h2>
            <p class="text-[10px] font-black text-[#06b6d4] uppercase tracking-widest mt-1">
              Órden #BC-{{ seleccionada?.id }}
            </p>
          </div>
          <button @click="modalEvidencias = false" class="material-icons text-slate-400">
            close
          </button>
        </header>
        <div class="p-8 space-y-6">
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="n in 3"
              :key="n"
              class="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group"
            >
              <input
                type="file"
                @change="(e) => manejarArchivo(e, n - 1)"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept="image/*"
              />
              <img
                v-if="fotosNuevas[n - 1]"
                :src="urlPrevia(fotosNuevas[n - 1])"
                class="w-full h-full object-cover"
              />
              <span
                v-else
                class="material-icons text-slate-300 group-hover:text-[#06b6d4] transition-colors"
                >add_a_photo</span
              >
            </div>
          </div>
          <button
            @click="subirFotos"
            :disabled="subiendo"
            class="w-full py-4 bg-[#06b6d4] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span
              v-if="subiendo"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span v-else class="material-icons text-sm">cloud_upload</span>
            {{ subiendo ? 'SUBIENDO...' : 'GUARDAR EVIDENCIAS' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import api from '../api/axios'

// --- TARJETA DE ORDEN (COMPONENT INTERNO) ---
const CardOrden = defineComponent({
  props: ['orden', 'column', 'procesando'],
  emits: ['mover', 'rebajar', 'rechazar', 'evidencias'],
  setup(props, { emit }) {
    const formatCurrency = (val) =>
      Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2 })
    const saldo = computed(
      () => Number(props.orden.total_quetzales) - Number(props.orden.total_pagado || 0),
    )
    const truncatedDesc = computed(() => {
      const desc = props.orden.notas_personalizacion || 'Sin especificaciones técnicas'
      return desc.length > 80 ? desc.substring(0, 80) + '...' : desc
    })

    return () =>
      h(
        'div',
        {
          class: [
            'bg-white p-6 rounded-[2rem] border shadow-sm transition-all group hover:shadow-md relative overflow-hidden',
            props.orden.estado === 'En Producción'
              ? 'border-l-4 border-l-[#06b6d4]'
              : 'border-slate-200',
          ],
        },
        [
          h('div', { class: 'flex justify-between items-start mb-4' }, [
            h('span', { class: 'text-[10px] font-mono text-slate-400' }, `ORD-#${props.orden.id}`),
            h('div', { class: 'flex items-center gap-1.5' }, [
              props.orden.stock_rebajado
                ? h(
                    'span',
                    {
                      class:
                        'bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded uppercase border border-emerald-100',
                    },
                    'Stock OK',
                  )
                : null,
              h(
                'span',
                { class: 'bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded' },
                new Date(props.orden.fecha_orden).toLocaleDateString('es-GT', {
                  day: '2-digit',
                  month: 'short',
                }),
              ),
            ]),
          ]),

          h(
            'h3',
            { class: 'font-black text-slate-800 text-lg mb-1 leading-tight' },
            props.orden.cliente_nombre,
          ),
          h('div', { class: 'bg-slate-50/50 rounded-xl p-3 mb-4' }, [
            h(
              'p',
              { class: 'text-[11px] text-slate-500 font-medium italic leading-relaxed' },
              truncatedDesc.value,
            ),
          ]),

          // SECCIÓN FINANCIERA (Directiva Densidad)
          h('div', { class: 'space-y-2 mb-6' }, [
            h(
              'div',
              { class: 'flex justify-between items-center text-[10px] font-bold uppercase' },
              [
                h('span', { class: 'text-slate-400' }, 'Presupuesto:'),
                h(
                  'span',
                  { class: 'text-slate-700' },
                  `Q ${formatCurrency(props.orden.total_quetzales)}`,
                ),
              ],
            ),
            h(
              'div',
              { class: 'flex justify-between items-center text-[10px] font-bold uppercase' },
              [
                h('span', { class: 'text-slate-400' }, 'Pagado:'),
                h(
                  'span',
                  { class: 'text-emerald-500' },
                  `Q ${formatCurrency(props.orden.total_pagado || 0)}`,
                ),
              ],
            ),
            h(
              'div',
              { class: 'flex justify-between items-center pt-2 border-t border-slate-100' },
              [
                h(
                  'span',
                  { class: 'text-[9px] font-black text-slate-900 uppercase tracking-widest' },
                  'Saldo:',
                ),
                h(
                  'span',
                  {
                    class: [
                      'text-sm font-black',
                      saldo.value > 0 ? 'text-red-500' : 'text-emerald-600',
                    ],
                  },
                  `Q ${formatCurrency(saldo.value)}`,
                ),
              ],
            ),
          ]),

          h('div', { class: 'flex items-center justify-between pt-4 border-t border-slate-50' }, [
            // BOTÓN ATRÁS / RECUPERAR
            props.column !== 'Pendiente'
              ? h(
                  'button',
                  {
                    onClick: () =>
                      emit(
                        'mover',
                        props.orden.id,
                        props.column === 'Finalizadas' ? 'En Producción' : 'Pendiente',
                      ),
                    class: 'p-2 text-slate-300 hover:text-slate-600',
                  },
                  [
                    h(
                      'span',
                      { class: 'material-icons' },
                      props.column === 'Rechazado' ? 'undo' : 'keyboard_arrow_left',
                    ),
                  ],
                )
              : h('div'),

            // BOTONES CENTRALES: REBAJAR O EVIDENCIAS
            props.column === 'Pendiente' && !props.orden.stock_rebajado
              ? h(
                  'button',
                  {
                    onClick: () => emit('rebajar', props.orden.id),
                    class:
                      'px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase',
                  },
                  'REBAJAR STOCK',
                )
              : props.column === 'Finalizadas'
                ? h(
                    'button',
                    {
                      onClick: () => emit('evidencias', props.orden),
                      class:
                        'flex items-center gap-1 px-3 py-2 bg-cyan-50 text-[#06b6d4] rounded-xl text-[9px] font-black uppercase border border-cyan-100',
                    },
                    [
                      h('span', { class: 'material-icons text-xs' }, 'photo_library'),
                      `Evidencias (${props.orden.total_evidencias || 0})`,
                    ],
                  )
                : null,

            // BOTÓN AVANZAR / RECHAZAR
            h('div', { class: 'flex gap-1' }, [
              props.column === 'Pendiente'
                ? h(
                    'button',
                    {
                      onClick: () => emit('rechazar', props.orden.id),
                      class: 'p-2 text-red-200 hover:text-red-500',
                    },
                    [h('span', { class: 'material-icons' }, 'close')],
                  )
                : null,

              props.column !== 'Finalizadas' && props.column !== 'Rechazado'
                ? h(
                    'button',
                    {
                      onClick: () =>
                        emit(
                          'mover',
                          props.orden.id,
                          props.column === 'Pendiente' ? 'En Producción' : 'Listo para Envío',
                        ),
                      class: 'p-2 text-[#06b6d4] hover:bg-cyan-50 rounded-xl',
                    },
                    [h('span', { class: 'material-icons' }, 'keyboard_arrow_right')],
                  )
                : props.column === 'Finalizadas' && props.orden.estado !== 'Entregado'
                  ? h(
                      'button',
                      {
                        onClick: () => emit('mover', props.orden.id, 'Entregado'),
                        class:
                          'px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase',
                      },
                      'Entregado',
                    )
                  : null,
            ]),
          ]),
        ],
      )
  },
})

// --- ESTADO PRINCIPAL ---
const ordenes = ref([])
const cargando = ref(true)
const actualizandoId = ref(null)
const ocultarEntregadas = ref(true)

// MODAL EVIDENCIAS
const modalEvidencias = ref(false)
const seleccionada = ref(null)
const fotosNuevas = ref([null, null, null])
const subiendo = ref(false)

const cargarOrdenes = async () => {
  try {
    cargando.value = true
    const response = await api.get('/ordenes')
    ordenes.value = response.data
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

const actualizarEstado = async (id, nuevoEstado) => {
  try {
    actualizandoId.value = id
    await api.patch(`/ordenes/${id}/estado`, { estado: nuevoEstado })
    await cargarOrdenes()
  } catch (err) {
    alert('Error al mover la orden.')
  } finally {
    actualizandoId.value = null
  }
}

const rechazarPresupuesto = async (id) => {
  if (!confirm('¿Rechazar esta cotización?')) return
  try {
    actualizandoId.value = id
    await api.patch(`/ordenes/${id}/estado`, { estado: 'Cancelado' }) // Mapeo seguro a la DB
    await cargarOrdenes()
  } catch (err) {
    alert('Fallo al rechazar.')
  } finally {
    actualizandoId.value = null
  }
}

const rebajarExistencias = async (id) => {
  if (!confirm('Esta acción descontará stock real. ¿Continuar?')) return
  try {
    actualizandoId.value = id
    await api.post(`/ordenes/${id}/rebajar-stock`)
    await cargarOrdenes()
  } catch (err) {
    alert(err.response?.data?.error || 'Error de stock')
  } finally {
    actualizandoId.value = null
  }
}

const abrirModalEvidencias = (orden) => {
  seleccionada.value = orden
  fotosNuevas.value = [null, null, null]
  modalEvidencias.value = true
}

const manejarArchivo = (e, index) => {
  const file = e.target.files[0]
  if (file) fotosNuevas.value[index] = file
}

const urlPrevia = (file) => URL.createObjectURL(file)

const subirFotos = async () => {
  const activas = fotosNuevas.value.filter((f) => f !== null)
  if (activas.length === 0) return

  try {
    subiendo.value = true
    const formData = new FormData()
    activas.forEach((f) => formData.append('fotos', f))
    await api.post(`/ordenes/${seleccionada.value.id}/evidencias`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await cargarOrdenes()
    modalEvidencias.value = false
  } catch (err) {
    alert('Error al subir fotos')
  } finally {
    subiendo.value = false
  }
}

const ordenesPendientes = computed(() => ordenes.value.filter((o) => o.estado === 'Pendiente'))
const ordenesProduccion = computed(() => ordenes.value.filter((o) => o.estado === 'En Producción'))
const ordenesFinalizadas = computed(() => {
  const base = ordenes.value.filter((o) =>
    ['Listo para Envío', 'Enviado', 'Entregado'].includes(o.estado),
  )
  return ocultarEntregadas.value ? base.filter((o) => o.estado !== 'Entregado') : base
})
const ordenesRechazadas = computed(() =>
  ordenes.value.filter((o) => o.estado === 'Cancelado' || o.estado === 'Rechazado'),
)

onMounted(cargarOrdenes)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
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
