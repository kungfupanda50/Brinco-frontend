<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Categorías de Productos</h1>
        <p class="text-slate-500 font-medium">
          Administra las clasificaciones, iconos y colores para tu catálogo e inventario.
        </p>
      </div>
      <button
        @click="abrirModalCreacion"
        class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span class="material-icons">category</span> Nueva Categoría
      </button>
    </header>

    <!-- Barra de Búsqueda y Filtros -->
    <div
      class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4"
    >
      <div class="relative flex-1">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >search</span
        >
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar categoría..."
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium"
        />
      </div>
      <div class="flex gap-2">
        <button
          @click="filtroEstatus = 'TODAS'"
          :class="
            filtroEstatus === 'TODAS'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-400 border border-slate-200'
          "
          class="px-6 py-3 rounded-xl text-xs font-black uppercase shadow-lg shadow-slate-900/10 transition-all"
        >
          Todas
        </button>
        <button
          @click="filtroEstatus = 'ACTIVAS'"
          :class="
            filtroEstatus === 'ACTIVAS'
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-slate-400 border border-slate-200'
          "
          class="px-6 py-3 rounded-xl text-xs font-black uppercase transition-all"
        >
          Activas
        </button>
      </div>
    </div>

    <!-- Grid de Categorías -->
    <div v-if="!cargando" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="cat in categoriasFiltradas"
        :key="cat.id"
        class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
      >
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div
              :class="cat.color_clase || 'bg-[#06b6d4]'"
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
            >
              <span class="material-icons text-2xl">{{ cat.icono || 'category' }}</span>
            </div>
            <span
              :class="
                cat.activo
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              "
              class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
            >
              {{ cat.activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <h3 class="text-xl font-black text-slate-800 mb-2">{{ cat.nombre }}</h3>
          <p
            class="text-sm text-slate-500 font-medium mb-8 leading-relaxed h-10 overflow-hidden line-clamp-2"
          >
            {{ cat.descripcion || 'Sin descripción detallada.' }}
          </p>

          <div class="flex items-center justify-between pt-6 border-t border-slate-50">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                >Productos</span
              >
              <span class="text-lg font-black text-slate-800">{{ cat.total_productos || 0 }}</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="abrirModalEdicion(cat)"
                class="p-2 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-lg transition-all"
              >
                <span class="material-icons">edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ESTADO CARGANDO -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-xs">
        Cargando catálogo de categorías...
      </p>
    </div>

    <!-- MODAL DE CREACIÓN / EDICIÓN -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <header class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900">
              {{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
            <p class="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mt-1">
              Configuración visual de productos
            </p>
          </div>
          <button @click="cerrarModal" class="material-icons text-slate-400">close</button>
        </header>

        <form
          @submit.prevent="guardar"
          class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Nombre</label
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
                >Estatus</label
              >
              <select
                v-model="formulario.activo"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
              >
                <option :value="1">Activa</option>
                <option :value="0">Inactiva</option>
              </select>
            </div>
          </div>

          <!-- SELECTOR DE COLOR -->
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
              >Color Distintivo</label
            >
            <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
              <button
                v-for="color in opcionesColor"
                :key="color"
                type="button"
                @click="formulario.color_clase = color"
                :class="[
                  color,
                  'w-full aspect-square rounded-xl transition-all border-4 flex items-center justify-center',
                  formulario.color_clase === color
                    ? 'border-white ring-4 ring-[#06b6d4]/30 scale-110 shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100',
                ]"
              >
                <span
                  v-if="formulario.color_clase === color"
                  class="material-icons text-white text-sm"
                  >check</span
                >
              </button>
            </div>
          </div>

          <!-- POOL DE ICONOS (25+) -->
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
              >Icono Representativo (Pool de 25+)</label
            >
            <div
              class="grid grid-cols-6 sm:grid-cols-10 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-100"
            >
              <button
                v-for="icon in poolIconos"
                :key="icon"
                type="button"
                @click="formulario.icono = icon"
                :class="[
                  formulario.icono === icon
                    ? 'bg-[#06b6d4] text-white scale-110 shadow-md'
                    : 'bg-white text-slate-400 hover:bg-white hover:text-slate-600',
                ]"
                class="w-full aspect-square rounded-xl flex items-center justify-center transition-all"
              >
                <span class="material-icons text-lg">{{ icon }}</span>
              </button>
            </div>
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

          <div class="flex gap-4 pt-4 border-t border-slate-50">
            <button
              type="button"
              @click="cerrarModal"
              class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex-[2] py-4 bg-[#06b6d4] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {{ guardando ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA' }}
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

const categorias = ref([])
const cargando = ref(true)
const guardando = ref(false)
const busqueda = ref('')
const filtroEstatus = ref('TODAS')

const opcionesColor = [
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-slate-500',
  'bg-sky-400',
  'bg-violet-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-blue-600',
  'bg-yellow-400',
  'bg-lime-500',
  'bg-red-600',
]

const poolIconos = [
  'category',
  'checkroom',
  'coffee',
  'water_drop',
  'cleaning_services',
  'science',
  'layers',
  'shopping_bag',
  'inventory_2',
  'local_shipping',
  'palette',
  'print',
  'brush',
  'styler',
  'diamond',
  'celebration',
  'auto_awesome',
  'token',
  'redeem',
  'workspace_premium',
  'military_tech',
  'card_membership',
  'style',
  'settings_suggest',
  'construction',
  'architecture',
  'biotech',
  'precision_manufacturing',
  'handyman',
]

const modalAbierto = ref(false)
const editando = ref(false)
const formulario = ref({
  id: null,
  nombre: '',
  descripcion: '',
  activo: 1,
  color_clase: 'bg-cyan-500',
  icono: 'category',
})

const cargarDatos = async () => {
  try {
    cargando.value = true
    const res = await api.get('/categorias')
    categorias.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

const abrirModalCreacion = () => {
  editando.value = false
  formulario.value = {
    id: null,
    nombre: '',
    descripcion: '',
    activo: 1,
    color_clase: opcionesColor[0],
    icono: 'category',
  }
  modalAbierto.value = true
}

const abrirModalEdicion = (cat) => {
  editando.value = true
  formulario.value = { ...cat }
  modalAbierto.value = true
}

const cerrarModal = () => (modalAbierto.value = false)

const guardar = async () => {
  try {
    guardando.value = true
    if (editando.value) {
      await api.put(`/categorias/${formulario.value.id}`, formulario.value)
    } else {
      await api.post('/categorias', formulario.value)
    }
    await cargarDatos()
    cerrarModal()
  } catch (err) {
    const mensaje = err.response?.data?.error || 'Error al guardar la categoría.'
    alert(mensaje)
  } finally {
    guardando.value = false
  }
}

const categoriasFiltradas = computed(() => {
  let list = categorias.value.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
  if (filtroEstatus.value === 'ACTIVAS') list = list.filter((c) => c.activo)
  return list
})

onMounted(cargarDatos)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
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
