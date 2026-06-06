<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Órdenes de Trabajo</h1>
        <p class="text-slate-500 font-medium">
          Gestiona el flujo de producción, estados y reclamaciones de garantía.
        </p>
      </div>
      <div class="flex items-center gap-6">
        <!-- NUEVO: FILTRO PARA OCULTAR ENTREGADAS -->
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
            <span class="material-icons">add_circle</span>
            Nueva Orden
          </router-link>
        </div>
      </div>
    </header>

    <!-- Estados de Carga y Error -->
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

    <div
      v-else-if="error"
      class="p-12 bg-red-50 rounded-3xl border border-red-100 text-center shadow-sm"
    >
      <span class="material-icons text-red-500 text-5xl mb-4">cloud_off</span>
      <h3 class="text-xl font-black text-red-900 mb-2">Error de Conexión</h3>
      <p class="text-red-600 mb-8">{{ error }}</p>
      <button
        @click="cargarOrdenes"
        class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
      >
        Reintentar Carga
      </button>
    </div>

    <!-- Tablero Kanban de Órdenes -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Columna: PENDIENTES -->
      <div class="flex flex-col gap-4">
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
          <div
            v-for="orden in ordenesPendientes"
            :key="orden.id"
            class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter"
                >ORD-#{{ orden.id }}</span
              >
              <span
                class="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest"
              >
                {{ formatearFecha(orden.fecha_orden) }}
              </span>
            </div>
            <h3 class="font-black text-slate-800 text-xl mb-1 leading-tight">
              {{ orden.cliente_nombre }}
            </h3>
            <p class="text-[11px] text-slate-400 font-medium line-clamp-2 mb-4 h-8 overflow-hidden">
              {{ orden.notas_personalizacion || 'Sin notas' }}
            </p>

            <div class="bg-slate-50 rounded-2xl p-4 mb-6">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Total Venta</span>
                <span class="font-black text-[#06b6d4]"
                  >Q {{ Number(orden.total_quetzales).toFixed(2) }}</span
                >
              </div>
              <div
                class="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase mt-2 pt-2 border-t border-slate-100"
              >
                <span class="material-icons text-xs">event_available</span>
                <span>Entrega: {{ formatearFecha(orden.fecha_entrega_prometida) }}</span>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-50 flex justify-end">
              <button
                @click="actualizarEstado(orden.id, 'En Producción')"
                :disabled="actualizandoId === orden.id"
                title="Mover a Producción"
                class="w-10 h-10 rounded-xl bg-cyan-50 text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
              >
                <span
                  v-if="actualizandoId === orden.id"
                  class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                ></span>
                <span v-else class="material-icons text-lg">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna: EN PRODUCCIÓN -->
      <div class="flex flex-col gap-4">
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
          <div
            v-for="orden in ordenesProduccion"
            :key="orden.id"
            class="bg-white p-6 rounded-[2rem] border-l-4 border-l-[#06b6d4] border-slate-200 shadow-sm transition-all group"
          >
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter"
                >ORD-#{{ orden.id }}</span
              >
              <span
                class="bg-cyan-50 text-[#06b6d4] text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1"
              >
                <span class="material-icons text-[10px] animate-spin">settings</span> Trabajando
              </span>
            </div>
            <h3 class="font-black text-slate-800 text-xl mb-1 leading-tight">
              {{ orden.cliente_nombre }}
            </h3>
            <p class="text-[11px] text-slate-400 font-medium line-clamp-2 mb-4 h-8 overflow-hidden">
              {{ orden.notas_personalizacion || 'Sin notas' }}
            </p>

            <div class="flex flex-col gap-2 mb-6">
              <div class="flex items-center gap-1 text-slate-400 text-[9px] font-black uppercase">
                <span class="material-icons text-xs">calendar_today</span> Creación:
                {{ formatearFecha(orden.fecha_orden) }}
              </div>
              <div class="flex items-center gap-1 text-[#06b6d4] text-[9px] font-black uppercase">
                <span class="material-icons text-xs">event_available</span> Prometida:
                {{ formatearFecha(orden.fecha_entrega_prometida) }}
              </div>
            </div>

            <div class="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                <span class="text-sm font-black text-slate-700"
                  >Q {{ Number(orden.total_quetzales).toFixed(2) }}</span
                >
              </div>
              <div class="flex gap-2">
                <button
                  @click="actualizarEstado(orden.id, 'Pendiente')"
                  :disabled="actualizandoId === orden.id"
                  title="Regresar a Pendiente"
                  class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <span class="material-icons text-lg">undo</span>
                </button>
                <button
                  @click="actualizarEstado(orden.id, 'Listo para Envío')"
                  :disabled="actualizandoId === orden.id"
                  title="Marcar como Listo"
                  class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <span
                    v-if="actualizandoId === orden.id"
                    class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                  ></span>
                  <span v-else class="material-icons text-lg">check_circle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna: FINALIZADAS / GARANTÍAS -->
      <div class="flex flex-col gap-4">
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
          <div
            v-for="orden in ordenesFinalizadas"
            :key="orden.id"
            :class="orden.estado === 'Entregado' ? 'opacity-75' : ''"
            class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-t-4 border-t-emerald-500"
          >
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-mono text-slate-400 tracking-tighter"
                >ORD-#{{ orden.id }}</span
              >
              <span
                class="bg-emerald-50 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1"
              >
                <span class="material-icons text-[10px]">task_alt</span> {{ orden.estado }}
              </span>
            </div>
            <h3 class="font-black text-slate-800 text-lg mb-1">{{ orden.cliente_nombre }}</h3>
            <p
              class="text-[11px] text-slate-400 font-medium line-clamp-2 mb-4 h-8 overflow-hidden italic"
            >
              {{ orden.notas_personalizacion || 'Sin notas adicionales' }}
            </p>

            <div class="flex flex-col gap-1 mb-4 text-[9px] font-bold text-slate-400 uppercase">
              <span>Inicio: {{ formatearFecha(orden.fecha_orden) }}</span>
              <span>Entrega: {{ formatearFecha(orden.fecha_entrega_prometida) }}</span>
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-slate-50">
              <p class="font-black text-slate-900 text-xl">
                Q {{ Number(orden.total_quetzales).toFixed(2) }}
              </p>

              <div class="flex gap-2">
                <button
                  @click="actualizarEstado(orden.id, 'En Producción')"
                  :disabled="actualizandoId === orden.id"
                  title="Reclamar Garantía / Regresar a Producción"
                  class="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all disabled:opacity-50"
                >
                  <span class="material-icons text-xs">settings_backup_restore</span>
                  Garantía
                </button>

                <button
                  v-if="orden.estado !== 'Entregado'"
                  @click="actualizarEstado(orden.id, 'Entregado')"
                  :disabled="actualizandoId === orden.id"
                  class="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {{ actualizandoId === orden.id ? '...' : 'Entregado' }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="ordenesFinalizadas.length === 0" class="py-12 text-center text-slate-300">
            <span class="material-icons text-4xl mb-2 opacity-20">inventory_2</span>
            <p class="text-[10px] font-black uppercase tracking-widest">
              No hay órdenes para mostrar
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- ESTADO ---
const ordenes = ref([])
const cargando = ref(true)
const error = ref(null)
const actualizandoId = ref(null)
const ocultarEntregadas = ref(true) // NUEVO: Filtro activo por defecto

