<template>
  <div class="w-full">
    <!-- Encabezado de Sección -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
      <div>
        <h1 class="text-4xl font-black text-slate-900 mb-2">Inventario de Insumos</h1>
        <p class="text-slate-500 font-medium">
          Gestiona existencias, fotos y precios de venta para presupuestación.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="abrirModalCreacion"
          class="bg-[#06b6d4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span class="material-icons">add_circle</span> Agregar Insumo
        </button>
      </div>
    </header>

    <!-- Estado de Carga -->
    <div
      v-if="cargando"
      class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm"
    >
      <div
        class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-6 font-bold text-slate-400 uppercase tracking-widest text-xs">
        Sincronizando con base de datos...
      </p>
    </div>

    <!-- Manejo de Errores -->
    <div
      v-else-if="error"
      class="p-12 bg-red-50 rounded-3xl border border-red-100 text-center shadow-sm"
    >
      <div
        class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <span class="material-icons text-4xl">cloud_off</span>
      </div>
      <h3 class="text-xl font-black text-red-900 mb-2">Error de Sincronización</h3>
      <p class="text-red-600 mb-8 max-w-md mx-auto">{{ error }}</p>
      <button
        @click="cargarInventario"
        class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
      >
        Reintentar Conexión
      </button>
    </div>

    <!-- Contenido Principal -->
    <div v-else class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div
        class="p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30"
      >
        <div
          class="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full custom-scrollbar"
        >
          <button
            @click="categoriaSeleccionada = 'TODOS'"
            :class="
              categoriaSeleccionada === 'TODOS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            "
            class="px-5 py-2 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap"
          >
            Todos
          </button>
          <button
            v-for="cat in listaCategorias"
            :key="cat"
            @click="categoriaSeleccionada = cat"
            :class="
              categoriaSeleccionada === cat
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            "
            class="px-5 py-2 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap"
          >
            {{ cat }}
          </button>
        </div>

        <div class="relative w-full lg:w-80">
          <span
            class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            >search</span
          >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre o SKU..."
            class="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-sm focus:ring-4 focus:ring-[#06b6d4]/10 focus:border-[#06b6d4]/30 transition-all shadow-inner"
          />
        </div>
      </div>

      <!-- Tabla de Insumos -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100"
            >
              <th class="px-8 py-5">Producto / SKU</th>
              <th class="px-6 py-5 text-center">Fotos</th>
              <th class="px-8 py-5 text-center">Categoría</th>
              <th class="px-8 py-5">Nivel de Stock</th>
              <th class="px-8 py-5">Precio Costo</th>
              <th class="px-8 py-5">Precio Venta</th>
              <th class="px-8 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="item in productosFiltrados"
              :key="item.id"
              class="hover:bg-slate-50/30 transition-all group"
            >
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <!-- Miniatura o Icono -->
                  <div
                    v-if="item.imagen1_url"
                    class="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-slate-100 group-hover:border-cyan-200 transition-colors"
                  >
                    <img
                      :src="item.imagen1_url"
                      :alt="item.nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-[#06b6d4] transition-colors flex-shrink-0"
                  >
                    <span class="material-icons text-2xl">inventory_2</span>
                  </div>
                  <div>
                    <p class="font-black text-slate-800 text-base leading-tight">
                      {{ item.nombre }}
                    </p>
                    <p class="text-[11px] text-slate-400 font-mono mt-1 tracking-wider">
                      {{ item.sku }}
                    </p>
                    <p
                      v-if="item.descripcion"
                      class="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-[220px]"
                    >
                      {{ item.descripcion }}
                    </p>
                  </div>
                </div>
              </td>
              <!-- Columna de Fotos -->
              <td class="px-6 py-6">
                <div class="flex justify-center gap-2">
                  <div
                    v-if="item.imagen1_url"
                    class="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                    @click="abrirVisorImagenes(item)"
                  >
                    <img :src="item.imagen1_url" class="w-full h-full object-cover" />
                  </div>
                  <div
                    v-if="item.imagen2_url"
                    class="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                    @click="abrirVisorImagenes(item)"
                  >
                    <img :src="item.imagen2_url" class="w-full h-full object-cover" />
                  </div>
                  <span
                    v-if="!item.imagen1_url && !item.imagen2_url"
                    class="text-[10px] text-slate-300 font-bold"
                  >
                    —
                  </span>
                </div>
              </td>
              <td class="px-8 py-6 text-center">
                <span
                  class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight"
                >
                  {{ item.categoria_nombre || 'S/C' }}
                </span>
              </td>
              <td class="px-8 py-6">
                <div class="flex flex-col gap-1">
                  <div class="flex items-end gap-2">
                    <span class="font-black text-slate-900 text-xl leading-none">{{
                      Number(item.stock_actual).toLocaleString()
                    }}</span>
                    <span
                      class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5"
                      >unidades</span
                    >
                  </div>
                  <div class="flex">
                    <span
                      v-if="Number(item.stock_actual) <= Number(item.stock_minimo)"
                      class="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[9px] font-black uppercase tracking-widest border border-red-100"
                    >
                      Stock Crítico
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100"
                    >
                      Nivel Óptimo
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="font-bold text-slate-600 text-base"
                  >Q {{ Number(item.precio_compra_referencia).toFixed(2) }}</span
                >
              </td>
              <td class="px-8 py-6">
                <span class="font-black text-[#06b6d4] text-xl"
                  >Q {{ Number(item.precio_venta_sugerido).toFixed(2) }}</span
                >
              </td>
              <td class="px-8 py-6">
                <div class="flex justify-center gap-2">
                  <button
                    @click="abrirModalEdicion(item)"
                    title="Editar Insumo"
                    class="p-3 text-slate-300 hover:text-[#06b6d4] hover:bg-cyan-50 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">edit</span>
                  </button>
                  <button
                    @click="cambiarEstatus(item.id, !item.activo)"
                    :title="item.activo ? 'Desactivar para Órdenes' : 'Activar para Órdenes'"
                    :class="
                      item.activo
                        ? 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                        : 'text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                    "
                    class="p-3 rounded-xl transition-all"
                  >
                    <span class="material-icons text-xl">{{
                      item.activo ? 'visibility_off' : 'visibility'
                    }}</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="productosFiltrados.length === 0">
              <td
                colspan="7"
                class="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
              >
                No se encontraron insumos que coincidan con los filtros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer
        class="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
      >
        <span>Mostrando {{ productosFiltrados.length }} de {{ productos.length }} insumos</span>
        <div class="flex flex-col md:flex-row gap-4 md:gap-8 items-end md:items-center">
          <div class="flex flex-col items-end">
            <span class="mb-1">Valuación a Costo</span>
            <span class="text-slate-900 text-sm font-black tracking-tight"
              >Q {{ totalValuacionCosto }}</span
            >
          </div>
          <div class="flex flex-col items-end">
            <span class="mb-1 text-[#06b6d4]">Valuación a Venta</span>
            <span class="text-[#06b6d4] text-lg font-black tracking-tight"
              >Q {{ totalValuacionVenta }}</span
            >
          </div>
        </div>
      </footer>
    </div>

    <!-- ========================================== -->
    <!-- MODAL DE CREACIÓN / EDICIÓN -->
    <!-- ========================================== -->
    <div v-if="modalAbierto" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div @click="cerrarModal" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

      <div
        class="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col"
      >
        <header
          class="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0"
        >
          <div>
            <h2 class="text-2xl font-black text-slate-900">
              {{ editando ? 'Editar Insumo' : 'Nuevo Insumo' }}
            </h2>
            <p
              v-if="editando"
              class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1"
            >
              SKU: {{ formulario.sku }}
            </p>
            <p v-else class="text-xs font-bold text-[#06b6d4] uppercase tracking-widest mt-1">
              Registro de nuevo material comercial
            </p>
          </div>
          <button
            @click="cerrarModal"
            class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            <span class="material-icons">close</span>
          </button>
        </header>

        <form @submit.prevent="guardarInsumo" class="p-8 space-y-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Nombre del Producto</label
              >
              <input
                v-model="formulario.nombre"
                required
                type="text"
                placeholder="Ej. Taza Blanca 11oz AAA"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <!-- SKU y Categoría -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >SKU / ID</label
              >
              <input
                v-model="formulario.sku"
                :disabled="editando"
                required
                type="text"
                placeholder="SUB-TAZA-001"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 disabled:opacity-50"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Categoría</label
              >
              <select
                v-model="formulario.categoria_id"
                required
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              >
                <option value="" disabled>Seleccionar...</option>
                <option v-for="cat in categoriasDB" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>

            <!-- Precios -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Precio de Costo (Q)</label
              >
              <input
                v-model="formulario.precio_compra_referencia"
                required
                type="number"
                step="0.01"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2 text-[#06b6d4]">
              <label class="text-[10px] font-black uppercase tracking-widest ml-2"
                >Precio de Venta Sugerido (Q)</label
              >
              <input
                v-model="formulario.precio_venta_sugerido"
                required
                type="number"
                step="0.01"
                class="w-full px-5 py-3 bg-cyan-50 border border-cyan-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/20 transition-all font-black text-[#06b6d4]"
              />
            </div>

            <!-- Stock y Alerta -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Stock Actual</label
              >
              <input
                v-model="formulario.stock_actual"
                required
                type="number"
                step="0.01"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Alerta Stock Mínimo</label
              >
              <input
                v-model="formulario.stock_minimo"
                required
                type="number"
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700"
              />
            </div>

            <!-- ========================================== -->
            <!-- CAMPO: DESCRIPCIÓN -->
            <!-- ========================================== -->
            <div class="md:col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                >Descripción del Producto</label
              >
              <textarea
                v-model="formulario.descripcion"
                rows="4"
                placeholder="Describe el producto: características, medidas, material, usos recomendados, observaciones especiales..."
                class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-medium text-slate-600 text-sm resize-none leading-relaxed"
              ></textarea>
              <span class="text-[10px] text-slate-300 ml-2">
                {{ (formulario.descripcion || '').length }} caracteres
              </span>
            </div>

            <!-- ========================================== -->
            <!-- CAMPO: FOTOGRAFÍAS -->
            <!-- ========================================== -->
            <div class="md:col-span-2">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block"
                >Fotografías del Producto (máximo 2)</label
              >

              <div class="grid grid-cols-2 gap-4">
                <!-- Foto 1 -->
                <div class="relative">
                  <div
                    v-if="previewImagen1"
                    class="w-full aspect-square rounded-2xl overflow-hidden border-2 border-cyan-200 bg-slate-50"
                  >
                    <img :src="previewImagen1" class="w-full h-full object-cover" alt="Preview 1" />
                  </div>
                  <div
                    v-else-if="formulario.imagen1_url && !archivosImagenes[0]"
                    class="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 relative group/img"
                  >
                    <img
                      :src="formulario.imagen1_url"
                      class="w-full h-full object-cover"
                      alt="Imagen actual 1"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span class="text-white text-[10px] font-black uppercase">Guardada</span>
                    </div>
                  </div>
                  <div
                    v-else
                    class="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 hover:border-[#06b6d4]/50 hover:bg-cyan-50/30 transition-all cursor-pointer"
                    @click="$refs.inputImagen1.click()"
                  >
                    <span class="material-icons text-3xl text-slate-300">add_photo_alternate</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Foto 1</span>
                  </div>

                  <input
                    ref="inputImagen1"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="manejarArchivoImagen($event, 0)"
                  />

                  <button
                    v-if="previewImagen1 || (formulario.imagen1_url && !archivosImagenes[0])"
                    type="button"
                    @click="eliminarImagen(1)"
                    class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <span class="material-icons text-sm">close</span>
                  </button>

                  <button
                    v-if="previewImagen1"
                    type="button"
                    @click="$refs.inputImagen1.click()"
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                <!-- Foto 2 -->
                <div class="relative">
                  <div
                    v-if="previewImagen2"
                    class="w-full aspect-square rounded-2xl overflow-hidden border-2 border-cyan-200 bg-slate-50"
                  >
                    <img :src="previewImagen2" class="w-full h-full object-cover" alt="Preview 2" />
                  </div>
                  <div
                    v-else-if="formulario.imagen2_url && !archivosImagenes[1]"
                    class="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 relative group/img"
                  >
                    <img
                      :src="formulario.imagen2_url"
                      class="w-full h-full object-cover"
                      alt="Imagen actual 2"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span class="text-white text-[10px] font-black uppercase">Guardada</span>
                    </div>
                  </div>
                  <div
                    v-else
                    class="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 hover:border-[#06b6d4]/50 hover:bg-cyan-50/30 transition-all cursor-pointer"
                    @click="$refs.inputImagen2.click()"
                  >
                    <span class="material-icons text-3xl text-slate-300">add_photo_alternate</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Foto 2</span>
                    <span class="text-[9px] text-slate-300">(Opcional)</span>
                  </div>

                  <input
                    ref="inputImagen2"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="manejarArchivoImagen($event, 1)"
                  />

                  <button
                    v-if="previewImagen2 || (formulario.imagen2_url && !archivosImagenes[1])"
                    type="button"
                    @click="eliminarImagen(2)"
                    class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <span class="material-icons text-sm">close</span>
                  </button>

                  <button
                    v-if="previewImagen2"
                    type="button"
                    @click="$refs.inputImagen2.click()"
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              <p class="text-[10px] text-slate-400 mt-3 ml-2 flex items-center gap-1">
                <span class="material-icons text-xs">info</span>
                Las imágenes se suben a la nube al guardar. Máximo 5MB por foto.
              </p>
            </div>
          </div>

          <div class="flex gap-4 pt-4 border-t border-slate-50 flex-shrink-0">
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
              {{ guardando ? 'Subiendo...' : editando ? 'Guardar Cambios' : 'Registrar Insumo' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL VISOR DE IMÁGENES -->
    <!-- ========================================== -->
    <div v-if="visorAbierto" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        @click="visorAbierto = false"
        class="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      ></div>

      <div class="relative max-w-3xl w-full animate-in fade-in zoom-in duration-200">
        <button
          @click="visorAbierto = false"
          class="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <span class="material-icons">close</span>
        </button>

        <div class="flex gap-4 justify-center">
          <div
            v-if="visorDatos.imagen1_url"
            class="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              :src="visorDatos.imagen1_url"
              :alt="visorDatos.nombre"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-if="visorDatos.imagen2_url"
            class="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              :src="visorDatos.imagen2_url"
              :alt="visorDatos.nombre"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <p class="text-center text-white font-black text-lg mt-4">{{ visorDatos.nombre }}</p>
        <p
          v-if="visorDatos.descripcion"
          class="text-center text-white/60 text-sm mt-1 max-w-lg mx-auto leading-relaxed"
        >
          {{ visorDatos.descripcion }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

// --- ESTADO ---
const productos = ref([])
const categoriasDB = ref([])
const cargando = ref(true)
const guardando = ref(false)
const error = ref(null)

// --- FILTROS ---
const busqueda = ref('')
const categoriaSeleccionada = ref('TODOS')

// --- MODAL ---
const modalAbierto = ref(false)
const editando = ref(false)
const productoId = ref(null)
const formulario = ref({
  nombre: '',
  sku: '',
  categoria_id: '',
  stock_actual: 0,
  stock_minimo: 0,
  precio_compra_referencia: 0,
  precio_venta_sugerido: 0,
  descripcion: '',
  imagen1_url: null,
  imagen2_url: null,
  activo: true,
})

// --- IMÁGENES ---
const archivosImagenes = ref([null, null])
const previewImagen1 = ref(null)
const previewImagen2 = ref(null)
const eliminarImagen1 = ref(false)
const eliminarImagen2 = ref(false)

// --- VISOR ---
const visorAbierto = ref(false)
const visorDatos = ref({})

// --- COMPUTADAS ---
const listaCategorias = computed(() => {
  const categorias = productos.value
    .map((p) => p.categoria_nombre)
    .filter((name) => name !== null && name !== undefined)
  return [...new Set(categorias)].sort()
})

const productosFiltrados = computed(() => {
  return productos.value.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.value.toLowerCase())
    const matchCategoria =
      categoriaSeleccionada.value === 'TODOS' || p.categoria_nombre === categoriaSeleccionada.value
    return matchBusqueda && matchCategoria
  })
})

const totalValuacionCosto = computed(() => {
  const total = productosFiltrados.value.reduce(
    (acc, p) => acc + Number(p.stock_actual) * Number(p.precio_compra_referencia),
    0,
  )
  return total.toLocaleString(undefined, { minimumFractionDigits: 2 })
})

const totalValuacionVenta = computed(() => {
  const total = productosFiltrados.value.reduce(
    (acc, p) => acc + Number(p.stock_actual) * Number(p.precio_venta_sugerido),
    0,
  )
  return total.toLocaleString(undefined, { minimumFractionDigits: 2 })
})

// --- MÉTODOS ---
const cargarInventario = async () => {
  try {
    cargando.value = true
    error.value = null
    const response = await api.get('/inventario')
    productos.value = response.data

    if (categoriasDB.value.length === 0) {
      const respCat = await api.get('/categorias')
      categoriasDB.value = respCat.data
    }
  } catch (err) {
    console.error('Error en conexión API:', err)
    error.value = 'No se pudo establecer conexión con el servidor backend.'
  } finally {
    cargando.value = false
  }
}

const limpiarImagenes = () => {
  archivosImagenes.value = [null, null]
  previewImagen1.value = null
  previewImagen2.value = null
  eliminarImagen1.value = false
  eliminarImagen2.value = false
}

const abrirModalCreacion = () => {
  editando.value = false
  productoId.value = null
  formulario.value = {
    nombre: '',
    sku: '',
    categoria_id: '',
    stock_actual: 0,
    stock_minimo: 0,
    precio_compra_referencia: 0,
    precio_venta_sugerido: 0,
    descripcion: '',
    imagen1_url: null,
    imagen2_url: null,
    activo: true,
  }
  limpiarImagenes()
  modalAbierto.value = true
}

const abrirModalEdicion = (item) => {
  editando.value = true
  productoId.value = item.id
  formulario.value = { ...item }
  limpiarImagenes()
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

// --- MANEJO DE IMÁGENES ---
const manejarArchivoImagen = (event, index) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no puede ser mayor a 5MB')
    event.target.value = ''
    return
  }

  archivosImagenes.value[index] = file

  const reader = new FileReader()
  reader.onload = (e) => {
    if (index === 0) {
      previewImagen1.value = e.target.result
    } else {
      previewImagen2.value = e.target.result
    }
  }
  reader.readAsDataURL(file)
}

