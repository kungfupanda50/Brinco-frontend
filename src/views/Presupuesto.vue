<template>
  <div class="fixed inset-0 z-[1050] flex items-center justify-center p-4">
    <!-- Backdrop con desenfoque -->
    <div @click="$emit('cerrar')" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <!-- Contenedor Principal del Modal -->
    <div
      class="relative bg-[#f7f9fb] w-full max-w-6xl max-h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
    >
      <!-- Encabezado Estilo Brinco -->
      <header class="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="bg-cyan-50 text-[#06b6d4] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-cyan-100"
              >Módulo de Ventas</span
            >
          </div>
          <h2 class="text-3xl font-black text-slate-900">Generar Cotización</h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Configuración técnica de presupuesto personalizado
          </p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center"
        >
          <span class="material-icons">close</span>
        </button>
      </header>

      <!-- Cuerpo del Modal (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <!-- Estado de Carga -->
        <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
          <div
            class="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">
            Cargando plantillas y monedas...
          </p>
        </div>

        <div v-else class="space-y-8">
          <!-- NUEVO: SELECTOR DE HISTORIAL -->
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

              <!-- CHECKBOX ACTUALIZAR FECHA -->
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
                <label
                  for="actualizarFecha"
                  class="text-sm font-bold text-slate-600 cursor-pointer"
                >
                  Actualizar la fecha del documento a HOY antes de reimprimir
                </label>
              </div>
            </div>
          </section>

          <!-- SECCIÓN DE CREACIÓN (Se oculta si se elige reimprimir) -->
          <div v-if="!presupuestoSeleccionado" class="space-y-10">
            <!-- 1. Configuración Global -->
            <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                  >Plantilla de Diseño</label
                >
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
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                  >Moneda del Documento</label
                >
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
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2"
                  >Política de Anticipo</label
                >
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

            <!-- 2. Tabla Dinámica de Líneas -->
            <section>
              <div class="flex justify-between items-end mb-6 px-2">
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Detalle de Productos / Servicios
                </h3>
                <button
                  @click="agregarLinea"
                  class="text-[#06b6d4] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <span class="material-icons text-sm">add_circle</span> Añadir Ítem
                </button>
              </div>

              <div class="space-y-6">
                <div
                  v-for="(linea, index) in presupuesto.lineas"
                  :key="index"
                  class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group hover:border-[#06b6d4]/30 transition-all"
                >
                  <!-- Badge de Línea -->
                  <div
                    class="absolute -left-3 top-8 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg"
                  >
                    {{ index + 1 }}
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Descripción y IA -->
                    <div class="lg:col-span-6 space-y-4">
                      <div class="flex flex-col gap-2">
                        <label
                          class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                          >Descripción del Ítem</label
                        >
                        <textarea
                          v-model="linea.descripcion"
                          placeholder="¿Qué estamos cotizando?"
                          class="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium resize-none"
                        ></textarea>
                      </div>
                      <button
                        @click="generarIA(index)"
                        :disabled="iaCargando === index"
                        class="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-[#06b6d4] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#06b6d4] hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span
                          v-if="iaCargando === index"
                          class="w-4 h-4 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin"
                        ></span>
                        <span v-else class="material-icons text-sm">auto_awesome</span>
                        {{ iaCargando === index ? 'Pensando...' : 'Redactar con IA' }}
                      </button>
                    </div>

                    <!-- Campos Técnicos (Medidas si aplica) -->
                    <div class="lg:col-span-3 space-y-4">
                      <!-- NUEVOS CAMPOS: Color y Medidas -->
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] font-black text-slate-400 uppercase">Color</label>
                        <input
                          v-model="linea.color"
                          type="text"
                          class="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
                          placeholder="Ej: Blanco / Rojo"
                        />
                      </div>
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] font-black text-slate-400 uppercase"
                          >Medidas</label
                        >
                        <input
                          v-model="linea.medidas"
                          type="text"
                          class="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
                          placeholder="Ej: 10x15 cm"
                        />
                      </div>

                      <!-- Campo de Cantidad (el que ya tenías) -->
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] font-black text-slate-400 uppercase"
                          >Cantidad</label
                        >
                        <input
                          v-model.number="linea.cantidad"
                          @input="calcularLinea(linea)"
                          type="number"
                          class="w-full p-3 bg-slate-50 border-none rounded-xl text-lg font-black text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <!-- Precios y Acciones -->
                    <div class="lg:col-span-3 flex flex-col justify-between">
                      <div class="flex flex-col gap-1.5">
                        <label class="text-[9px] font-black text-slate-400 uppercase"
                          >Precio Unitario ({{ monedaSimbolo }})</label
                        >
                        <input
                          v-model.number="linea.precio_unitario"
                          @input="calcularLinea(linea)"
                          type="number"
                          class="w-full p-3 bg-cyan-50 border-none rounded-xl text-xl font-black text-[#06b6d4] outline-none"
                        />
                      </div>

                      <div
                        class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-end"
                      >
                        <div class="flex flex-col">
                          <span class="text-[9px] font-bold text-slate-300 uppercase"
                            >Subtotal Línea</span
                          >
                          <span class="text-xl font-black text-slate-900"
                            >{{ monedaSimbolo }} {{ linea.total_linea.toFixed(2) }}</span
                          >
                        </div>
                        <button
                          @click="eliminarLinea(index)"
                          class="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                        >
                          <span class="material-icons">delete_outline</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Imágenes de Referencia de la Línea -->
                  <div class="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-4 items-center">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest"
                      >Referencias Visuales:</span
                    >
                    <div
                      v-for="(img, i) in linea.imagenes"
                      :key="i"
                      class="relative w-16 h-16 rounded-xl overflow-hidden border-2 shadow-sm group/img transition-all"
                      :class="
                        img.grande
                          ? 'border-[#06b6d4] ring-2 ring-[#06b6d4]/30'
                          : 'border-slate-200'
                      "
                    >
                      <img :src="baseUrl + img.url" class="w-full h-full object-cover" />

                      <!-- Botón para alternar tamaño -->
                      <button
                        @click="img.grande = !img.grande"
                        class="absolute bottom-0 right-0 w-5 h-5 flex items-center justify-center transition-all"
                        :class="
                          img.grande
                            ? 'bg-[#06b6d4] text-white'
                            : 'bg-slate-800/50 text-white opacity-0 group-hover/img:opacity-100'
                        "
                        title="Mostrar grande en PDF"
                      >
                        <span class="material-icons" style="font-size: 12px">{{
                          img.grande ? 'fullscreen_exit' : 'open_in_full'
                        }}</span>
                      </button>

                      <!-- Botón de eliminar -->
                      <button
                        @click="linea.imagenes.splice(i, 1)"
                        class="absolute top-0 left-0 w-5 h-5 bg-red-500/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-br"
                      >
                        <span class="material-icons" style="font-size: 12px">close</span>
                      </button>
                    </div>

                    <label
                      v-if="linea.imagenes.length < 3"
                      class="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-[#06b6d4] hover:text-[#06b6d4] cursor-pointer transition-all"
                    >
                      <input
                        type="file"
                        @change="subirImagen($event, linea)"
                        class="hidden"
                        accept="image/*"
                      />
                      <span class="material-icons text-xl">add_a_photo</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <!-- 3. Imágenes Globales -->
            <section class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-icons text-slate-400">collections</span>
                <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest">
                  Galería de Referencias Adicionales
                </h3>
              </div>
              <div class="flex flex-wrap gap-4">
                <div
                  v-for="(img, i) in presupuesto.imagenes_sueltas"
                  :key="i"
                  class="relative w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-sm group transition-all"
                  :class="
                    img.grande ? 'border-[#06b6d4] ring-2 ring-[#06b6d4]/30' : 'border-slate-100'
                  "
                >
                  <img :src="baseUrl + img.url" class="w-full h-full object-cover" />

                  <!-- Botón para alternar tamaño -->
                  <button
                    @click="img.grande = !img.grande"
                    class="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center transition-all"
                    :class="
                      img.grande
                        ? 'bg-[#06b6d4] text-white'
                        : 'bg-slate-800/50 text-white opacity-0 group-hover:opacity-100'
                    "
                    title="Mostrar grande en PDF"
                  >
                    <span class="material-icons" style="font-size: 14px">{{
                      img.grande ? 'fullscreen_exit' : 'open_in_full'
                    }}</span>
                  </button>

                  <!-- Botón de eliminar -->
                  <button
                    @click="presupuesto.imagenes_sueltas.splice(i, 1)"
                    class="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="material-icons text-xs">close</span>
                  </button>
                </div>
                <label
                  class="w-24 h-24 rounded-2xl border-4 border-dashed border-slate-50 bg-slate-50 flex flex-col items-center justify-center text-slate-300 hover:bg-white hover:border-cyan-100 hover:text-[#06b6d4] cursor-pointer transition-all"
                >
                  <input
                    type="file"
                    @change="subirImagenSuelta($event)"
                    class="hidden"
                    accept="image/*"
                  />
                  <span class="material-icons text-2xl">add</span>
                  <span class="text-[8px] font-black uppercase mt-1">Cargar</span>
                </label>
              </div>
            </section>

            <!-- Texto Adicional -->
            <section class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div class="flex flex-col gap-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2"
                  >Texto Adicional para el PDF (Máx 120)</label
                >
                <textarea
                  v-model="presupuesto.texto_adicional"
                  maxlength="120"
                  rows="2"
                  class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#06b6d4]/10 transition-all text-sm font-medium resize-none"
                ></textarea>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Footer de Liquidación y Acciones -->
      <footer
        class="p-8 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between items-center gap-8"
      >
        <div class="flex gap-6 w-full md:w-auto">
          <div class="flex flex-col gap-1.5 flex-1 md:w-32">
            <label class="text-[9px] font-black text-slate-400 uppercase ml-2">Costo Envío</label>
            <input
              v-model.number="presupuesto.costo_envio"
              @input="calcularTotales"
              type="number"
              class="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
            />
          </div>
          <div class="flex flex-col gap-1.5 flex-1 md:w-32">
            <label class="text-[9px] font-black text-slate-400 uppercase ml-2">Descuento</label>
            <input
              v-model.number="presupuesto.descuento"
              @input="calcularTotales"
              type="number"
              class="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
          <div
            v-if="!presupuestoSeleccionado"
            class="bg-slate-900 px-8 py-4 rounded-3xl text-right min-w-[240px]"
          >
            <p class="text-[#06b6d4] text-[10px] font-black uppercase tracking-widest mb-1">
              Total Final Cotización
            </p>
            <p class="text-4xl font-black text-white">
              {{ monedaSimbolo }} {{ presupuesto.total.toFixed(2) }}
            </p>
          </div>

          <div class="flex gap-3 w-full md:w-auto">
            <button
              @click="$emit('cerrar')"
              class="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="guardarPresupuesto"
              :disabled="guardando"
              class="flex-[2] md:flex-none px-10 py-4 bg-[#06b6d4] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span
                v-if="guardando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <span v-else class="material-icons">{{
                presupuestoSeleccionado ? 'print' : 'picture_as_pdf'
              }}</span>
              {{
                presupuestoSeleccionado
                  ? guardando
                    ? 'REIMPRIMIENDO...'
                    : 'REIMPRIMIR PDF'
                  : guardando
                    ? 'GENERANDO...'
                    : 'GUARDAR Y GENERAR PDF'
              }}
            </button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/axios'

