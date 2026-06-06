import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contenido de cada componente (tal cual del archivo original)
const files = {
  'Dashboard.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="mb-8">
      <h1 class="text-4xl font-black text-slate-900">Hola, <span class="text-[#06b6d4]">Equipo Brinco</span> 👋</h1>
      <p class="text-slate-500">Resumen de la actividad de hoy en el taller.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex justify-between items-start mb-4">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Insumos Críticos</p>
          <span class="material-icons text-red-500 bg-red-50 p-2 rounded-lg">warning</span>
        </div>
        <p class="text-5xl font-black text-slate-900 mb-1">3</p>
        <p class="text-xs font-bold text-red-500 flex items-center gap-1"><span class="material-icons text-sm">trending_down</span> Requiere atención inmediata</p>
      </div>
      <!-- Las otras dos métricas siguen un patrón similar -->
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 class="font-black text-slate-800 uppercase tracking-tight">Órdenes Recientes</h2>
          <button class="text-xs font-bold text-[#06b6d4] hover:underline">Ver todas</button>
        </div>
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
            <tr>
              <th class="px-6 py-4">Orden</th>
              <th class="px-6 py-4">Cliente</th>
              <th class="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-bold">#{{ order.id }}</td>
              <td class="px-6 py-4 text-slate-600">{{ order.customer }}</td>
              <td class="px-6 py-4">
                <span :class="order.statusClass" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
          <span class="material-icons text-[#06b6d4]">notifications_active</span> Alertas de Stock
        </h2>
        <div class="space-y-4">
          <div v-for="alert in stockAlerts" :key="alert.name" class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex justify-between items-center mb-1">
              <p class="font-bold text-slate-800 text-sm">{{ alert.name }}</p>
              <p class="text-red-500 font-black text-lg">{{ alert.qty }}</p>
            </div>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ alert.unit }} RESTANTES</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const recentOrders = ref([
  { id: 'ORD-0892', customer: 'María González', status: 'En Producción', statusClass: 'bg-amber-50 text-amber-600' },
  { id: 'ORD-0891', customer: 'Carlos Ruiz', status: 'Completado', statusClass: 'bg-emerald-50 text-emerald-600' },
]);
const stockAlerts = ref([
  { name: 'Taza Blanca 11oz', qty: 12, unit: 'UNIDADES' },
  { name: 'Vinilo Textil Fucsia', qty: 1.5, unit: 'METROS' },
]);
</script>`,

  'Inventario.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Inventario de Insumos</h1>
        <p class="text-slate-500">Gestiona existencias y valuación en Quetzales.</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20">Agregar Insumo</button>
      </div>
    </header>

    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-50 flex justify-between items-center">
        <div class="flex gap-4">
          <button class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase">Todos</button>
          <button class="px-4 py-2 text-slate-400 hover:bg-slate-50 rounded-lg text-xs font-black uppercase transition-all">Textil</button>
          <button class="px-4 py-2 text-slate-400 hover:bg-slate-50 rounded-lg text-xs font-black uppercase transition-all">Tintas</button>
        </div>
        <div class="relative w-72">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input type="text" placeholder="Buscar insumo..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm" />
        </div>
      </div>
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
          <tr>
            <th class="px-8 py-4">Producto</th>
            <th class="px-8 py-4">Stock</th>
            <th class="px-8 py-4">Valuación</th>
            <th class="px-8 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in items" :key="item.sku" class="hover:bg-slate-50 transition-colors">
            <td class="px-8 py-5">
              <p class="font-bold text-slate-800 text-sm">{{ item.name }}</p>
              <p class="text-[10px] text-slate-400 font-mono italic">{{ item.sku }}</p>
            </td>
            <td class="px-8 py-5">
              <span class="font-black text-slate-700">{{ item.stock }}</span>
              <span class="ml-2 text-[10px] font-bold text-emerald-500">● Óptimo</span>
            </td>
            <td class="px-8 py-5 font-bold text-[#06b6d4]">Q {{ item.value }}</td>
            <td class="px-8 py-5 text-center flex justify-center gap-4">
              <button class="text-slate-300 hover:text-[#06b6d4] transition-all"><span class="material-icons">edit</span></button>
              <button class="text-slate-300 hover:text-red-500 transition-all"><span class="material-icons">visibility_off</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const items = ref([
  { name: 'Camiseta Algodón Premium', sku: 'TX-001', stock: 450, value: '2,025.00' },
  { name: 'Tinta Sublimación Cian 1L', sku: 'TI-SUB-SET', stock: 15, value: '5,250.00' },
]);
</script>`,

  'OrdenesTrabajo.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="mb-10">
      <h1 class="text-4xl font-black text-slate-900">Órdenes de Trabajo</h1>
      <p class="text-slate-500">Arrastra las tarjetas para cambiar el estado en el flujo.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="col in columns" :key="col.title" class="bg-slate-100/30 p-6 rounded-[40px] border border-slate-200/50 min-h-[600px]">
        <h2 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between px-2">
          <span>{{ col.title }}</span>
          <span class="bg-white text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">{{ col.orders.length }}</span>
        </h2>
        <div class="space-y-4">
          <div v-for="order in col.orders" :key="order.id" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:scale-95">
            <div class="flex justify-between mb-3">
              <p class="text-[10px] font-bold text-slate-400">#{{ order.id }}</p>
              <span :class="order.priorityClass" class="text-[8px] font-black uppercase px-2 py-0.5 rounded">{{ order.priority }}</span>
            </div>
            <p class="font-black text-slate-800 text-lg mb-4">Cliente: {{ order.customer }}</p>
            <div class="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span class="material-icons text-sm">calendar_today</span> {{ order.date }}
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-slate-50">
              <div class="flex -space-x-2">
                <div class="w-6 h-6 rounded-full bg-[#06b6d4] border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">JD</div>
              </div>
              <button class="text-xs font-bold text-[#06b6d4]">Detalles</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const columns = ref([
  { title: 'Por Diseñar', orders: [{ id: '1042', customer: 'Studio Z', date: '24 Oct', priority: 'Alta', priorityClass: 'bg-red-50 text-red-500' }] },
  { title: 'En Producción', orders: [{ id: '1038', customer: 'Ana Gómez', date: 'Hoy', priority: 'Normal', priorityClass: 'bg-cyan-50 text-cyan-600' }] },
  { title: 'Listos', orders: [] }
]);
</script>`,

  'NuevaOrden.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit'] flex flex-col lg:flex-row gap-8">
    <div class="flex-1 space-y-6">
      <h1 class="text-3xl font-black text-slate-900">Crear Nueva Orden</h1>
      
      <section class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 class="text-xs font-black text-[#06b6d4] uppercase tracking-widest mb-6">1. Información del Cliente</h2>
        <div class="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Nombre o Razón Social" class="bg-slate-50 p-4 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-cyan-100" />
          <input type="text" placeholder="NIT / Identificación" class="bg-slate-50 p-4 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-cyan-100" />
        </div>
      </section>

      <section class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 class="text-xs font-black text-[#06b6d4] uppercase tracking-widest mb-6">2. Desglose de Costos Adicionales</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mano de Obra (Q)</label>
            <input type="number" placeholder="0.00" class="w-full bg-slate-50 p-4 rounded-xl border-none text-lg font-bold" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarifa de Envío (Q)</label>
            <input type="number" placeholder="0.00" class="w-full bg-slate-50 p-4 rounded-xl border-none text-lg font-bold" />
          </div>
        </div>
      </section>
    </div>

    <aside class="w-full lg:w-96">
      <div class="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl sticky top-8">
        <h3 class="text-2xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Resumen</h3>
        <div class="space-y-5 mb-10 text-sm">
          <div class="flex justify-between"><span class="text-slate-400">Insumos</span><span class="font-bold">Q 0.00</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Mano de Obra</span><span class="font-bold">Q 0.00</span></div>
          <div class="flex justify-between border-t border-slate-50 pt-5 text-xl font-black italic">
            <span>TOTAL</span><span class="text-[#06b6d4]">Q 0.00</span>
          </div>
        </div>
        <button class="w-full bg-[#06b6d4] text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all">GENERAR ORDEN</button>
      </div>
    </aside>
  </div>
</template>`,

  'Proveedores.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Proveedores</h1>
        <p class="text-slate-500">Gestión y mantenimiento del directorio de proveedores de insumos.</p>
      </div>
      <button class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2">
        <span class="material-icons">add</span> Nuevo Proveedor
      </button>
    </header>
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div class="relative w-96">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input type="text" placeholder="Buscar por nombre, NIT o categoría..." class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#06b6d4]/10 outline-none text-sm" />
        </div>
        <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white transition-all">
          <span class="material-icons">filter_list</span> Filtros
        </button>
      </div>
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest">
          <tr>
            <th class="px-8 py-4">Nombre / Empresa</th>
            <th class="px-8 py-4">NIT</th>
            <th class="px-8 py-4">Contacto</th>
            <th class="px-8 py-4">Teléfono</th>
            <th class="px-8 py-4">Categoría</th>
            <th class="px-8 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="prov in providers" :key="prov.nit" class="hover:bg-slate-50 transition-colors">
            <td class="px-8 py-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-cyan-50 text-[#06b6d4] flex items-center justify-center font-bold text-sm">{{ prov.initials }}</div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ prov.name }}</p>
                  <p class="text-[10px] text-slate-400 uppercase font-bold">{{ prov.specialty }}</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-5 text-sm font-mono text-slate-500">{{ prov.nit }}</td>
            <td class="px-8 py-5 text-sm text-slate-700">{{ prov.contact }}</td>
            <td class="px-8 py-5 text-sm text-slate-700">{{ prov.phone }}</td>
            <td class="px-8 py-5">
              <span class="px-3 py-1 bg-cyan-50 text-[#06b6d4] rounded-full text-[10px] font-black uppercase">{{ prov.category }}</span>
            </td>
            <td class="px-8 py-5 text-right">
              <button class="p-2 text-slate-300 hover:text-[#06b6d4] transition-all"><span class="material-icons">edit</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const providers = ref([
  { name: 'Textiles Milenio S.A.', initials: 'TM', specialty: 'Telas y Algodón', nit: '900.123.456-7', contact: 'Carlos Restrepo', phone: '+502 5555-0101', category: 'Insumos Base' },
  { name: 'Pigmentos Industriales', initials: 'PI', specialty: 'Tintas Sublimación', nit: '800.987.654-2', contact: 'Ana Lucía Gómez', phone: '+502 4444-0202', category: 'Químicos' },
]);
</script>`,

  'CajaPagos.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Caja y Pagos</h1>
        <p class="text-slate-500">Control de flujo financiero y registro de pagos.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 border-2 border-[#06b6d4] text-[#06b6d4] rounded-xl font-bold hover:bg-cyan-50 transition-all">Cerrar Caja</button>
        <button class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20">Registrar Pago</button>
      </div>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div class="flex justify-between items-center mb-4">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Ingresos del Día</p>
          <span class="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">+12%</span>
        </div>
        <p class="text-3xl font-black text-slate-900 italic">Q 4,250.00</p>
        <div class="absolute bottom-0 right-0 w-24 h-24 bg-emerald-50 opacity-10 rounded-tl-full"></div>
      </div>
      <div class="bg-[#06b6d4] p-8 rounded-[32px] shadow-xl shadow-cyan-500/20 text-white relative">
        <p class="text-xs font-black opacity-60 uppercase tracking-widest mb-4">Saldo Actual en Caja</p>
        <p class="text-4xl font-black italic tracking-tight">Q 3,400.00</p>
        <span class="material-icons absolute bottom-6 right-8 opacity-20 text-6xl">account_balance_wallet</span>
      </div>
    </div>
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-50 font-black text-slate-800 uppercase tracking-tight">Transacciones Recientes</div>
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black">
          <tr>
            <th class="px-8 py-4">Hora</th>
            <th class="px-8 py-4">Concepto / Cliente</th>
            <th class="px-8 py-4">Método</th>
            <th class="px-8 py-4">Monto</th>
            <th class="px-8 py-4">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 text-sm">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-8 py-5 text-slate-400 font-bold">{{ tx.time }}</td>
            <td class="px-8 py-5">
              <p class="font-bold text-slate-800">{{ tx.concept }}</p>
              <p class="text-[10px] text-slate-400 uppercase font-bold">{{ tx.ref }}</p>
            </td>
            <td class="px-8 py-5">
              <div class="flex items-center gap-2 text-slate-600">
                <span class="material-icons text-lg">{{ tx.icon }}</span> {{ tx.method }}
              </div>
            </td>
            <td :class="tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-red-500'" class="px-8 py-5 font-black italic">{{ tx.amount }}</td>
            <td class="px-8 py-5">
              <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">Completado</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const transactions = ref([
  { time: '14:30', concept: 'Anticipo Boda - Ana L.', ref: 'ORD-2023-089', method: 'Tarjeta', icon: 'credit_card', amount: '+ Q 1,200.00' },
  { time: '12:15', concept: 'Compra de Materiales', ref: 'Proveedor: Papelera GT', method: 'Efectivo', icon: 'payments', amount: '- Q 850.00' },
]);
</script>`,

  'Categorias.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="mb-10">
      <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Categorías</h1>
      <p class="text-slate-500">Organiza tu inventario para una búsqueda más eficiente.</p>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-[#06b6d4] transition-all cursor-pointer group">
        <div class="w-14 h-14 rounded-full bg-slate-50 text-slate-300 group-hover:bg-cyan-50 group-hover:text-[#06b6d4] flex items-center justify-center transition-all">
          <span class="material-icons text-3xl">add</span>
        </div>
        <p class="font-bold text-slate-400 group-hover:text-[#06b6d4]">Nueva Categoría</p>
      </div>
      <div v-for="cat in categories" :key="cat.name" class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
        <div class="flex justify-between items-start mb-6">
          <div :class="cat.color" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white">
            <span class="material-icons">{{ cat.icon }}</span>
          </div>
          <span class="px-2 py-0.5 bg-emerald-50 text-emerald-500 rounded text-[8px] font-black uppercase">Activa</span>
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">{{ cat.name }}</h3>
        <p class="text-xs text-slate-500 leading-relaxed mb-6">{{ cat.desc }}</p>
        <div class="flex justify-between items-center pt-4 border-t border-slate-50">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ cat.count }} PRODUCTOS</p>
          <button class="text-slate-300 hover:text-[#06b6d4] transition-all"><span class="material-icons">edit</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const categories = ref([
  { name: 'Textil', icon: 'apparel', count: 1240, color: 'bg-cyan-400', desc: 'Playeras, sudaderas y gorras para personalización.' },
  { name: 'Cerámica', icon: 'coffee', count: 856, color: 'bg-amber-400', desc: 'Tazas, platos y artículos cerámicos.' },
  { name: 'Tintas', icon: 'opacity', count: 124, color: 'bg-fuchsia-400', desc: 'Tintas de sublimación y serigrafía.' },
]);
</script>`,

  'Usuarios.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit']">
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Usuarios</h1>
        <p class="text-slate-500">Administra los accesos y permisos de tu equipo creativo.</p>
      </div>
      <button class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20">Agregar Usuario</button>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="user in users" :key="user.email" class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-slate-100 p-1 border-2 border-slate-50">
              <img :src="user.avatar" class="w-full h-full rounded-full object-cover" />
            </div>
            <span :class="user.statusColor" class="absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full"></span>
          </div>
        </div>
        <div class="text-center mb-8">
          <h3 class="text-2xl font-black text-slate-900 mb-1">{{ user.name }}</h3>
          <p class="text-sm text-slate-400">{{ user.email }}</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mb-6">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</p>
          <span class="px-3 py-1 bg-white text-[#06b6d4] rounded-lg text-[10px] font-black uppercase shadow-sm">{{ user.role }}</span>
        </div>
        <button class="w-full py-3 text-sm font-bold text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
          <span class="material-icons text-sm">vpn_key</span> Editar Permisos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const users = ref([
  { name: 'Ana Silva', email: 'ana@brinco.com', role: 'Gerente', avatar: 'https://i.pravatar.cc/150?u=ana', statusColor: 'bg-emerald-500' },
  { name: 'Carlos Ruiz', email: 'carlos@brinco.com', role: 'Operario', avatar: 'https://i.pravatar.cc/150?u=carlos', statusColor: 'bg-emerald-500' },
  { name: 'Luis Méndez', email: 'luis@brinco.com', role: 'Operario', avatar: 'https://i.pravatar.cc/150?u=luis', statusColor: 'bg-slate-300' },
]);
</script>`,

  'EntradaMercancia.vue': `<template>
  <div class="p-8 bg-[#f7f9fb] min-h-screen font-['Outfit'] max-w-5xl mx-auto">
    <header class="mb-10">
      <h1 class="text-4xl font-black text-slate-900 mb-2">Entrada de Mercancía</h1>
      <p class="text-slate-500">Registra el ingreso de nuevos insumos y actualiza el stock.</p>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <h2 class="text-xs font-black text-[#06b6d4] uppercase tracking-widest mb-6 flex items-center gap-2">
            <span class="material-icons">receipt</span> Información del Documento
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <select class="bg-slate-50 p-4 rounded-xl text-sm outline-none border-none">
              <option>Seleccionar Proveedor</option>
              <option>Textiles Milenio</option>
            </select>
            <input type="text" placeholder="No. Factura / Referencia" class="bg-slate-50 p-4 rounded-xl text-sm outline-none border-none" />
          </div>
        </section>
        <section class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <h2 class="text-xs font-black text-[#06b6d4] uppercase tracking-widest mb-6">Productos Recibidos</h2>
          <table class="w-full text-left">
            <thead class="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-50">
              <tr>
                <th class="py-4">Producto</th>
                <th class="py-4 text-center">Cant.</th>
                <th class="py-4 text-right">Costo Unit.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="i in 2" :key="i">
                <td class="py-4">
                  <p class="text-sm font-bold text-slate-800">Cargar producto...</p>
                </td>
                <td class="py-4">
                  <input type="number" class="w-16 mx-auto bg-slate-50 border-none rounded p-1 text-center font-bold text-sm" />
                </td>
                <td class="py-4 text-right font-bold text-slate-400">Q 0.00</td>
              </tr>
            </tbody>
          </table>
          <button class="mt-6 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-xs font-black text-slate-300 hover:border-[#06b6d4] hover:text-[#06b6d4] transition-all"> + AÑADIR PRODUCTO </button>
        </section>
      </div>
      <aside>
        <div class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl sticky top-8">
          <h3 class="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter italic">Resumen</h3>
          <div class="space-y-4 mb-8">
            <div class="flex justify-between text-sm"><span class="text-slate-400">Líneas</span><span class="font-bold">0</span></div>
            <div class="flex justify-between pt-4 border-t border-slate-50">
              <span class="font-black text-slate-900 italic">TOTAL</span>
              <span class="text-3xl font-black text-[#06b6d4]">Q 0.00</span>
            </div>
          </div>
          <button class="w-full bg-[#06b6d4] text-white py-5 rounded-2xl font-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">REGISTRAR ENTRADA</button>
        </div>
      </aside>
    </div>
  </div>
</template>`,

  'Clientes.vue': `<template>
  <div class="min-h-screen bg-[#f7f9fb] p-8 font-['Outfit']">
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Gestión de Clientes</h1>
        <p class="text-slate-500">Administra tu cartera de clientes, historial de pedidos y datos de facturación.</p>
      </div>
      <button class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">
        <span class="material-icons">person_add</span> Añadir Cliente
      </button>
    </header>
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input type="text" placeholder="Buscar por nombre, email, teléfono o NIT..." class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#06b6d4]/20 outline-none text-sm transition-all" />
        </div>
        <div class="flex gap-3">
          <select class="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
            <option>Todos los Tipos</option>
            <option>Individual</option>
            <option>Empresa</option>
            <option>Mayorista</option>
          </select>
          <button class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <span class="material-icons text-lg">filter_list</span> Más Filtros
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50/50">
            <tr class="text-[11px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <th class="px-8 py-4 text-left">Cliente / Identificación</th>
              <th class="px-8 py-4 text-left">Contacto y Dirección</th>
              <th class="px-8 py-4 text-center">Tipo de Cuenta</th>
              <th class="px-8 py-4 text-center">Órdenes</th>
              <th class="px-8 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="client in clients" :key="client.email" class="hover:bg-slate-50/30 transition-colors group">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div :class="[client.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-sm text-lg']">
                    {{ client.initials }}
                  </div>
                  <div>
                    <p class="font-black text-slate-800">{{ client.name }}</p>
                    <p class="text-[10px] text-slate-400 font-mono tracking-widest uppercase">NIT: {{ client.nit }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                    <span class="material-icons text-xs text-[#06b6d4]">email</span> {{ client.email }}
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span class="material-icons text-xs">phone</span> {{ client.phone }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-center">
                <span :class="[client.tagClass, 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-current opacity-90']">
                  {{ client.type }}
                </span>
              </td>
              <td class="px-8 py-5 text-center">
                <div class="inline-flex flex-col items-center">
                  <span class="font-black text-slate-900 text-xl leading-none">{{ client.orders }}</span>
                  <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pedidos</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex justify-end gap-2">
                  <button title="Historial de Órdenes" class="p-2 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-lg transition-all">
                    <span class="material-icons">receipt_long</span>
                  </button>
                  <button title="Editar Cliente" class="p-2 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-lg transition-all">
                    <span class="material-icons">edit</span>
                  </button>
                  <button title="Eliminar" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <span class="material-icons">delete_outline</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Mostrando {{ clients.length }} de 42 clientes</p>
        <div class="flex gap-2">
          <button class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
            <span class="material-icons">chevron_left</span>
          </button>
          <button class="w-10 h-10 rounded-xl bg-[#06b6d4] text-white font-bold flex items-center justify-center shadow-md">1</button>
          <button class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center transition-all">2</button>
          <button class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const clients = ref([
  { name: 'María Rodríguez', initials: 'MR', color: 'bg-cyan-500', nit: '1234567-8', email: 'maria.r@email.com', phone: '+502 5555-0123', type: 'Individual', tagClass: 'bg-cyan-50 text-cyan-600', orders: 4 },
  { name: 'Café del Sur', initials: 'CD', color: 'bg-amber-500', nit: '9876543-2', email: 'compras@cafedelsur.com', phone: '+502 2222-4455', type: 'Empresa', tagClass: 'bg-amber-50 text-amber-600', orders: 12 },
  { name: 'Carlos Mendoza', initials: 'CM', color: 'bg-fuchsia-500', nit: '5566778-9', email: 'carlos.m@boutique.com', phone: '+502 4444-9988', type: 'Mayorista', tagClass: 'bg-fuchsia-50 text-fuchsia-600', orders: 34 }
]);
</script>`
};

// Crear directorio src/views si no existe
const dir = path.join(__dirname, 'src', 'views');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`📁 Carpeta creada: ${dir}`);
}

// Escribir cada archivo
Object.entries(files).forEach(([name, content]) => {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Archivo creado: ${filePath}`);
});

console.log('\n🎉 Todos los componentes Vue se han generado correctamente.');
console.log('📂 Ubicación: src/views/');