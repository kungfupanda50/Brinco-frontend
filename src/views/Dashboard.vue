<template>
  <div class="w-full">
    <!-- Encabezado con Botón de Sincronización Real -->
    <header class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Panel de Control</h1>
        <p class="text-slate-500 font-medium">Bienvenido al centro operativo de Brinco Creativo.</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="cargarDatos"
          class="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#06b6d4] rounded-xl transition-all shadow-sm group"
          title="Sincronizar Datos"
        >
          <span :class="{ 'animate-spin text-[#06b6d4]': cargando }" class="material-icons"
            >sync</span
          >
        </button>
        <router-link
          to="/nueva-orden"
          class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span class="material-icons text-xl">add_circle</span> Nueva Orden
        </router-link>
      </div>
    </header>

    <!-- KPIs Principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <!-- Órdenes Activas -->
      <div
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#06b6d4]/30 transition-all"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-cyan-50 text-[#06b6d4] rounded-2xl flex items-center justify-center mb-6"
          >
            <span class="material-icons text-2xl">assignment</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Órdenes Activas
          </p>
          <h2 class="text-4xl font-black text-slate-900">{{ stats.ordenes_activas }}</h2>
        </div>
      </div>

      <!-- Ventas Hoy -->
      <div
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6"
          >
            <span class="material-icons text-2xl">trending_up</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ventas de Hoy
          </p>
          <h2 class="text-4xl font-black text-slate-900">
            Q {{ Number(stats.ventas_hoy).toFixed(2) }}
          </h2>
        </div>
      </div>

      <!-- Utilidad Estimada -->
      <div
        class="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all"
      >
        <div class="relative z-10">
          <div
            class="w-12 h-12 bg-[#06b6d4]/20 text-[#06b6d4] rounded-2xl flex items-center justify-center mb-6 border border-[#06b6d4]/30"
          >
            <span class="material-icons text-2xl">auto_graph</span>
          </div>
          <p class="text-[10px] font-black text-[#06b6d4] uppercase tracking-widest mb-1">
            Utilidad Estimada (Día)
          </p>
          <h2 class="text-4xl font-black text-white">Q {{ utilidadEstimada }}</h2>
        </div>
        <div
          class="absolute -right-10 -bottom-10 w-40 h-40 bg-[#06b6d4]/10 rounded-full blur-3xl group-hover:bg-[#06b6d4]/20 transition-all"
        ></div>
      </div>

      <!-- Stock Crítico -->
      <div
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-200 transition-all"
      >
        <div class="relative z-10">
          <div
            :class="stats.stock_bajo > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'"
            class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors"
          >
            <span class="material-icons text-2xl">{{
              stats.stock_bajo > 0 ? 'report_problem' : 'inventory_2'
            }}</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Stock Crítico
          </p>
          <h2
            :class="stats.stock_bajo > 0 ? 'text-red-600' : 'text-slate-900'"
            class="text-4xl font-black transition-colors"
          >
            {{ stats.stock_bajo }}
          </h2>
        </div>
      </div>
    </div>

    <!-- SECCIONES DE CATEGORÍAS DUALES (Sincronizadas con Backend Maestra) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <!-- Panel: Categoría de Clientes -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center"
            >
              <span class="material-icons">groups</span>
            </div>
            <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
              Categoría de Clientes
            </h3>
          </div>
          <router-link
            to="/clientes/categorias"
            class="text-[10px] font-black text-[#06b6d4] uppercase hover:underline"
            >Gestionar</router-link
          >
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="cat in categoriasClientes"
            :key="cat.id"
            class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-fuchsia-200 transition-all"
          >
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-tight">{{
              cat.nombre
            }}</span>
            <span class="text-2xl font-black text-slate-800">{{ cat.total_clientes || 0 }}</span>
          </div>
          <div
            v-if="categoriasClientes.length === 0"
            class="col-span-2 py-4 text-center text-[10px] font-bold text-slate-300 uppercase italic"
          >
            Cargando categorías...
          </div>
        </div>
      </div>

      <!-- Panel: Categoría de Productos -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-cyan-50 text-[#06b6d4] rounded-xl flex items-center justify-center"
            >
              <span class="material-icons">category</span>
            </div>
            <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
              Categoría de Productos
            </h3>
          </div>
          <router-link
            to="/categorias"
            class="text-[10px] font-black text-[#06b6d4] uppercase hover:underline"
            >Gestionar</router-link
          >
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="cat in categoriasProductos"
            :key="cat.id"
            class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-cyan-200 transition-all"
          >
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-tight">{{
              cat.nombre
            }}</span>
            <span class="text-2xl font-black text-slate-800">{{ cat.total_productos || 0 }}</span>
          </div>
          <div
            v-if="categoriasProductos.length === 0"
            class="col-span-2 py-4 text-center text-[10px] font-bold text-slate-300 uppercase italic"
          >
            Cargando categorías...
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Listado de Últimas Órdenes -->
      <div
        class="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
      >
        <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div class="flex items-center gap-3">
            <span class="material-icons text-slate-400 text-sm">history</span>
            <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
              Últimas Órdenes Registradas
            </h3>
          </div>
          <router-link
            to="/ordenes"
            class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline"
            >Ver Todas</router-link
          >
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left">
            <thead
              class="bg-slate-50/50 text-[9px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
            >
              <tr>
                <th class="px-8 py-5">Orden / Cliente</th>
                <th class="px-8 py-5">Estado</th>
                <th class="px-8 py-5 text-right">Rentabilidad</th>
                <th class="px-8 py-5 text-right">Total (Venta)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="orden in ordenes"
                :key="orden.id"
                class="hover:bg-slate-50/30 transition-all group"
              >
                <td class="px-8 py-6">
                  <p class="font-black text-slate-800 text-sm leading-tight">
                    {{ orden.cliente_nombre }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-mono mt-1 tracking-tighter">
                    ORD-#{{ orden.id }}
                  </p>
                </td>
                <td class="px-8 py-6">
                  <span
                    :class="claseEstado(orden.estado)"
                    class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                  >
                    {{ orden.estado }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <p class="font-bold text-slate-400 text-xs">
                    Q
                    {{
                      (
                        Number(orden.total_quetzales) -
                        (Number(orden.total_costo_materiales) + Number(orden.costo_mano_obra))
                      ).toFixed(2)
                    }}
                  </p>
                </td>
                <td class="px-8 py-6 text-right">
                  <p class="font-black text-[#06b6d4] text-base">
                    Q {{ Number(orden.total_quetzales).toFixed(2) }}
                  </p>
                </td>
              </tr>
              <tr v-if="ordenes.length === 0">
                <td
                  colspan="4"
                  class="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  No hay órdenes registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Columna Lateral: Insumos a Reponer -->
      <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <div class="flex items-center gap-3 mb-8">
          <span class="material-icons text-red-400 text-sm">warning_amber</span>
          <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
            Insumos a Reponer
          </h3>
        </div>

        <div class="space-y-4">
          <div
            v-for="item in stockBajo"
            :key="item.id"
            class="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-red-100 transition-all"
          >
            <div
              class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-red-400 transition-colors"
            >
              <span class="material-icons text-lg">inventory_2</span>
            </div>
            <div class="flex-1">
              <p class="text-xs font-black text-slate-700 leading-tight">{{ item.nombre }}</p>
              <p class="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">
                Quedan {{ Number(item.stock_actual).toLocaleString() }}
              </p>
            </div>
          </div>

          <div v-if="stockBajo.length === 0" class="py-12 text-center">
            <span class="material-icons text-4xl text-emerald-100 mb-4">verified</span>
            <p
              class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed"
            >
              Inventario saludable
            </p>
          </div>
        </div>

        <router-link
          v-if="stockBajo.length > 0"
          to="/inventario"
          class="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center block hover:scale-[1.02] active:scale-95 transition-all"
        >
          Gestionar Inventario
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- ESTADO ---
const cargando = ref(true)
const stats = ref({ ordenes_activas: 0, stock_bajo: 0, ventas_hoy: 0 })
const ordenes = ref([])
const stockBajo = ref([])
const categoriasClientes = ref([])
const categoriasProductos = ref([])

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    cargando.value = true
    // Ejecutamos todas las peticiones a los endpoints optimizados que ahora devuelven los contadores dinámicos
    const [resStats, resOrd, resStock, resCatCli, resCatProd] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/ordenes'),
      api.get('/dashboard/stock-bajo'),
      api.get('/clientes/categorias'), // Devuelve total_clientes por ID
      api.get('/categorias'), // Devuelve total_productos por ID
    ])

    if (resStats.data) stats.value = resStats.data
    if (resOrd.data) ordenes.value = resOrd.data.slice(0, 5) // Mostramos solo las 5 más recientes
    if (resStock.data) stockBajo.value = resStock.data
    if (resCatCli.data) categoriasClientes.value = resCatCli.data.slice(0, 4)
    if (resCatProd.data) categoriasProductos.value = resCatProd.data.slice(0, 4)

    console.log('✅ Dashboard sincronizado con métricas dinámicas')
  } catch (err) {
    console.error('Error al sincronizar Dashboard:', err)
  } finally {
    cargando.value = false
  }
}

const utilidadEstimada = computed(() => {
  // Cálculo de margen promedio (aprox 35% del volumen de venta total de hoy)
  const totalHoy = Number(stats.value.ventas_hoy) || 0
  return (totalHoy * 0.35).toLocaleString(undefined, { minimumFractionDigits: 2 })
})

const claseEstado = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'En Producción':
      return 'bg-cyan-50 text-[#06b6d4] border-cyan-100'
    case 'Entregado':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
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