// --- MÉTODOS ---

const cargarOrdenes = async () => {
  try {
    cargando.value = true
    error.value = null
    const response = await api.get('/ordenes')
    ordenes.value = response.data
  } catch (err) {
    console.error('Error en conexión API:', err)
    error.value = 'No se pudo obtener el listado de órdenes.'
  } finally {
    cargando.value = false
  }
}

const actualizarEstado = async (id, nuevoEstado) => {
  try {
    actualizandoId.value = id
    await api.patch('/ordenes/' + id + '/estado', { estado: nuevoEstado })
    await cargarOrdenes()
  } catch (err) {
    alert('Error al intentar cambiar el estado de la orden.')
  } finally {
    actualizandoId.value = null
  }
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  const date = new Date(fechaStr)
  return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })
}

// --- PROPIEDADES COMPUTADAS ---

const ordenesPendientes = computed(() => ordenes.value.filter((o) => o.estado === 'Pendiente'))
const ordenesProduccion = computed(() => ordenes.value.filter((o) => o.estado === 'En Producción'))

const ordenesFinalizadas = computed(() => {
  const estadosFinales = ['Listo para Envío', 'Enviado', 'Entregado']
  let finalizadas = ordenes.value.filter((o) => estadosFinales.includes(o.estado))

  // NUEVO: Lógica de filtrado dinámico
  if (ocultarEntregadas.value) {
    finalizadas = finalizadas.filter((o) => o.estado !== 'Entregado')
  }

  return finalizadas
})

onMounted(cargarOrdenes)
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Checkbox Custom Styles */
input[type='checkbox']:checked + span {
  transform: translate(-50%, -50%) scale(1);
}
</style>
