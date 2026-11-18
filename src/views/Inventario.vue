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
        <!-- NUEVO: exportar listado de productos a HTML imprimible en PDF -->
        <button
          @click="exportarListado"
          title="Exporta los productos de la categoría seleccionada (o todos) a un HTML listo para imprimir en PDF"
          class="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:text-[#06b6d4] hover:border-[#06b6d4]/40 transition-all flex items-center gap-2"
        >
          <span class="material-icons">print</span> Exportar Listado
        </button>
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

                <!-- NUEVO: grid de proveedores del producto (del más reciente al más antiguo) -->
                <div
                  v-if="(item.proveedores_rel || []).length > 0"
                  class="mt-4 ml-1 max-w-[300px]"
                >
                  <p
                    class="text-[9px] font-black text-slate-300 uppercase tracking-[0.18em] mb-1.5 flex items-center gap-1"
                  >
                    <span class="material-icons text-xs">local_shipping</span> Proveedores
                  </p>
                  <div class="space-y-1">
                    <div
                      v-for="rel in item.proveedores_rel"
                      :key="rel.id"
                      class="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 group-hover:border-cyan-100 transition-colors"
                    >
                      <span class="text-[10px] font-bold text-slate-600 truncate">
                        {{ rel.nombre_empresa }}
                      </span>
                      <span class="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                        {{ formatearFecha(rel.fecha_ultima_compra) }}
                      </span>
                    </div>
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
    <!-- MODAL DE CREACIÓN / EDICIÓN                -->
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
            <!-- CAMPO: DESCRIPCIÓN                         -->
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
            <!-- CAMPO: PROVEEDORES DEL PRODUCTO (NUEVO)    -->
            <!-- Historial editable: del más reciente al    -->
            <!-- más antiguo, igual que el grid de la tabla -->
            <!-- ========================================== -->
            <div class="md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div class="flex justify-between items-center mb-1">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                  >Proveedores del Producto</label
                >
                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-1">
                  {{ proveedoresProducto.length }} registro(s)
                </span>
              </div>
              <p class="text-[10px] text-slate-400 mb-4 ml-1 leading-relaxed">
                Historial de compras por proveedor (fecha, documento y cantidad de la última
                compra). Se ordena automáticamente del más reciente al más antiguo. Las filas sin
                proveedor seleccionado no se guardan.
              </p>

              <template v-if="editando">
                <div class="space-y-3">
                  <div
                    v-for="(rel, indiceRel) in proveedoresProducto"
                    :key="indiceRel"
                    class="bg-white rounded-xl border border-slate-100 p-4"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div class="md:col-span-4 flex flex-col gap-1.5">
                        <label
                          class="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1"
                          >Proveedor</label
                        >
                        <select
                          v-model="rel.proveedor_id"
                          class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 text-sm"
                        >
                          <option value="" disabled>Seleccionar proveedor...</option>
                          <option v-for="prov in proveedoresDB" :key="prov.id" :value="prov.id">
                            {{ prov.nombre_empresa }}
                          </option>
                        </select>
                      </div>
                      <div class="md:col-span-3 flex flex-col gap-1.5">
                        <label
                          class="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1"
                          >Última Compra</label
                        >
                        <input
                          v-model="rel.fecha_ultima_compra"
                          type="date"
                          class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 text-sm"
                        />
                      </div>
                      <div class="md:col-span-3 flex flex-col gap-1.5">
                        <label
                          class="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1"
                          >Documento / Ref.</label
                        >
                        <input
                          v-model="rel.documento"
                          type="text"
                          placeholder="FAC-001-2024"
                          class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 text-sm"
                        />
                      </div>
                      <div class="md:col-span-2 flex flex-col gap-1.5">
                        <label
                          class="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1"
                          >Cantidad</label
                        >
                        <input
                          v-model.number="rel.cantidad"
                          type="number"
                          step="0.01"
                          placeholder="0"
                          class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all font-bold text-slate-700 text-sm"
                        />
                      </div>
                    </div>
                    <div class="flex justify-end mt-2">
                      <button
                        type="button"
                        @click="quitarRelProveedor(indiceRel)"
                        class="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <span class="material-icons text-sm">delete_outline</span> Eliminar
                      </button>
                    </div>
                  </div>

                  <p
                    v-if="proveedoresProducto.length === 0"
                    class="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-4"
                  >
                    Este producto aún no tiene proveedores registrados
                  </p>
                </div>

                <button
                  type="button"
                  @click="agregarRelProveedor"
                  class="mt-3 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-[#06b6d4]/50 hover:text-[#06b6d4] hover:bg-cyan-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <span class="material-icons text-sm">add_circle</span> Agregar Proveedor
                </button>
              </template>

              <p
                v-else
                class="text-[10px] text-slate-400 bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-2"
              >
                <span class="material-icons text-sm text-[#06b6d4]">info</span>
                Guarda el producto primero; después edítalo para asignarle sus proveedores.
              </p>
            </div>

            <!-- ========================================== -->
            <!-- CAMPO: FOTOGRAFÍAS                         -->
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
    <!-- MODAL VISOR DE IMÁGENES                    -->
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
import logoBrinco from '../assets/logo.png'

