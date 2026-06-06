<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header class="flex justify-between items-end mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Categorías</h1>
        <p class="text-slate-500 font-medium">
          Administra las clasificaciones de productos para organizar tu inventario eficientemente.
        </p>
      </div>
      <button
        class="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 hover:scale-105 transition-all"
      >
        <span class="material-icons">category</span> Nueva Categoría
      </button>
    </header>

    <!-- Barra de Búsqueda -->
    <div
      class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4"
    >
      <div class="relative flex-1">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >search</span
        >
        <input
          type="text"
          placeholder="Buscar categoría..."
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm font-medium"
        />
      </div>
      <div class="flex gap-2">
        <button
          class="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-slate-900/10"
        >
          Todas
        </button>
        <button
          class="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-all"
        >
          Activas
        </button>
        <button
          class="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-all"
        >
          Inactivas
        </button>
      </div>
    </div>

    <!-- Grid de Categorías -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Tarjeta de Categoría -->
      <div
        v-for="cat in categorias"
        :key="cat.id"
        class="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
      >
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div
              :class="cat.color"
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
            >
              <span class="material-icons text-2xl">{{ cat.icon }}</span>
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
          <p class="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
            {{ cat.descripcion }}
          </p>

          <div class="flex items-center justify-between pt-6 border-t border-slate-50">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                >Productos</span
              >
              <span class="text-lg font-black text-slate-800">{{
                cat.totalProductos.toLocaleString()
              }}</span>
            </div>
            <div class="flex gap-2">
              <button
                title="Editar"
                class="p-2 text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
              >
                <span class="material-icons">edit</span>
              </button>
              <button
                title="Eliminar"
                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <span class="material-icons">delete_outline</span>
              </button>
            </div>
          </div>
        </div>
        <!-- Efecto decorativo -->
        <div
          class="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 scale-0 group-hover:scale-100 transition-transform duration-500"
        ></div>
      </div>

      <!-- Botón Agregar Nueva -->
      <button
        class="bg-slate-50 border-4 border-dashed border-slate-200 rounded-4xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-cyan-600 hover:border-cyan-200 hover:bg-white transition-all group"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all"
        >
          <span class="material-icons text-3xl">add</span>
        </div>
        <p class="font-black text-sm uppercase tracking-widest">Añadir Nueva Categoría</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categorias = ref([
  {
    id: 1,
    nombre: 'Textil',
    icon: 'checkroom',
    color: 'bg-cyan-500',
    activo: true,
    descripcion: 'Playeras, sudaderas, gorras y prendas para personalización textil.',
    totalProductos: 1240,
  },
  {
    id: 2,
    nombre: 'Cerámica',
    icon: 'coffee',
    color: 'bg-fuchsia-500',
    activo: true,
    descripcion: 'Tazas, platos, termos y artículos cerámicos sublimables.',
    totalProductos: 856,
  },
  {
    id: 3,
    nombre: 'Tintas',
    icon: 'water_drop',
    color: 'bg-amber-500',
    activo: true,
    descripcion: 'Tintas de sublimación, serigrafía, DTF e insumos líquidos.',
    totalProductos: 124,
  },
  {
    id: 4,
    nombre: 'Vinilos',
    icon: 'layers',
    color: 'bg-slate-400',
    activo: false,
    descripcion: 'Vinil textil, de corte, impreso y accesorios de aplicación.',
    totalProductos: 342,
  },
])
</script>
