<template>
  <div class="w-full">

    <!-- ENCABEZADO -->
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Panel de Control</h1>
        <p class="text-slate-500 font-medium">Bienvenido al centro operativo de Brinco Creativo.</p>
      </div>
      <div class="flex gap-3">
        <button @click="cargarDatos"
          class="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#06b6d4] rounded-xl transition-all shadow-sm">
          <span :class="{ 'animate-spin text-[#06b6d4]': cargando }" class="material-icons">sync</span>
        </button>
        <router-link to="/nueva-orden"
          class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <span class="material-icons text-xl">add_circle</span> Nueva Orden
        </router-link>
      </div>
    </header>

    <!-- ── KPIs ───────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

      <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-[#06b6d4]/30 transition-all">
        <div class="w-10 h-10 bg-cyan-50 text-[#06b6d4] rounded-2xl flex items-center justify-center mb-4">
          <span class="material-icons text-xl">assignment</span>
        </div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Órdenes Activas</p>
        <h2 class="text-3xl font-black text-slate-900">{{ stats.ordenes_activas }}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-emerald-200 transition-all">
        <div class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
          <span class="material-icons text-xl">trending_up</span>
        </div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas de Hoy</p>
        <h2 class="text-3xl font-black text-slate-900">Q {{ fmtNum(stats.ventas_hoy) }}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-rose-200 transition-all">
        <div class="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <span class="material-icons text-xl">trending_down</span>
        </div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Egresos de Hoy</p>
        <h2 class="text-3xl font-black text-rose-600">Q {{ fmtNum(stats.egresos_hoy) }}</h2>
      </div>

      <div class="bg-slate-900 p-6 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
        <div class="w-10 h-10 bg-[#06b6d4]/20 text-[#06b6d4] rounded-2xl flex items-center justify-center mb-4 border border-[#06b6d4]/30">
          <span class="material-icons text-xl">auto_graph</span>
        </div>
        <p class="text-[9px] font-black text-[#06b6d4] uppercase tracking-widest mb-1">Utilidad Estimada (Día)</p>
        <h2 class="text-3xl font-black text-white">Q {{ utilidadEstimada }}</h2>
        <p class="text-[9px] text-slate-500 mt-1">Ventas − Egresos</p>
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-[#06b6d4]/10 rounded-full blur-3xl"></div>
      </div>

      <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-red-200 transition-all">
        <div :class="stats.stock_bajo > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'"
          class="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors">
          <span class="material-icons text-xl">{{ stats.stock_bajo > 0 ? 'report_problem' : 'inventory_2' }}</span>
        </div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Crítico</p>
        <h2 :class="stats.stock_bajo > 0 ? 'text-red-600' : 'text-slate-900'"
          class="text-3xl font-black transition-colors">{{ stats.stock_bajo }}</h2>
      </div>
    </div>

    <!-- ── GRÁFICO ÚLTIMOS 7 DÍAS ─────────────────────────────────────────── -->
    <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-cyan-50 text-[#06b6d4] rounded-xl flex items-center justify-center">
            <span class="material-icons text-sm">bar_chart</span>
          </div>
          <h3 class="font-black text-slate-700 text-[10px] uppercase tracking-widest">Movimientos — Últimos 7 Días</h3>
        </div>
        <div class="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400">
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-sm bg-[#06b6d4] inline-block"></span> Ingresos
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-sm bg-rose-400 inline-block"></span> Egresos
          </span>
        </div>
      </div>

      <!-- Gráfico con eje Y y eje X mejorado -->
      <div class="flex gap-2">

        <!-- EJE Y -->
        <div class="flex flex-col justify-between items-end shrink-0 pb-8" style="height:120px">
          <span class="text-[9px] font-black text-slate-400">Q{{ escalaY[2] }}</span>
          <span class="text-[9px] font-black text-slate-400">Q{{ escalaY[1] }}</span>
          <span class="text-[9px] font-black text-slate-400">Q0</span>
        </div>

        <!-- ÁREA DEL GRÁFICO -->
        <div class="flex-1 relative">

          <!-- Líneas de referencia -->
          <div class="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            <div class="border-t border-dashed border-slate-100 w-full"></div>
            <div class="border-t border-dashed border-slate-100 w-full"></div>
            <div class="border-t border-slate-200 w-full"></div>
          </div>

          <!-- Barras -->
          <div class="flex items-end gap-1.5 relative" style="height:88px">
            <template v-if="ventasSemana.length">
              <div v-for="(dia, i) in ventasSemana" :key="i"
                   class="flex-1 flex flex-col justify-end gap-[2px] group relative">

                <!-- Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex
                            flex-col items-center z-20 pointer-events-none">
                  <div class="bg-slate-900 text-white text-[9px] font-black rounded-xl px-3 py-2 whitespace-nowrap shadow-xl">
                    <span class="text-cyan-300">▲ Q{{ fmtNum(dia.ingresos) }}</span>
                    <span v-if="dia.egresos > 0" class="text-rose-300 block">▼ Q{{ fmtNum(dia.egresos) }}</span>
                    <span class="text-slate-400 block text-[8px]">Neto: Q{{ fmtNum(dia.ingresos - dia.egresos) }}</span>
                  </div>
                  <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 shrink-0"></div>
                </div>

                <!-- Barra ingreso -->
                <div class="w-full rounded-t-md transition-all duration-500"
                     :style="{ height: barHeight(dia.ingresos) + 'px',
                               backgroundColor: dia.fecha === hoy ? '#0891b2' : '#06b6d4' }">
                </div>
                <!-- Barra egreso -->
                <div v-if="dia.egresos > 0"
                     class="w-full transition-all duration-500"
                     :style="{ height: barHeight(dia.egresos) + 'px', backgroundColor: '#fb7185' }">
                </div>
              </div>
            </template>
            <div v-else class="w-full flex items-center justify-center text-[10px] text-slate-300 font-black uppercase">
              Sin datos
            </div>
          </div>

          <!-- EJE X: día + número de día del mes -->
          <div class="flex gap-1.5 mt-2">
            <div v-for="(dia, i) in ventasSemana" :key="'x'+i"
                 class="flex-1 flex flex-col items-center"
                 :class="dia.fecha === hoy ? 'text-[#06b6d4]' : 'text-slate-400'">
              <span class="text-[9px] font-black uppercase leading-none">{{ dia.dia }}</span>
              <span class="text-[8px] font-bold leading-none mt-0.5">{{ dia.fecha.slice(8) }}</span>
              <span v-if="dia.fecha === hoy" class="w-1 h-1 rounded-full bg-[#06b6d4] mt-0.5"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── CATEGORÍAS COMPACTAS ────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

      <div class="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center">
              <span class="material-icons text-sm">groups</span>
            </div>
            <h3 class="font-black text-slate-700 text-[10px] uppercase tracking-widest">Categoría de Clientes</h3>
          </div>
          <router-link to="/clientes/categorias" class="text-[9px] font-black text-[#06b6d4] uppercase hover:underline">Gestionar</router-link>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <div v-for="cat in categoriasClientes" :key="cat.id"
            class="flex-shrink-0 min-w-[110px] p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-fuchsia-200 transition-all">
            <div class="flex items-center justify-between">
              <span :class="cat.color_clase || 'bg-slate-300'" class="w-2 h-2 rounded-full"></span>
              <span class="text-[8px] font-black text-slate-400 uppercase">Segmento</span>
            </div>
            <p class="text-xs font-black text-slate-700 truncate leading-tight">{{ cat.nombre }}</p>
            <div class="flex items-end justify-between">
              <span class="text-lg font-black text-slate-900 leading-none">{{ cat.total_clientes || 0 }}</span>
              <span class="text-[8px] font-bold text-slate-400 uppercase">Clientes</span>
            </div>
          </div>
          <div v-if="!categoriasClientes.length" class="py-3 text-[9px] text-slate-300 italic">Cargando...</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-cyan-50 text-[#06b6d4] rounded-xl flex items-center justify-center">
              <span class="material-icons text-sm">category</span>
            </div>
            <h3 class="font-black text-slate-700 text-[10px] uppercase tracking-widest">Categoría de Productos</h3>
          </div>
          <router-link to="/categorias" class="text-[9px] font-black text-[#06b6d4] uppercase hover:underline">Gestionar</router-link>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <div v-for="cat in categoriasProductos" :key="cat.id"
            class="flex-shrink-0 min-w-[110px] p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-cyan-200 transition-all">
            <div class="flex items-center justify-between">
              <span :class="cat.color_clase || 'bg-cyan-500'"
                class="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm">
                <span class="material-icons text-xs">{{ cat.icono || 'category' }}</span>
              </span>
              <span class="text-[8px] font-black text-slate-400 uppercase">Catálogo</span>
            </div>
            <p class="text-xs font-black text-slate-700 truncate leading-tight">{{ cat.nombre }}</p>
            <div class="flex items-end justify-between">
              <span class="text-lg font-black text-slate-900 leading-none">{{ cat.total_productos || 0 }}</span>
              <span class="text-[8px] font-bold text-slate-400 uppercase">Items</span>
            </div>
          </div>
          <div v-if="!categoriasProductos.length" class="py-3 text-[9px] text-slate-300 italic">Cargando...</div>
        </div>
      </div>
    </div>

    <!-- ── TABLA ACTIVIDAD + STOCK ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div class="p-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-3 bg-slate-50/30">
          <div class="flex items-center gap-3">
            <span class="material-icons text-slate-400 text-sm">history</span>
            <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">Actividad Reciente y Taller</h3>
          </div>
          <div class="flex items-center gap-3">
            <select v-model="filtroEstado"
              class="text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#06b6d4] cursor-pointer">
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Producción">En Producción</option>
              <option value="Listo para Envío">Listo para Envío</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <router-link to="/ordenes"
              class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline whitespace-nowrap">
              Ver Tablero
            </router-link>
          </div>
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 text-[9px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th class="px-6 py-4">Orden / Cliente</th>
                <th class="px-4 py-4">Estado</th>
                <th class="px-4 py-4 text-center">Evidencias</th>
                <th class="px-4 py-4 text-center">Tags</th>
                <th class="px-4 py-4 text-right">Rentabilidad</th>
                <th class="px-4 py-4 text-right">Presupuesto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="orden in ordenesFiltradas" :key="orden.id"
                class="hover:bg-slate-50/50 transition-all">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div v-if="orden.estado === 'En Producción'"
                      class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)] shrink-0"></div>
                    <div>
                      <p class="font-black text-slate-800 text-sm leading-tight">{{ orden.cliente_nombre }}</p>
                      <p class="text-[10px] text-slate-400 font-mono mt-0.5">ORD-#{{ orden.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span :class="claseEstado(orden.estado)"
                    class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap">
                    {{ orden.estado }}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <span class="material-icons text-slate-300 text-sm">photo_library</span>
                    <span class="text-xs font-black"
                      :class="(ordenesDetalle[orden.id]?.total_evidencias || 0) > 0 ? 'text-cyan-600' : 'text-slate-300'">
                      {{ ordenesDetalle[orden.id]?.total_evidencias || 0 }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <span class="material-icons text-slate-300 text-sm">label</span>
                    <span class="text-xs font-black"
                      :class="(ordenesDetalle[orden.id]?.total_tags || 0) > 0 ? 'text-violet-500' : 'text-slate-300'">
                      {{ ordenesDetalle[orden.id]?.total_tags || 0 }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4 text-right">
                  <p class="font-bold text-slate-400 text-xs">
                    Q {{ (Number(orden.total_quetzales) - (Number(orden.total_costo_materiales || 0) + Number(orden.costo_mano_obra || 0))).toFixed(2) }}
                  </p>
                </td>
                <td class="px-4 py-4 text-right">
                  <p class="font-black text-[#06b6d4] text-sm">Q {{ Number(orden.total_quetzales).toFixed(2) }}</p>
                </td>
              </tr>
              <tr v-if="ordenesFiltradas.length === 0">
                <td colspan="6" class="py-16 text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">
                  {{ filtroEstado ? `Sin órdenes con estado "${filtroEstado}"` : 'No hay órdenes registradas' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Insumos a Reponer -->
      <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <div class="flex items-center gap-3 mb-8">
          <span class="material-icons text-red-400 text-sm">warning_amber</span>
          <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">Insumos a Reponer</h3>
        </div>
        <div class="space-y-3">
          <div v-for="item in stockBajo" :key="item.id"
            class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 group hover:border-red-100 transition-all">
            <div class="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-red-400 transition-colors shrink-0">
              <span class="material-icons text-base">inventory_2</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-slate-700 leading-tight truncate">{{ item.nombre }}</p>
              <p class="text-[10px] font-bold text-red-500 mt-0.5 uppercase tracking-tighter">
                Stock: {{ Number(item.stock_actual).toLocaleString() }} / Mín: {{ item.stock_minimo }}
              </p>
            </div>
          </div>
          <div v-if="!stockBajo.length" class="py-10 text-center">
            <span class="material-icons text-4xl text-emerald-100 mb-3 block">verified</span>
            <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inventario óptimo</p>
          </div>
        </div>
        <router-link to="/inventario"
          class="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center block hover:scale-[1.02] active:scale-95 transition-all">
          Ir al Almacén
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

const cargando            = ref(true)
const stats               = ref({ ordenes_activas: 0, stock_bajo: 0, ventas_hoy: 0, egresos_hoy: 0 })
const ordenes             = ref([])
const ordenesDetalle      = ref({})
const stockBajo           = ref([])
const categoriasClientes  = ref([])
const categoriasProductos = ref([])
const ventasSemana        = ref([])
const filtroEstado        = ref('')
const hoy                 = new Date().toISOString().split('T')[0]

// ── Utilidad real ────────────────────────────────────────────────────────────
const utilidadEstimada = computed(() => {
  const v = Number(stats.value.ventas_hoy)  || 0
  const e = Number(stats.value.egresos_hoy) || 0
  return (v - e).toLocaleString(undefined, { minimumFractionDigits: 2 })
})

// ── Filtro de tabla ──────────────────────────────────────────────────────────
const ordenesFiltradas = computed(() =>
  filtroEstado.value
    ? ordenes.value.filter(o => o.estado === filtroEstado.value)
    : ordenes.value
)

// ── Altura de barras del gráfico (máx 72px) ──────────────────────────────────
const maxValorSemana = computed(() =>
  Math.max(...ventasSemana.value.map(d => d.ingresos + d.egresos), 1)
)
const barHeight = (valor) =>
  Math.max(2, Math.round((valor / maxValorSemana.value) * 80))

// Escala Y: 3 niveles redondeados (0, mitad, máximo)
const escalaY = computed(() => {
  const max = maxValorSemana.value
  const mid = Math.round(max / 2)
  // Redondear a múltiplos bonitos
  const redondear = (n) => {
    if (n <= 0) return '0'
    const mag = Math.pow(10, Math.floor(Math.log10(n)))
    return String(Math.ceil(n / mag) * mag)
  }
  return ['0', redondear(mid), redondear(max)]
})

// ── Carga de datos ───────────────────────────────────────────────────────────
const cargarDatos = async () => {
  cargando.value = true
  try {
    const [resStats, resOrd, resStock, resCatCli, resCatProd, resDetalle, resSemana] =
      await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/ordenes'),
        api.get('/dashboard/stock-bajo'),
        api.get('/clientes/categorias'),
        api.get('/categorias'),
        api.get('/dashboard/ordenes-detalle'),
        api.get('/dashboard/ventas-semana'),
      ])

    if (resStats.data)   stats.value            = resStats.data
    if (resStock.data)   stockBajo.value         = resStock.data
    if (resCatCli.data)  categoriasClientes.value = resCatCli.data
    if (resCatProd.data) categoriasProductos.value = resCatProd.data
    if (resDetalle.data) ordenesDetalle.value    = resDetalle.data
    if (resSemana.data)  ventasSemana.value       = resSemana.data

    if (resOrd.data) {
      const taller  = resOrd.data.filter(o => o.estado === 'En Producción')
      const resto   = resOrd.data.filter(o => o.estado !== 'En Producción')
      const unidos  = [...taller, ...resto]
      ordenes.value = Array.from(new Set(unidos.map(o => o.id)))
        .map(id => unidos.find(o => o.id === id))
        .slice(0, 15)
    }
  } catch (err) {
    console.error('Error al sincronizar Dashboard:', err)
  } finally {
    cargando.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n) => Number(n || 0).toFixed(2)

const claseEstado = (estado) => ({
  'Pendiente':        'bg-amber-50 text-amber-600 border-amber-100',
  'En Producción':    'bg-cyan-50 text-[#06b6d4] border-cyan-100',
  'Listo para Envío': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Enviado':          'bg-blue-50 text-blue-500 border-blue-100',
  'Entregado':        'bg-slate-100 text-slate-500 border-slate-200',
  'Cancelado':        'bg-red-50 text-red-400 border-red-100',
}[estado] || 'bg-slate-50 text-slate-400 border-slate-100')

onMounted(cargarDatos)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