// --- ESTADO ---
const productos = ref([])
const categoriasDB = ref([])
const proveedoresDB = ref([]) // NUEVO: catálogo de proveedores para el modal de edición
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

// NUEVO: relaciones producto <-> proveedor del producto en edición
// (cada fila: proveedor_id, fecha_ultima_compra, documento, cantidad)
const proveedoresProducto = ref([])

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

// NUEVO: productos del listado exportable.
// Según lo pedido: si hay una categoría seleccionada solo esa; si está "Todos",
// salen todos los productos (no aplica el filtro de búsqueda).
const listaExportacion = computed(() => {
  if (categoriaSeleccionada.value === 'TODOS') return productos.value
  return productos.value.filter((p) => p.categoria_nombre === categoriaSeleccionada.value)
})

// --- NUEVO: helpers de proveedores, fechas y formato ---

// Ordena relaciones de la compra más reciente a la más antigua (sin fecha al final)
const ordenReciente = (a, b) => {
  const fa = a.fecha_ultima_compra || ''
  const fb = b.fecha_ultima_compra || ''
  if (fa !== fb) return fa < fb ? 1 : -1
  return (b.id || 0) - (a.id || 0)
}

// '2026-07-26' -> '26/07/2026'
const formatearFecha = (valor) => {
  if (!valor) return '—'
  const partes = String(valor).slice(0, 10).split('-')
  if (partes.length !== 3) return String(valor)
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

// Número de fotografías guardadas del producto (para el listado exportable)
const contarFotos = (item) => (item.imagen1_url ? 1 : 0) + (item.imagen2_url ? 1 : 0)

const escapeHtml = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatoQ = (valor) =>
  'Q ' +
  Number(valor || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// --- MÉTODOS ---
const cargarInventario = async () => {
  try {
    cargando.value = true
    error.value = null
    const response = await api.get('/inventario')

    // NUEVO: relaciones producto <-> proveedor para el grid de cada fila.
    // Si la ruta del backend aún no está integrada, el inventario carga igual
    // y simplemente no muestra proveedores.
    let relaciones = []
    try {
      const resRel = await api.get('/inventario-proveedores')
      relaciones = Array.isArray(resRel.data) ? resRel.data : []
    } catch (errRel) {
      console.warn('Ruta /inventario-proveedores no disponible todavía:', errRel?.message)
    }

    const mapaRelaciones = {}
    relaciones.forEach((rel) => {
      if (!mapaRelaciones[rel.producto_id]) mapaRelaciones[rel.producto_id] = []
      mapaRelaciones[rel.producto_id].push(rel)
    })
    Object.values(mapaRelaciones).forEach((lista) => lista.sort(ordenReciente))

    productos.value = response.data.map((p) => ({
      ...p,
      proveedores_rel: mapaRelaciones[p.id] || [],
    }))

    if (categoriasDB.value.length === 0) {
      const respCat = await api.get('/categorias')
      categoriasDB.value = respCat.data
    }
    if (proveedoresDB.value.length === 0) {
      try {
        const respProv = await api.get('/proveedores')
        proveedoresDB.value = Array.isArray(respProv.data) ? respProv.data : []
      } catch (errProv) {
        console.error('No se pudieron cargar los proveedores:', errProv)
      }
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
  proveedoresProducto.value = []
  limpiarImagenes()
  modalAbierto.value = true
}

const abrirModalEdicion = (item) => {
  editando.value = true
  productoId.value = item.id
  formulario.value = { ...item }
  // NUEVO: copia editable de las relaciones del producto (más reciente primero)
  proveedoresProducto.value = (item.proveedores_rel || [])
    .slice()
    .sort(ordenReciente)
    .map((r) => ({
      proveedor_id: r.proveedor_id,
      fecha_ultima_compra: r.fecha_ultima_compra || '',
      documento: r.documento || '',
      cantidad: r.cantidad === null || r.cantidad === undefined ? null : r.cantidad,
    }))
  limpiarImagenes()
  modalAbierto.value = true
}

// NUEVO: agregar una fila vacía de proveedor en el modal
const agregarRelProveedor = () => {
  proveedoresProducto.value.push({
    proveedor_id: '',
    fecha_ultima_compra: '',
    documento: '',
    cantidad: null,
  })
}

// NUEVO: quitar una fila de proveedor en el modal
const quitarRelProveedor = (indice) => {
  proveedoresProducto.value.splice(indice, 1)
}

// NUEVO: envía el set completo de relaciones al backend (reemplazo total)
const guardarRelacionesProducto = async () => {
  const relacionesLimpias = proveedoresProducto.value
    .filter((r) => r.proveedor_id)
    .map((r) => {
      const cantidadNum = Number(r.cantidad)
      return {
        proveedor_id: r.proveedor_id,
        fecha_ultima_compra: r.fecha_ultima_compra || null,
        documento: (r.documento || '').trim(),
        cantidad:
          r.cantidad === '' || r.cantidad === null || Number.isNaN(cantidadNum)
            ? null
            : cantidadNum,
      }
    })
  await api.put(`/inventario/${productoId.value}/proveedores`, {
    relaciones: relacionesLimpias,
  })
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

    // NUEVO: persistir las relaciones producto <-> proveedor (solo en edición,
    // porque el producto debe existir ya en la base de datos).
    if (editando.value) {
      try {
        await guardarRelacionesProducto()
      } catch (errRel) {
        console.error('Error al guardar proveedores del producto:', errRel)
        alert(
          'El producto se guardó, pero hubo un problema al guardar su lista de proveedores. Vuelve a editarlo e inténtalo de nuevo.',
        )
      }
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

// --- NUEVO: EXPORTAR LISTADO DE PRODUCTOS A HTML (imprimible en PDF) ---

const nombreArchivoExport = () => {
  const base =
    categoriaSeleccionada.value === 'TODOS'
      ? 'todas-las-categorias'
      : categoriaSeleccionada.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
  const hoy = new Date()
  const sello = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`
  return `listado-productos-${base}-${sello}.html`
}

// Convierte el logo (src/assets/logo.png) a data-URI base64 para incrustarlo
// en el HTML exportado: asi el listado siempre muestra el logo, incluso
// guardado como archivo o impreso en PDF sin conexion al servidor.
let cacheLogoDataURI = null
const obtenerLogoDataURI = () => {
  if (cacheLogoDataURI) return Promise.resolve(cacheLogoDataURI)
  return new Promise((resolve) => {
    fetch(logoBrinco)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('logo no disponible'))))
      .then(
        (blob) =>
          new Promise((res, rej) => {
            const lector = new FileReader()
            lector.onload = () => res(lector.result)
            lector.onerror = rej
            lector.readAsDataURL(blob)
          }),
      )
      .then((dataURI) => {
        cacheLogoDataURI = dataURI
        resolve(dataURI)
      })
      .catch(() => resolve(null)) // sin logo: el listado sale solo con el texto
  })
}

const construirHTMLListado = (logoDataURI) => {
  const productosExport = listaExportacion.value
  const ahora = new Date()
  const fechaLarga = ahora.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const hora = ahora.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
  const etiquetaAlcance =
    categoriaSeleccionada.value === 'TODOS'
      ? 'Todas las categorías'
      : `Categoría: ${categoriaSeleccionada.value}`

  const filas = productosExport
    .map((p) => {
      const rels = (p.proveedores_rel || []).slice().sort(ordenReciente)
      const reciente = rels[0]
      const extras = rels.length > 1 ? ` <span class="mas">+${rels.length - 1}</span>` : ''
      const fotos = contarFotos(p)
      return `      <tr>
        <td class="sku">${escapeHtml(p.sku || 'S/SKU')}</td>
        <td class="nombre">${escapeHtml(p.nombre)}</td>
        <td><span class="badge-cat">${escapeHtml(p.categoria_nombre || 'S/C')}</span></td>
        <td class="desc">${escapeHtml(p.descripcion || '—')}</td>
        <td class="num">${Number(p.stock_actual ?? 0).toLocaleString('es-GT')}</td>
        <td class="num">${Number(p.stock_minimo ?? 0).toLocaleString('es-GT')}</td>
        <td class="num">${formatoQ(p.precio_compra_referencia)}</td>
        <td class="num precio-venta">${formatoQ(p.precio_venta_sugerido)}</td>
        <td class="num">${fotos}</td>
        <td class="prov">${reciente ? escapeHtml(reciente.nombre_empresa) + extras : '—'}</td>
        <td class="fecha">${reciente ? formatearFecha(reciente.fecha_ultima_compra) : '—'}</td>
      </tr>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Listado de Productos - Brinco Creativo</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, Roboto, Arial, sans-serif; color: #0f172a; padding: 28px; padding-top: 116px; }
  .encabezado { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; border-bottom: 4px solid #06b6d4; padding-bottom: 16px; margin-bottom: 22px; }
  .identidad { display: flex; align-items: center; gap: 16px; }
  .logo { height: 54px; width: auto; display: block; }
  .marca { font-size: 30px; font-weight: 900; letter-spacing: -0.5px; color: #06b6d4; }
  .submarca { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2.5px; margin-top: 4px; }
  .meta { text-align: right; font-size: 11px; color: #475569; line-height: 1.7; white-space: nowrap; }
  .meta b { color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  thead th { background: #f8fafc; color: #334155; text-transform: uppercase; font-size: 9px; letter-spacing: 1.2px; padding: 10px 8px; border-bottom: 2px solid #06b6d4; text-align: left; }
  tbody td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  tbody tr:nth-child(even) { background: #fafcfd; }
  .sku { font-family: Consolas, 'Courier New', monospace; font-size: 9.5px; color: #64748b; white-space: nowrap; }
  .nombre { font-weight: 800; }
  .desc { color: #64748b; font-size: 10px; max-width: 240px; }
  .badge-cat { display: inline-block; background: #f1f5f9; color: #475569; border-radius: 6px; padding: 2px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .precio-venta { color: #06b6d4; font-weight: 800; }
  .prov { font-weight: 700; }
  .mas { display: inline-block; background: #ecfeff; color: #0891b2; border: 1px solid #a5f3fc; border-radius: 6px; padding: 0 6px; font-size: 8.5px; font-weight: 800; }
  .fecha { color: #64748b; white-space: nowrap; }
  .pie { margin-top: 20px; display: flex; justify-content: space-between; font-size: 9.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
  .boton-imprimir { position: fixed; top: 18px; right: 18px; background: #06b6d4; color: #ffffff; border: none; padding: 13px 24px; border-radius: 12px; font-weight: 800; font-size: 12px; letter-spacing: 1px; cursor: pointer; box-shadow: 0 12px 28px rgba(6, 182, 212, 0.28); }
  .boton-imprimir:hover { background: #0891b2; }
  .ayuda { position: fixed; top: 72px; right: 18px; font-size: 10px; color: #64748b; max-width: 220px; text-align: right; }
  @media print { .boton-imprimir, .ayuda { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <button class="boton-imprimir" onclick="window.print()">Imprimir / Guardar PDF</button>
  <p class="ayuda">En el diálogo de impresión elige "Guardar como PDF" como destino.</p>

  <div class="encabezado">
    <div class="identidad">
      ${logoDataURI ? `<img class="logo" src="${logoDataURI}" alt="Brinco Creativo" />` : ''}
      <div>
        <p class="marca">BRINCO CREATIVO</p>
        <p class="submarca">Listado de Productos</p>
      </div>
    </div>
    <div class="meta">
      <b>${etiquetaAlcance}</b><br />
      ${fechaLarga} · ${hora}<br />
      ${productosExport.length} producto(s)
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Producto</th>
        <th>Categoría</th>
        <th>Descripción</th>
        <th style="text-align:right">Stock</th>
        <th style="text-align:right">Mínimo</th>
        <th style="text-align:right">P. Costo</th>
        <th style="text-align:right">P. Venta</th>
        <th style="text-align:right">Fotos</th>
        <th>Proveedor Reciente</th>
        <th>Última Compra</th>
      </tr>
    </thead>
    <tbody>
${filas}
    </tbody>
  </table>

  <div class="pie">
    <span>Brinco Creativo · Listado generado el ${fechaLarga} a las ${hora}</span>
    <span>${etiquetaAlcance} · ${productosExport.length} producto(s)</span>
  </div>
</body>
</html>`
}

const exportarListado = async () => {
  if (listaExportacion.value.length === 0) {
    alert('No hay productos para exportar con la categoría seleccionada.')
    return
  }

  // Primero se prepara el logo (data-URI) y luego se arma el HTML completo
  const logoDataURI = await obtenerLogoDataURI()
  const html = construirHTMLListado(logoDataURI)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Abre el listado en una pestaña nueva; desde ahí se imprime en PDF
  const ventana = window.open(url, '_blank')
  if (!ventana) {
    // Fallback si el navegador bloquea las ventanas emergentes: descarga el .html
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivoExport()
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    alert(
      'El navegador bloqueó la ventana emergente: el listado se descargó como archivo HTML. Ábrelo y presiona "Imprimir / Guardar PDF".',
    )
  }

  setTimeout(() => URL.revokeObjectURL(url), 60000)
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

