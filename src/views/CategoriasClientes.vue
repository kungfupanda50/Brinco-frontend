<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
    >
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Categorías de Clientes</h1>
        <p class="text-slate-500 font-medium">
          Organiza y segmenta tu base de clientes para mejorar la atención.
        </p>
      </div>
      <button
        @click="abrirModalCreacion"
        class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span class="material-icons">add_circle</span> Crear Categoría
      </button>
    </header>

    <!-- Estados de Carga y Error -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
        Cargando categorías comerciales...
      </p>
    </div>

    <!-- Listado de Categorías -->
    <div
      v-else
      class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-8"
    >
      <div class="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
        <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
          Listado de Categorías
        </h3>
        <div class="relative w-64">
          <span
            class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            >search</span
          >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar categoría..."
            class="w-full pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-xl outline-none text-sm focus:ring-4 focus:ring-[#06b6d4]/10 transition-all shadow-inner"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr
              class="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
            >
              <th class="px-10 py-6">Nombre</th>
              <th class="px-10 py-6">Descripción</th>
              <th class="px-10 py-6">Identificador</th>
              <th class="px-10 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="cat in categoriasFiltradas"
              :key="cat.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-10 py-8">
                <div class="flex items-center gap-4">
                  <div
                    :class="cat.color_clase || 'bg-slate-100 text-slate-400'"
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                  >
                    {{ cat.nombre.charAt(0) }}
                  </div>
                  <p class="font-black text-slate-800 text-base leading-tight">{{ cat.nombre }}</p>
                </div>
              </td>
              <td class="px-10 py-8">
                <p class="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                  {{ cat.descripcion || 'Sin descripción' }}
                </p>
              </td>
              <td class="px-10 py-8">
                <span
                  :class="cat.color_clase"
                  class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                >
                  {{ cat.nombre.toUpperCase() }}_ID
                </span>
              </td>
              <td class="px-10 py-8 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="abrirModalEdicion(cat)"
                    class="p-3 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categoriasFiltradas.length === 0">
              <td colspan="4" class="py-24 text-center">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  No se encontraron categorías
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CATEGORÍA -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">
              {{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
            <p class="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mt-1">
              Configuración de segmentos
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardar" class="p-8 space-y-6">
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
              >Nombre de la Categoría</label
            >
            <input
              v-model="formulario.nombre"
              required
              type="text"
              class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
              >Clase de Color (Tailwind)</label
            >
            <input
              v-model="formulario.color_clase"
              placeholder="bg-cyan-50 text-cyan-600 border-cyan-100"
              class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-mono text-xs"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
              >Descripción</label
            >
            <textarea
              v-model="formulario.descripcion"
              rows="3"
              class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 resize-none"
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="cerrarModal"
              class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex-[2] py-4 bg-[#06b6d4] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span
                v-if="guardando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <span v-else class="material-icons text-sm">save</span>
              {{ editando ? 'Guardar Cambios' : 'Crear Categoría' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- ESTADO ---
const categorias = ref([])
const cargando = ref(true)
const guardando = ref(false)
const busqueda = ref('')

// --- MODAL ---
const modalAbierto = ref(false)
const editando = ref(false)
const catId = ref(null)
const formulario = ref({
  nombre: '',
  descripcion: '',
  color_clase: '',
})

// --- MÉTODOS ---

const cargarCategorias = async () => {
  try {
    cargando.value = true
    const response = await api.get('/clientes/categorias')
    categorias.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Error cargando categorías:', err)
  } finally {
    cargando.value = false
  }
}

const abrirModalCreacion = () => {
  editando.value = false
  catId.value = null
  formulario.value = {
    nombre: '',
    descripcion: '',
    color_clase: 'bg-slate-50 text-slate-600 border-slate-200',
  }
  modalAbierto.value = true
}

const abrirModalEdicion = (cat) => {
  editando.value = true
  catId.value = cat.id
  formulario.value = { ...cat }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardar = async () => {
  try {
    guardando.value = true
    if (editando.value) {
      await api.put(`/clientes/categorias/${catId.value}`, formulario.value)
    } else {
      await api.post('/clientes/categorias', formulario.value)
    }
    await cargarCategorias()
    cerrarModal()
  } catch (err) {
    alert('Error al guardar')
  } finally {
    guardando.value = false
  }
}

const categoriasFiltradas = computed(() => {
  return categorias.value.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

onMounted(cargarCategorias)
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