const baseUrl = 'http://localhost:3000'

const props = defineProps({
  clienteId: { type: Number, required: true },
  ordenId: { type: Number, default: null },
})
const emit = defineEmits(['cerrar'])

const cargando = ref(true)
const guardando = ref(false)
const plantillas = ref([])
const monedas = ref([])

// NUEVAS VARIABLES PARA HISTORIAL
const historialPresupuestos = ref([])
const presupuestoSeleccionado = ref(null)
const actualizarFecha = ref(false)

const presupuesto = reactive({
  plantilla_id: null,
  moneda_id: 1,
  nota_anticipo: 'Anticipo del 100% requerido',
  lineas: [],
  imagenes_sueltas: [],
  costo_envio: 0,
  descuento: 0,
  subtotal: 0,
  total: 0,
  texto_adicional: '',
})

const estructuraActual = computed(() => {
  const p = plantillas.value.find((p) => p.id === presupuesto.plantilla_id)
  return p?.tipo_estructura || 'simple'
})

const monedaSimbolo = computed(() => {
  const m = monedas.value.find((m) => m.id === presupuesto.moneda_id)
  return m ? m.simbolo : 'Q'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fetchHistorial = async () => {
  try {
    const { data } = await api.get(`/presupuestos/historial/${props.clienteId}`)
    historialPresupuestos.value = data
  } catch (err) {
    console.error('Error al cargar historial:', err)
  }
}

onMounted(async () => {
  try {
    const response = await api.get(`/presupuestos/data-inicial?orden_id=${props.ordenId || ''}`)
    const payload = response.data

    if (payload && payload.temas) {
      plantillas.value = payload.temas
      monedas.value = payload.monedas || []

      if (payload.envio_orden && payload.envio_orden > 0) {
        presupuesto.costo_envio = payload.envio_orden
      }
    } else {
      throw new Error('No se encontraron temas en la respuesta')
    }

    const def = plantillas.value.find((p) => p.is_default === 1)
    presupuesto.plantilla_id = def ? def.id : plantillas.value[0]?.id || null

    agregarLinea()
    calcularTotales()

    // CARGAR HISTORIAL AL INICIAR
    await fetchHistorial()
  } catch (err) {
    console.error('Error cargando datos iniciales:', err)
  } finally {
    cargando.value = false
  }
})

const agregarLinea = () => {
  presupuesto.lineas.push({
    descripcion: '',
    metadata: { ancho: 0, alto: 0 },
    color: '',
    medidas: '',
    cantidad: 1,
    precio_unitario: 0,
    total_linea: 0,
    imagenes: [],
  })
}

const eliminarLinea = (index) => {
  presupuesto.lineas.splice(index, 1)
  calcularTotales()
}

const calcularLinea = (linea) => {
  linea.total_linea = (parseFloat(linea.cantidad) || 0) * (parseFloat(linea.precio_unitario) || 0)
  calcularTotales()
}

const calcularTotales = () => {
  let sub = presupuesto.lineas.reduce((acc, l) => acc + (parseFloat(l.total_linea) || 0), 0)
  presupuesto.subtotal = sub
  presupuesto.total =
    sub + (parseFloat(presupuesto.costo_envio) || 0) - (parseFloat(presupuesto.descuento) || 0)
}

const subirImagen = async (event, linea) => {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('imagen', file)

  try {
    const { data } = await api.post('/presupuestos/upload-img', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    linea.imagenes.push({ url: data.url, grande: false })
  } catch (err) {
    alert('Error al subir imagen')
  }
}

const subirImagenSuelta = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('imagen', file)

  try {
    const { data } = await api.post('/presupuestos/upload-img', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    presupuesto.imagenes_sueltas.push({ url: data.url, grande: false })
  } catch (err) {
    alert('Error al subir imagen suelta')
  }
}

const iaCargando = ref(null)

const generarIA = async (index) => {
  iaCargando.value = index
  const palabra = presupuesto.lineas[index].descripcion || 'producto personalizado'
  try {
    const { data } = await api.post('/presupuestos/ia-descripcion', {
      palabraClave: palabra,
    })
    presupuesto.lineas[index].descripcion = data.descripcion
  } catch (err) {
    console.error('Error detallado de la IA:', err.response?.data || err.message)

    // Si el backend nos mandó un error específico, se lo mostramos al usuario en un alert
    if (err.response && err.response.data && err.response.data.error) {
      alert(
        `Aviso de la IA: ${err.response.data.error}\n\nSe ha colocado un texto de respaldo. Puedes editarlo manualmente.`,
      )
      // Ponemos el texto de respaldo que nos mandó el backend
      if (err.response.data.descripcion) {
        presupuesto.lineas[index].descripcion = err.response.data.descripcion
      }
    } else {
      alert('La IA tardó demasiado o no responde. Intenta de nuevo en unos segundos.')
    }
  } finally {
    iaCargando.value = null
  }
}

const guardarPresupuesto = async () => {
  // MODO REIMPRESIÓN
  if (presupuestoSeleccionado.value) {
    guardando.value = true
    try {
      // Si el checkbox está marcado, actualizamos la fecha en BD
      if (actualizarFecha.value) {
        await api.put(`/presupuestos/${presupuestoSeleccionado.value}/fecha`)
      }

      // Generar PDF
      const response = await api.get(`/presupuestos/${presupuestoSeleccionado.value}/pdf`, {
        responseType: 'blob',
      })
      const file = new Blob([response.data], { type: 'application/pdf' })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
      emit('cerrar')
    } catch (err) {
      alert('Error al reimprimir el PDF.')
      console.error(err)
    } finally {
      guardando.value = false
    }
    return
  }

  // MODO CREACIÓN NORMAL
  guardando.value = true
  calcularTotales()
  try {
    const { data } = await api.post('/presupuestos', {
      ...presupuesto,
      cliente_id: props.clienteId,
      orden_id: props.ordenId,
    })

    const response = await api.get(`/presupuestos/${data.id}/pdf`, {
      responseType: 'blob',
    })

    const file = new Blob([response.data], { type: 'application/pdf' })
    const fileURL = URL.createObjectURL(file)
    window.open(fileURL, '_blank')

    emit('cerrar')
  } catch (err) {
    alert('Error al guardar el presupuesto o generar el PDF.')
    console.error(err)
  } finally {
    guardando.value = false
  }
}
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

/* Animaciones de entrada */
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
</style>
