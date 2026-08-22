<template>
  <div class="fixed inset-0 z-[1050] flex items-center justify-center p-4">
    <div @click="$emit('cerrar')" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <div
      class="relative bg-[#f7f9fb] w-full max-w-6xl max-h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
    >
      <header class="p-8 bg-white border-b border-slate-100 flex justify-between items-center flex-shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="bg-cyan-50 text-[#06b6d4] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-cyan-100"
              >Módulo de Ventas</span
            >
            <span
              v-if="cotizacionInfo.numero"
              class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest"
            >
              Editando: {{ cotizacionInfo.numero }}
            </span>
          </div>
          <h2 class="text-3xl font-black text-slate-900">
            {{ cotizacionInfo.numero ? 'Editar Cotización' : 'Generar Cotización' }}
          </h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {{
              cotizacionInfo.cliente
                ? cotizacionInfo.cliente
                : 'Configuración técnica de presupuesto personalizado'
            }}
          </p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center"
        >
          <span class="material-icons">close</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
          <div
            class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">
            Cargando plantillas y monedas...
          </p>
        </div>

        <div v-else class="space-y-8">
          <section class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                Cargar Cotización Anterior del Cliente
              </label>
              <select
                v-model="presupuestoSeleccionado"
                class="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700 shadow-sm transition-all"
              >
                <option :value="null">➕ Crear Nueva Cotización</option>
                <option v-for="p in historialPresupuestos" :key="p.id" :value="p.id">
                  {{ p.numero_cotizacion }} | {{ formatDate(p.fecha_creacion) }} |
                  {{ p.nota_corta || 'Sin notas' }}... | {{ p.moneda_simbolo }}
                  {{ Number(p.total).toFixed(2) }}
                </option>
              </select>

              <div
                v-if="presupuestoSeleccionado"
                class="flex items-center gap-3 mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-100"
              >
                <input
                  type="checkbox"
                  v-model="actualizarFecha"
                  id="actualizarFecha"
                  class="w-5 h-5 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4] cursor-pointer"
                />
                <label for="actualizarFecha" class="text-sm font-bold text-slate-600 cursor-pointer">
                  Actualizar la fecha del documento a HOY antes de reimprimir
                </label>
              </div>
            </div>
          </section>

          <div v-if="!presupuestoSeleccionado" class="space-y-10">
            <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Plantilla de Diseño</label>
                <select
                  v-model="presupuesto.plantilla_id"
                  class="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700 shadow-sm transition-all"
                >
                  <option v-for="p in plantillas" :key="p.id" :value="p.id">
                    {{ p.nombre }} ({{ p.tipo_estructura }})
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Moneda del Documento</label>
                <select
                  v-model="presupuesto.moneda_id"
                  class="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700 shadow-sm transition-all"
                >
                  <option v-for="m in monedas" :key="m.id" :value="m.id">
                    {{ m.nombre }} (Simbolo: {{ m.simbolo }})
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Política de Anticipo</label>
                <select
                  v-model="presupuesto.nota_anticipo"
                  class="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 font-bold text-slate-700 shadow-sm transition-all"
                >
                  <option value="Anticipo del 100% requerido">100% requerido (Totalidad)</option>
                  <option value="Anticipo del 80% requerido">80% requerido</option>
                  <option value="Anticipo del 60% requerido">60% requerido</option>
                  <option value="Anticipo del 40% requerido">40% requerido</option>
                  <option value="Anticipo del 20% requerido">20% requerido (Mínimo)</option>
                </select>
              </div>
            </section>

            <section class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-icons text-slate-400">inventory_2</span>
                <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
                  Insumos y Materiales (Uso Interno)
                </h3>
                <button
                  @click="agregarMaterial"
                  class="ml-auto text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <span class="material-icons text-sm">add_circle</span> Añadir
                </button>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(mat, index) in presupuesto.materiales"
                  :key="index"
                  class="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl"
                >
                  <div class="col-span-6">
                    <select
                      v-model="mat.producto_id"
                      @change="actualizarInfoMaterial(index)"
                      class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20 rounded-lg p-1"
                    >
                      <option value="">Seleccionar producto...</option>
                      <option v-for="p in inventario" :key="p.id" :value="p.id" :disabled="!p.activo">
                        {{ p.nombre }} (Stock: {{ p.stock_actual }})
                      </option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <input
                      v-model.number="mat.cantidad"
                      type="number"
                      step="0.01"
                      class="w-full text-center py-1 bg-white border-none rounded-lg font-black text-sm outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
                      placeholder="Cant."
                    />
                  </div>
                  <div class="col-span-2 text-right">
                    <span class="text-slate-400 text-xs">Costo: Q</span>
                    <span class="font-bold text-slate-600 text-sm">{{ (mat.cantidad * mat.costo_unitario).toFixed(2) }}</span>
                  </div>
                  <div class="col-span-2 flex items-center justify-end gap-2">
                    <span class="text-[#06b6d4] font-black text-sm">Q {{ (mat.cantidad * mat.precio_venta).toFixed(2) }}</span>
                    <button
                      @click="removerMaterial(index)"
                      class="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <span class="material-icons text-lg">delete_outline</span>
                    </button>
                  </div>
                </div>

                <p v-if="presupuesto.materiales.length === 0" class="text-center text-slate-400 text