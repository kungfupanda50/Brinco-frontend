<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header class="flex justify-between items-center mb-10">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span
            class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-cyan-100"
            >Acceso Seguro</span
          >
        </div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Usuarios</h1>
        <p class="text-slate-500 font-medium">
          Administra los accesos y permisos del equipo para mantener el control y la seguridad.
        </p>
      </div>
      <button
        class="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 hover:scale-105 transition-all"
      >
        <span class="material-icons">person_add</span> Agregar Usuario
      </button>
    </header>

    <!-- Toolbar -->
    <div
      class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div class="flex gap-8 border-b md:border-b-0 border-slate-100 w-full md:w-auto">
        <button
          class="pb-4 md:pb-0 border-b-2 border-cyan-600 text-cyan-600 font-black text-sm px-2"
        >
          Todos los Usuarios
        </button>
        <button
          class="pb-4 md:pb-0 text-slate-400 font-bold text-sm px-2 hover:text-slate-600 transition-colors"
        >
          Gerentes
        </button>
        <button
          class="pb-4 md:pb-0 text-slate-400 font-bold text-sm px-2 hover:text-slate-600 transition-colors"
        >
          Operarios
        </button>
      </div>
      <div class="relative w-full md:w-80">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          >search</span
        >
        <input
          type="text"
          placeholder="Buscar por nombre o rol..."
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm"
        />
      </div>
    </div>

    <!-- Grid de Usuarios -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <div
        v-for="user in usuarios"
        :key="user.email"
        class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group"
      >
        <div class="p-8">
          <div class="flex justify-between items-start mb-8">
            <div class="relative">
              <div
                class="w-20 h-20 rounded-3xl bg-slate-100 border-4 border-white shadow-sm overflow-hidden"
              >
                <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 font-black text-2xl uppercase"
                >
                  {{ user.nombre.charAt(0) }}
                </div>
              </div>
              <div
                :class="user.activo ? 'bg-emerald-500' : 'bg-slate-300'"
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm"
              ></div>
            </div>
            <button class="p-2 text-slate-300 hover:bg-slate-50 rounded-xl transition-colors">
              <span class="material-icons">more_vert</span>
            </button>
          </div>

          <div class="mb-8">
            <h3 class="text-xl font-black text-slate-800 leading-tight mb-1">{{ user.nombre }}</h3>
            <p class="text-xs text-slate-400 font-medium mb-4">{{ user.email }}</p>
            <div class="flex">
              <span
                :class="user.rolColor"
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-current opacity-80"
              >
                <span class="material-icons text-[10px]">{{ user.rolIcon }}</span>
                {{ user.rol }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
            <div>
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                Último acceso
              </p>
              <p class="text-xs font-bold text-slate-600">{{ user.ultimoAcceso }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                Estado
              </p>
              <p
                :class="user.activo ? 'text-emerald-500' : 'text-slate-400'"
                class="text-xs font-black"
              >
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </p>
            </div>
          </div>
        </div>

        <button
          class="w-full py-4 bg-slate-50 group-hover:bg-cyan-600 group-hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <span class="material-icons text-sm">vpn_key</span> Editar Permisos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const usuarios = ref([
  {
    nombre: 'Ana Silva',
    email: 'ana.silva@brincocreativo.com',
    rol: 'Gerente',
    rolIcon: 'shield',
    rolColor: 'bg-fuchsia-50 text-fuchsia-600',
    ultimoAcceso: 'Hace 2 horas',
    activo: true,
    avatar: 'https://i.pravatar.cc/150?u=ana',
  },
  {
    nombre: 'Carlos Ruiz',
    email: 'carlos.r@brincocreativo.com',
    rol: 'Operario',
    rolIcon: 'settings',
    rolColor: 'bg-cyan-50 text-cyan-600',
    ultimoAcceso: 'Ayer, 16:45',
    activo: true,
    avatar: 'https://i.pravatar.cc/150?u=carlos',
  },
  {
    nombre: 'Luis Méndez',
    email: 'luis.m@brincocreativo.com',
    rol: 'Operario',
    rolIcon: 'settings',
    rolColor: 'bg-cyan-50 text-cyan-600',
    ultimoAcceso: 'Hace 2 semanas',
    activo: false,
    avatar: null,
  },
])
</script>
