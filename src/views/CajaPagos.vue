<template>
  <div class="w-full">
    <!-- Encabezado -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Caja y Pagos</h1>
        <p class="text-slate-500 font-medium">
          Monitorea el flujo de efectivo, abonos y egresos del taller.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          class="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
        >
          <span class="material-icons">lock</span> Cerrar Caja
        </button>
        <button
          class="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 hover:scale-105 transition-all"
        >
          <span class="material-icons">add_circle</span> Registrar Pago
        </button>
      </div>
    </header>

    <!-- Resumen Financiero -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <!-- Ingresos -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4"
          >
            <span class="material-icons">trending_up</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Ingresos del Día
          </p>
          <div class="flex items-baseline gap-2">
            <h2 class="text-3xl font-black text-slate-900">Q 4,250.00</h2>
            <span
              class="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full"
              >+12%</span
            >
          </div>
        </div>
        <div
          class="absolute -right-4 -bottom-4 text-emerald-50 opacity-10 group-hover:scale-110 transition-transform"
        >
          <span class="material-icons text-9xl">attach_money</span>
        </div>
      </div>

      <!-- Egresos -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4"
          >
            <span class="material-icons">trending_down</span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Egresos del Día
          </p>
          <h2 class="text-3xl font-black text-slate-900">Q 850.00</h2>
        </div>
        <div
          class="absolute -right-4 -bottom-4 text-amber-50 opacity-10 group-hover:scale-110 transition-transform"
        >
          <span class="material-icons text-9xl">shopping_cart</span>
        </div>
      </div>

      <!-- Saldo Actual -->
      <div
        class="bg-cyan-600 p-6 rounded-3xl shadow-xl shadow-cyan-600/20 relative overflow-hidden group"
      >
        <div class="relative z-10">
          <div
            class="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4"
          >
            <span class="material-icons text-white">account_balance_wallet</span>
          </div>
          <p class="text-[10px] font-black text-cyan-100 uppercase tracking-widest mb-1">
            Saldo Actual en Caja
          </p>
          <h2 class="text-4xl font-black text-white">Q 3,400.00</h2>
        </div>
        <!-- Decoración abstracta -->
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>
    </div>

    <!-- Listado de Transacciones -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 class="font-black text-slate-800 text-sm uppercase tracking-widest">
          Transacciones Recientes
        </h3>
        <button class="text-slate-400 hover:text-slate-600">
          <span class="material-icons">filter_list</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
          >
            <tr>
              <th class="px-8 py-4">Hora</th>
              <th class="px-8 py-4">Concepto / Cliente</th>
              <th class="px-8 py-4 text-center">Método</th>
              <th class="px-8 py-4 text-right">Monto</th>
              <th class="px-8 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="tx in transacciones"
              :key="tx.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-8 py-6 text-xs font-bold text-slate-400">{{ tx.hora }}</td>
              <td class="px-8 py-6">
                <p class="font-black text-slate-800 text-sm">{{ tx.concepto }}</p>
                <p class="text-[10px] text-slate-400 font-mono">{{ tx.referencia }}</p>
              </td>
              <td class="px-8 py-6">
                <div
                  class="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 text-[10px] font-black uppercase"
                >
                  <span class="material-icons text-sm">{{ tx.metodoIcon }}</span>
                  {{ tx.metodo }}
                </div>
              </td>
              <td
                :class="tx.tipo === 'ingreso' ? 'text-emerald-500' : 'text-amber-500'"
                class="px-8 py-6 text-right font-black text-base"
              >
                {{ tx.tipo === 'ingreso' ? '+' : '-' }} Q {{ tx.monto.toFixed(2) }}
              </td>
              <td class="px-8 py-6 text-center">
                <span
                  :class="
                    tx.estado === 'Completado'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  "
                  class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase border"
                >
                  {{ tx.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-slate-50/30 border-t border-slate-100 text-center">
        <button class="text-cyan-600 text-xs font-black uppercase tracking-widest hover:underline">
          Ver todas las transacciones
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const transacciones = ref([
  {
    id: 1,
    hora: '14:30',
    concepto: 'Anticipo Boda - Ana L.',
    referencia: 'ORD-2023-089',
    metodo: 'Tarjeta',
    metodoIcon: 'credit_card',
    monto: 1200.0,
    tipo: 'ingreso',
    estado: 'Completado',
  },
  {
    id: 2,
    hora: '12:15',
    concepto: 'Compra de Materiales',
    referencia: 'Proveedor: Papelera GT',
    metodo: 'Efectivo',
    metodoIcon: 'payments',
    monto: 850.0,
    tipo: 'egreso',
    estado: 'Completado',
  },
  {
    id: 3,
    hora: '10:45',
    concepto: 'Pago Final - Carlos M.',
    referencia: 'ORD-2023-075',
    metodo: 'Transferencia',
    metodoIcon: 'account_balance',
    monto: 3050.0,
    tipo: 'ingreso',
    estado: 'Pendiente',
  },
])
</script>
