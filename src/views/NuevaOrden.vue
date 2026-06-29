<template>
  <div class="w-full">
    <header class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Presupuesto de Orden</h1>
        <p class="text-slate-500 font-medium">
          Configura materiales, costos de venta y análisis de rentabilidad.
        </p>
      </div>
    </header>
    <!-- Error de Carga Principal -->
    <div class="p-8 bg-red-50 rounded-3xl border border-red-100 text-center mb-8" v-if="errorCarga">
      <span class="material-icons text-red-500 text-4xl mb-3">error_outline</span>
      <h3 class="text-lg font-black text-red-900">Error al cargar datos base</h3>
      <p class="text-red-600 mb-4">{{ errorCarga }}</p>
      <button
        @click="cargarDatos"
        class="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-all"
      >
        Reintentar Carga
      </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Columna Izquierda: Configuración -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 1. Información General -->
        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-6 text-[#06b6d4]">
            <span class="material-icons">person</span>
            <h2 class="font-black uppercase tracking-wider text-xs">Información General</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Seleccionar Cliente</label
              >
              <select
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
                v-model="orden.cliente_id"
              >
                <option value="">Seleccione un cliente...</option>
                <option :key="c.id" :value="c.id" v-for="c in clientes">
                  {{ c.nombre_completo }} (NIT: {{ c.nit || 'C/F' }})
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Fecha de Entrega Prometida</label
              >
              <input
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
                type="date"
                v-model="orden.fecha_entrega"
              />
            </div>
          </div>
        </div>
        <!-- 2. Desglose de Materiales (Venta) -->
        <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div
            class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30"
          >
            <div class="flex items-center gap-3 text-[#06b6d4]">
              <span class="material-icons">inventory_2</span>
              <h2 class="font-black uppercase tracking-wider text-xs">
                Desglose de Materiales (Venta)
              </h2>
            </div>
            <button
              @click="agregarFila"
              class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <span class="material-icons text-sm">add_circle</span> Añadir Material
            </button>
          </div>
          <!-- Alertas de Stock Preventivas -->
          <div
            class="px-8 py-4 bg-amber-50 border-b border-amber-100 space-y-2"
            v-if="alertasStock.length > 0"
          >
            <div
              :key="idx"
              class="flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase tracking-tight"
              v-for="(alerta, idx) in alertasStock"
            >
              <span class="material-icons text-sm">warning</span>
              {{ alerta }}
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr
                  class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
                >
                  <th class="px-8 py-4">Producto</th>
                  <th class="px-8 py-4 text-center">Cantidad</th>
                  <th class="px-8 py-4 text-right">Costo Unit.</th>
                  <th class="px-8 py-4 text-right">Costo Total</th>
                  <th class="px-8 py-4 text-right">Precio de Venta</th>
                  <th class="px-8 py-4 text-right">Subtotal Venta</th>
                  <th class="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr :key="index" class="group" v-for="(item, index) in orden.materiales">
                  <td class="px-8 py-5">
                    <select
                      @change="actualizarInfoProducto(index)"
                      class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none"
                      v-model="item.producto_id"
                    >
                      <option value="">Seleccionar...</option>
                      <option
                        :disabled="!p.activo"
                        :key="p.id"
                        :value="p.id"
                        v-for="p in inventario"
                      >
                        {{ p.nombre }} (Stock: {{ p.stock_actual }})
                      </option>
                    </select>
                  </td>
                  <td class="px-8 py-5">
                    <input
                      class="w-20 mx-auto text-center py-1 bg-slate-100 border-none rounded-lg font-black text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                      step="0.01"
                      type="number"
                      v-model.number="item.cantidad"
                    />
                  </td>
                  <td class="px-8 py-5 text-right font-medium text-slate-500">
                    Q {{ (item.costo_unitario || 0).toFixed(2) }}
                  </td>
                  <td class="px-8 py-5 text-right font-bold text-slate-700">
                    Q {{ (item.cantidad * (item.costo_unitario || 0)).toFixed(2) }}
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <span class="text-slate-400 text-xs">Q</span>
                      <input
                        class="w-24 text-right py-1 bg-transparent border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#06b6d4]/10 rounded"
                        step="0.01"
                        type="number"
                        v-model.number="item.precio_venta"
                      />
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right font-black text-slate-900">
                    Q {{ (item.cantidad * (item.precio_venta || 0)).toFixed(2) }}
                  </td>
                  <td class="px-8 py-5 text-right">
                    <button
                      @click="removerFila(index)"
                      class="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <span class="material-icons text-lg">delete_outline</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="orden.materiales.length === 0">
                  <td
                    class="py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                    colspan="7"
                  >
                    No has añadido materiales al presupuesto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 3. Notas de Personalización -->
        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <label
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2"
            >Notas de Personalización</label
          >
          <textarea
            class="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium resize-none"
            placeholder="Ej: Logo centrado, color fucsia brillante..."
            v-model="orden.notas"
          ></textarea>
        </div>
      </div>
      <!-- Resumen Financiero y Acción -->
      <div class="space-y-6">
        <!-- Card de Análisis Financiero -->
        <div
          class="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div class="relative z-10">
            <h3 class="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">
              Análisis Financiero
            </h3>
            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center text-sm font-medium">
                <span class="text-slate-400">Total Materiales (Venta)</span>
                <span class="font-black">Q {{ totalVentaMateriales.toFixed(2) }}</span>
              </div>
              <!-- Inputs de Costos Adicionales -->
              <div class="space-y-4 pt-4 border-t border-slate-800">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-500 uppercase ml-1"
                    >Cargos Administrativos (Q)</label
                  >
                  <input
                    class="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:ring-2 focus:ring-[#06b6d4]/30"
                    step="0.01"
                    type="number"
                    v-model.number="orden.cargo_admin"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-500 uppercase ml-1"
                    >Mano de Obra (Q)</label
                  >
                  <input
                    class="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:ring-2 focus:ring-[#06b6d4]/30"
                    step="0.01"
                    type="number"
                    v-model.number="orden.mano_obra"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[9px] font-black text-slate-500 uppercase ml-1"
                    >Tarifa de Envío (Q)</label
                  >
                  <input
                    class="w-full bg-slate-800 border-none rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:ring-2 focus:ring-[#06b6d4]/30"
                    step="0.01"
                    type="number"
                    v-model.number="orden.envio"
                  />
                </div>
              </div>
            </div>
            <!-- Dashboard de Rentabilidad Interna -->
            <div class="bg-white/5 border border-white/10 rounded-3xl p-5 mb-8">
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Margen de Utilidad Estimado
              </p>
              <div class="flex justify-between items-end">
                <div>
                  <p class="text-2xl font-black text-[#06b6d4]">Q {{ beneficioNeto.toFixed(2) }}</p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase">Beneficio Neto</p>
                </div>
                <div class="text-right">
                  <p
                    :class="
                      margenUtilidad >= 30
                        ? 'text-emerald-400'
                        : margenUtilidad > 0
                          ? 'text-amber-400'
                          : 'text-red-400'
                    "
                    class="text-2xl font-black"
                  >
                    {{ margenUtilidad.toFixed(1) }}%
                  </p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase">Rentabilidad</p>
                </div>
              </div>
            </div>
            <div class="pt-6 border-t-2 border-[#06b6d4]/30">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                Presupuesto Final (Cliente)
              </p>
              <p class="text-5xl font-black text-[#06b6d4]">Q {{ totalOrden.toFixed(2) }}</p>
            </div>
          </div>
          <div
            class="absolute -right-8 -bottom-8 w-40 h-40 bg-[#06b6d4]/10 rounded-full blur-3xl"
          ></div>
        </div>
        <button
          :disabled="procesando || !esValida"
          @click="generarOrden"
          class="w-full py-5 bg-[#06b6d4] text-white rounded-3xl font-black shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
        >
          <span
            class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
            v-if="procesando"
          ></span>
          <span class="material-icons" v-else>task_alt</span>
          {{ procesando ? 'PROCESANDO...' : 'CONFIRMAR ORDEN' }}
        </button>
        <p class="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
          Esta acción NO afecta el stock. El descuento se realiza manualmente en el tablero.
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const inventario = ref([])
const clientes = ref([])
const procesando = ref(false)
const errorCarga = ref(null)

const orden = ref({
  cliente_id: '',
  fecha_entrega: '',
  cargo_admin: 0,
  mano_obra: 0,
  envio: 0,
  notas: '',
  materiales: [],
})

const alertasStock = ref([])

// Vigilancia de materiales para alertas de stock (Referencial)
watch(
  () => orden.value.materiales,
  () => {
    alertasStock.value = []
    orden.value.materiales.forEach((item) => {
      const prod = inventario.value.find((p) => p.id === item.producto_id)
      if (prod) {
        if (Number(item.cantidad) > Number(prod.stock_actual)) {
          alertasStock.value.push(
            `AVISO: "${prod.nombre}" no tiene suficiente existencia actual (Disponible: ${prod.stock_actual})`,
          )
        } else if (Number(prod.stock_actual) - Number(item.cantidad) <= Number(prod.stock_minimo)) {
          alertasStock.value.push(`AVISO: "${prod.nombre}" quedará por debajo del stock mínimo.`)
        }
      }
    })
  },
  { deep: true },
)

// --- PROPIEDADES COMPUTADAS FINANCIERAS ---

const totalVentaMateriales = computed(() => {
  return orden.value.materiales.reduce(
    (acc, item) => acc + Number(item.cantidad) * (Number(item.precio_venta) || 0),
    0,
  )
})

const totalCostoInternoMateriales = computed(() => {
  return orden.value.materiales.reduce(
    (acc, item) => acc + Number(item.cantidad) * (Number(item.costo_unitario) || 0),
    0,
  )
})

const totalOrden = computed(() => {
  return (
    totalVentaMateriales.value +
    (Number(orden.value.cargo_admin) || 0) +
    (Number(orden.value.mano_obra) || 0) +
    (Number(orden.value.envio) || 0)
  )
})

const beneficioNeto = computed(() => {
  return totalVentaMateriales.value - totalCostoInternoMateriales.value
})

const margenUtilidad = computed(() => {
  if (totalVentaMateriales.value === 0) return 0
  return (beneficioNeto.value / totalVentaMateriales.value) * 100
})

const esValida = computed(() => {
  return orden.value.cliente_id && orden.value.materiales.length > 0
})

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    errorCarga.value = null
    const [resInv, resCli] = await Promise.all([api.get('/inventario'), api.get('/clientes')])
    if (resInv.data) inventario.value = resInv.data
    if (resCli.data) clientes.value = resCli.data
  } catch (err) {
    console.error('Error cargando datos:', err)
    errorCarga.value =
      'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
  }
}

