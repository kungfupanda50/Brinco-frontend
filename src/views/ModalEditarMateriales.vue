<template>
  <div class="fixed inset-0 z-[1050] flex items-center justify-center p-4">
    <div @click="$emit('cerrar')" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <div
      class="relative bg-[#f7f9fb] w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
    >
      <header class="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-slate-900">
            Editar Materiales de Orden #{{ ordenId }}
          </h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Ajusta cantidades o productos antes de descontar inventario.
          </p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center"
        >
          <span class="material-icons">close</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="cargando" class="text-center py-20">
          <div
            class="w-10 h-10 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
        </div>

        <div
          v-else
          class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div
            class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30"
          >
            <h3 class="font-black uppercase tracking-wider text-xs text-slate-700">
              Lista de Materiales
            </h3>
            <button
              @click="agregarFila"
              class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <span class="material-icons text-sm">add_circle</span> Añadir
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr
                  class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
                >
                  <th class="px-6 py-4 w-2/5">Producto</th>
                  <th class="px-4 py-4 text-center">Cant.</th>
                  <th class="px-4 py-4 text-right">P. Venta</th>
                  <th class="px-4 py-4 text-right">Subtotal</th>
                  <th class="px-2 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(item, index) in materiales" :key="index" class="hover:bg-slate-50/50">
                  <td class="px-6 py-4">
                    <select
                      v-model="item.producto_id"
                      @change="actualizarInfoProducto(index)"
                      class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20 rounded-lg p-1"
                    >
                      <option value="">Seleccionar...</option>
                      <option
                        v-for="p in inventario"
                        :key="p.id"
                        :value="p.id"
                        :disabled="!p.activo"
                      >
                        {{ p.nombre }} (Stock: {{ p.stock_actual }})
                      </option>
                    </select>
                  </td>
                  <td class="px-4 py-4">
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      step="0.01"
                      class="w-16 mx-auto text-center py-1 bg-slate-100 border-none rounded-lg font-black text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                    />
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <span class="text-slate-400 text-xs">Q</span>
                      <input
                        v-model.number="item.precio_venta"
                        type="number"
                        step="0.01"
                        class="w-20 text-right py-1 bg-transparent border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#06b6d4]/10 rounded"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-4 text-right font-black text-slate-900 text-sm">
                    Q {{ (Number(item.cantidad) * Number(item.precio_venta || 0)).toFixed(2) }}
                  </td>
                  <td class="px-2 py-4 text-right">
                    <button
                      @click="removerFila(index)"
                      class="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <span class="material-icons text-lg">delete_outline</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="materiales.length === 0">
                  <td
                    colspan="5"
                    class="py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    No hay materiales agregados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer class="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
        <div class="text-right">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Nuevo Total Orden
          </p>
          <p class="text-2xl font-black text-[#06b6d4]">Q {{ totalCalculado.toFixed(2) }}</p>
        </div>
        <button
          @click="guardarCambios"
          :disabled="guardando"
          class="px-8 py-3 bg-[#06b6d4] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span
            v-if="guardando"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          <span v-else class="material-icons text-sm">save</span>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

const props = defineProps({
  ordenId: { type: Number, required: true },
})
const emit = defineEmits(['cerrar', 'actualizado'])

const cargando = ref(true)
const guardando = ref(false)
const inventario = ref([])
const materiales = ref([])

const totalCalculado = computed(() => {
  return materiales.value.reduce(
    (acc, item) => acc + Number(item.cantidad) * Number(item.precio_venta || 0),
    0,
  )
})

onMounted(async () => {
  try {
    const [resInv, resMat] = await Promise.all([
      api.get('/inventario'),
      api.get(`/ordenes/${props.ordenId}/materiales`),
    ])
    inventario.value = resInv.data
    materiales.value = resMat.data.map((m) => ({
      id: m.id,
      producto_id: m.producto_id,
      producto_nombre: m.producto_nombre,
      cantidad: Number(m.cantidad),
      costo_unitario: Number(m.costo_unitario),
      precio_venta: Number(m.precio_venta),
    }))
  } catch (err) {
    console.error('Error cargando datos:', err)
    alert('Error al cargar los materiales de la orden.')
  } finally {
    cargando.value = false
  }
})

const agregarFila = () => {
  materiales.value.push({ producto_id: '', cantidad: 1, costo_unitario: 0, precio_venta: 0 })
}

const removerFila = (index) => {
  materiales.value.splice(index, 1)
}

const actualizarInfoProducto = (index) => {
  const item = materiales.value[index]
  const prod = inventario.value.find((p) => p.id === item.producto_id)
  if (prod) {
    item.precio_venta = Number(prod.precio_venta_sugerido || prod.precio_compra_referencia * 1.4)
    item.costo_unitario = Number(prod.precio_compra_referencia)
  }
}

const guardarCambios = async () => {
  try {
    guardando.value = true
    await api.put(`/ordenes/${props.ordenId}/materiales`, { materiales: materiales.value })
    emit('actualizado')
    emit('cerrar')
  } catch (err) {
    alert('Error al guardar los cambios.')
  } finally {
    guardando.value = false
  }
}
</script>
