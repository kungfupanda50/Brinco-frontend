<template>
  <div class="w-full">
    <!-- Encabezado de la Pantalla -->
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Entrada de Mercancía</h1>
        <p class="text-slate-500 font-medium">
          Registra el ingreso de suministros para actualizar existencias y costos automáticamente.
        </p>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 1. Datos de Facturación -->
        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-6 text-[#06b6d4]">
            <span class="material-icons">receipt_long</span>
            <h2 class="font-black uppercase tracking-wider text-xs">Datos de Facturación</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Proveedor del Insumo</label
              >
              <select
                v-model="entrada.proveedor_id"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              >
                <option value="">Seleccione proveedor...</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.id">
                  {{ p.nombre_empresa }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >No. de Documento / Factura</label
              >
              <input
                v-model="entrada.documento"
                type="text"
                placeholder="Ej. FAC-001-2024"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>
          </div>
        </div>

        <!-- 2. Detalle de Mercancía -->
        <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div
            class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30"
          >
            <div class="flex items-center gap-3 text-[#06b6d4]">
              <span class="material-icons">inventory_2</span>
              <h2 class="font-black uppercase tracking-wider text-xs">
                Detalle de Mercancía Recibida
              </h2>
            </div>
            <button
              @click="agregarFila"
              class="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span class="material-icons text-sm">add_circle</span> Añadir Línea
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr
                  class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
                >
                  <th class="px-8 py-4">Producto / Identificador</th>
                  <th class="px-8 py-4 text-center">Cantidad</th>
                  <th class="px-8 py-4 text-right">Costo Unitario</th>
                  <th class="px-8 py-4 text-right">Subtotal</th>
                  <th class="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(item, index) in entrada.items" :key="index" class="group">
                  <td class="px-8 py-5">
                    <select
                      v-model="item.producto_id"
                      class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none"
                    >
                      <option value="">Seleccionar producto...</option>
                      <option v-for="p in inventario" :key="p.id" :value="p.id">
                        {{ p.nombre }} ({{ p.sku }})
                      </option>
                    </select>
                  </td>
                  <td class="px-8 py-5">
                    <input
                      type="number"
                      step="0.01"
                      v-model.number="item.cantidad"
                      class="w-20 mx-auto text-center py-1 bg-slate-100 border-none rounded-lg font-black text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                    />
                  </td>
                  <td class="px-8 py-5 text-right font-bold text-slate-600">
                    <div class="flex items-center justify-end gap-1">
                      <span class="text-xs text-slate-400">Q</span>
                      <input
                        type="number"
                        step="0.01"
                        v-model.number="item.costo"
                        class="w-24 text-right bg-transparent border-none outline-none font-bold text-slate-700"
                      />
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right font-black text-slate-900">
                    Q {{ (item.cantidad * item.costo).toFixed(2) }}
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
                <tr v-if="entrada.items.length === 0">
                  <td colspan="5" class="py-24 text-center">
                    <div
                      class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <span class="material-icons text-slate-200 text-3xl"
                        >download_for_offline</span
                      >
                    </div>
                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      El listado de entrada está vacío
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumen y Acción -->
      <div class="space-y-6">
        <!-- Card de Totales -->
        <div
          class="bg-slate-800 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div class="relative z-10">
            <h3 class="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">
              Resumen de Liquidación
            </h3>
            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center text-sm font-medium">
                <span class="text-slate-400">Insumos Registrados</span>
                <span>{{ entrada.items.length }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-medium">
                <span class="text-slate-400">Unidades Totales</span>
                <span>{{ totalUnidades }}</span>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-700">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                Total Compra
              </p>
              <p class="text-5xl font-black text-[#06b6d4]">Q {{ totalCompra.toFixed(2) }}</p>
            </div>
          </div>
          <div
            class="absolute -right-8 -bottom-8 w-40 h-40 bg-[#06b6d4]/5 rounded-full blur-3xl"
          ></div>
        </div>

        <!-- Notas -->
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <label
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2"
            >Notas de Almacén</label
          >
          <textarea
            v-model="entrada.notas"
            placeholder="Ej. Paquete llegó abierto, se verificó integridad..."
            class="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium resize-none"
          ></textarea>
        </div>

        <button
          @click="registrarEntrada"
          :disabled="procesando || !esValida"
          class="w-full py-5 bg-[#7dd3e7] text-white rounded-3xl font-black shadow-xl shadow-[#7dd3e7]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
        >
          <span
            v-if="procesando"
            class="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"
          ></span>
          <span v-else class="material-icons">download_done</span>
          {{ procesando ? 'SINCRONIZANDO...' : 'PROCESAR E INCREMENTAR STOCK' }}
        </button>

        <p class="text-[8px] text-slate-400 font-bold uppercase text-center tracking-widest px-4">
          * Complete el proveedor y añada al menos un item para habilitar el registro transaccional.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- ESTADO ---
const proveedores = ref([])
const inventario = ref([])
const procesando = ref(false)

const entrada = ref({
  proveedor_id: '',
  documento: '',
  notas: '',
  items: [],
})

// --- PROPIEDADES COMPUTADAS ---

const totalUnidades = computed(() => {
  return entrada.value.items.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
})

const totalCompra = computed(() => {
  return entrada.value.items.reduce(
    (acc, item) => acc + Number(item.cantidad) * (Number(item.costo) || 0),
    0,
  )
})

const esValida = computed(() => {
  return (
    entrada.value.proveedor_id &&
    entrada.value.documento &&
    entrada.value.items.length > 0 &&
    entrada.value.items.every((i) => i.producto_id && i.cantidad > 0 && i.costo > 0)
  )
})

// --- MÉTODOS ---

const cargarDatos = async () => {
  try {
    const [resProv, resInv] = await Promise.all([api.get('/proveedores'), api.get('/inventario')])
    proveedores.value = resProv.data
    inventario.value = resInv.data
  } catch (err) {
    console.error('Error al cargar datos base:', err)
  }
}

const agregarFila = () => {
  entrada.value.items.push({ producto_id: '', cantidad: 1, costo: 0 })
}

const removerFila = (index) => {
  entrada.value.items.splice(index, 1)
}

const registrarEntrada = async () => {
  try {
    procesando.value = true
    const payload = {
      proveedor_id: entrada.value.proveedor_id,
      documento: entrada.value.documento,
      total: totalCompra.value,
      items: entrada.value.items,
    }

    // El backend maneja la transacción: guarda cabecera, detalles e incrementa stock
    await api.post('/entradas', payload)

    alert('Entrada registrada exitosamente. El inventario ha sido actualizado.')
    router.push('/inventario')
  } catch (err) {
    console.error('Error en registro:', err)
    alert(err.response?.data?.error || 'Error técnico al intentar procesar la entrada.')
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

/* Scrollbar minimalista para el selector de categorias si crece mucho */
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