const eliminarImagen = (numero) => {
  if (numero === 1) {
    if (previewImagen1.value) {
      previewImagen1.value = null
      archivosImagenes.value[0] = null
    } else if (formulario.value.imagen1_url) {
      eliminarImagen1.value = true
      formulario.value.imagen1_url = null
    }
  } else {
    if (previewImagen2.value) {
      previewImagen2.value = null
      archivosImagenes.value[1] = null
    } else if (formulario.value.imagen2_url) {
      eliminarImagen2.value = true
      formulario.value.imagen2_url = null
    }
  }
}

// --- GUARDAR ---
const guardarInsumo = async () => {
  try {
    guardando.value = true

    const formData = new FormData()
    formData.append('categoria_id', formulario.value.categoria_id || '')
    formData.append('nombre', formulario.value.nombre)
    formData.append('descripcion', formulario.value.descripcion || '')
    formData.append('sku', formulario.value.sku)
    formData.append('stock_actual', formulario.value.stock_actual)
    formData.append('stock_minimo', formulario.value.stock_minimo)
    formData.append('precio_compra_referencia', formulario.value.precio_compra_referencia)
    formData.append('precio_venta_sugerido', formulario.value.precio_venta_sugerido)

    // Agregar archivos de imagen si existen
    archivosImagenes.value.forEach((archivo) => {
      if (archivo) {
        formData.append('imagenes', archivo)
      }
    })

    // Si estamos editando, indicar qué imágenes eliminar
    if (editando.value) {
      formData.append('eliminar_imagen1', eliminarImagen1.value ? 'true' : 'false')
      formData.append('eliminar_imagen2', eliminarImagen2.value ? 'true' : 'false')
    }

    if (editando.value) {
      await api.put(`/inventario/${productoId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/inventario', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    await cargarInventario()
    cerrarModal()
  } catch (err) {
    console.error('Error al guardar:', err)
    if (err.response?.data?.error) {
      alert(err.response.data.error)
    } else {
      alert('Error al intentar guardar la información comercial.')
    }
  } finally {
    guardando.value = false
  }
}

const cambiarEstatus = async (id, nuevoEstado) => {
  try {
    await api.patch(`/inventario/${id}/estado`, { activo: nuevoEstado })
    await cargarInventario()
  } catch (err) {
    alert('Error técnico al actualizar el estado.')
  }
}

// --- VISOR ---
const abrirVisorImagenes = (item) => {
  if (!item.imagen1_url && !item.imagen2_url) return
  visorDatos.value = item
  visorAbierto.value = true
}

onMounted(cargarInventario)
</script>

<style scoped>
.group:hover .material-icons {
  transform: translateY(-1px);
}
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-in {
  animation:
    fadeIn 0.2s ease-out,
    zoomIn 0.2s ease-out;
}
</style>