const agregarFila = () => {
  orden.value.materiales.push({
    producto_id: '',
    cantidad: 1,
    precio_venta: 0,
    costo_unitario: 0,
  })
}

const removerFila = (index) => {
  orden.value.materiales.splice(index, 1)
}

const actualizarInfoProducto = (index) => {
  const item = orden.value.materiales[index]
  const prod = inventario.value.find((p) => p.id === item.producto_id)
  if (prod) {
    item.precio_venta = Number(prod.precio_venta_sugerido || prod.precio_compra_referencia * 1.4)
    item.costo_unitario = Number(prod.precio_compra_referencia)
  }
}

const generarOrden = async () => {
  try {
    procesando.value = true
    const payload = {
      cliente_id: orden.value.cliente_id,
      fecha_entrega: orden.value.fecha_entrega,
      subtotal: totalVentaMateriales.value,
      costo_materiales: totalCostoInternoMateriales.value,
      mano_obra: orden.value.mano_obra,
      envio: orden.value.envio,
      cargo_admin: orden.value.cargo_admin,
      total: totalOrden.value,
      utilidad_porcentaje: margenUtilidad.value,
      notas: orden.value.notas,
      materiales: orden.value.materiales.map((m) => ({
        producto_id: m.producto_id,
        cantidad: m.cantidad,
        costo_unitario: m.costo_unitario,
        precio_venta: m.precio_venta,
      })),
    }

    await api.post('/ordenes', payload)
    alert('Órden creada exitosamente.')
    router.push('/ordenes')
  } catch (err) {
    console.error('Error al generar orden:', err)
    alert(err.response?.data?.error || 'Error al procesar la órden.')
  } finally {
    procesando.value = false
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
