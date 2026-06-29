<template>
  <div v-if="modelValue" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div @click="$emit('update:modelValue', false)"
         class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <!-- PANEL: ancho controlado para respetar el sidebar -->
    <div class="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">

      <!-- HEADER -->
      <header class="px-7 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-xl font-black text-slate-900">Evidencias de Trabajo</h2>
          <p class="text-[10px] font-black text-[#06b6d4] uppercase tracking-widest mt-0.5">
            Orden #BC-{{ orden?.id }} · {{ orden?.cliente_nombre }}
          </p>
        </div>
        <button @click="$emit('update:modelValue', false)"
                class="material-icons text-slate-400 hover:text-slate-700 transition-colors">close</button>
      </header>

      <!-- CUERPO -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4 relative"
           @dragover.prevent="draggingOver = true"
           @dragleave.self="draggingOver = false"
           @drop.prevent="onDrop">

        <!-- OVERLAY DRAG & DROP -->
        <Transition name="fade">
          <div v-if="draggingOver"
               class="absolute inset-0 z-20 bg-cyan-500/10 border-4 border-dashed border-cyan-400
                      rounded-[2rem] flex items-center justify-center pointer-events-none">
            <div class="text-center">
              <span class="material-icons text-6xl text-cyan-400">cloud_upload</span>
              <p class="text-cyan-600 font-black text-xl mt-2">Suelta las fotos aquí</p>
            </div>
          </div>
        </Transition>

        <!-- CARGANDO -->
        <div v-if="cargando" class="flex items-center justify-center py-20">
          <div class="w-10 h-10 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else>

          <!-- TARJETA POR FOTO -->
          <div v-for="foto in fotos" :key="foto.id"
               class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group">

            <div class="flex gap-3 p-4">

              <!-- MINIATURA fija -->
              <div class="shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-slate-200 relative self-start">
                <!-- Video -->
                <video v-if="esVideo(foto.url_archivo)"
                       :src="baseUrl + foto.url_archivo"
                       class="w-full h-full object-cover"
                       muted playsinline preload="metadata" />
                <!-- Imagen -->
                <img v-else
                     :src="baseUrl + foto.url_archivo"
                     class="w-full h-full object-cover"
                     :alt="'Evidencia ' + foto.id" />
                <!-- Ícono de video encima -->
                <div v-if="esVideo(foto.url_archivo)"
                     class="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <span class="material-icons text-white text-3xl drop-shadow">play_circle</span>
                </div>
                <button @click="eliminarFoto(foto.id)"
                        title="Eliminar foto"
                        class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full
                               w-6 h-6 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-all shadow">
                  <span class="material-icons text-xs">close</span>
                </button>
              </div>

              <!-- ZONA DE TAGS con scroll horizontal -->
              <div class="flex-1 min-w-0 overflow-x-auto pb-2">
                <div class="flex gap-4 min-w-max">

                  <div v-for="cat in categoriasTags" :key="cat.id"
                       class="flex flex-col gap-0.5 min-w-[110px] max-w-[130px] max-h-52 overflow-y-auto pr-1">

                    <!-- Encabezado categoría -->
                    <div class="flex items-center gap-1 mb-1 pb-1 border-b border-slate-200">
                      <span class="material-icons text-[12px]" :class="colorTexto(cat.color_clase)">{{ cat.icono }}</span>
                      <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">{{ cat.nombre }}</span>
                    </div>

                    <!-- Tags -->
                    <label v-for="tag in cat.tags" :key="tag.id"
                           class="flex items-start gap-1.5 cursor-pointer py-[2px] px-1 -mx-1 rounded
                                  hover:bg-white transition-colors">
                      <input type="checkbox"
                             :checked="fotoTieneTag(foto, tag.id)"
                             @change="toggleTag(foto, tag.id)"
                             class="peer appearance-none w-3 h-3 mt-[2px] border-2 border-slate-300 rounded
                                    checked:border-[#06b6d4] checked:bg-[#06b6d4]
                                    transition-all shrink-0 cursor-pointer" />
                      <span class="text-[11px] leading-tight text-slate-500
                                   peer-checked:text-[#0891b2] peer-checked:font-semibold
                                   transition-colors select-none">
                        {{ tag.nombre }}
                      </span>
                    </label>

                  </div>
                </div>
              </div>
            </div>

            <!-- BARRA RESUMEN de tags seleccionados -->
            <div class="px-4 py-2 bg-white border-t border-slate-100 min-h-[32px] flex flex-wrap gap-1.5 items-center">
              <template v-if="foto.tags?.length">
                <span v-for="tag in foto.tags" :key="tag.tag_id"
                      class="inline-flex items-center text-[10px] font-semibold
                             bg-cyan-50 text-cyan-700 border border-cyan-200
                             rounded-full px-2 py-0.5">
                  {{ nombreTag(tag.tag_id) }}
                </span>
              </template>
              <span v-else class="text-[10px] text-slate-300 italic">Sin tags asignados</span>
            </div>

          </div>

          <!-- ESTADO VACÍO -->
          <div v-if="fotos.length === 0"
               class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <span class="material-icons text-5xl block mb-2">photo_library</span>
            <p class="text-sm font-medium">No hay evidencias aún.</p>
            <p class="text-xs mt-1">Usa el botón o <strong>arrastra fotos aquí</strong>.</p>
          </div>

        </template>
      </div>

      <!-- FOOTER -->
      <footer class="px-7 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer bg-slate-900 text-white
                      px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest
                      hover:bg-slate-700 transition-colors">
          <span class="material-icons text-sm">add_a_photo</span>
          Subir foto
          <input type="file" accept="image/*,video/*" multiple class="hidden" @change="subirDesdeInput" />
        </label>
        <span v-if="subiendo" class="flex items-center gap-2 text-xs text-slate-400">
          <span class="w-4 h-4 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin inline-block"></span>
          Subiendo...
        </span>
        <span class="text-xs text-slate-400 ml-auto">
          {{ fotos.length }} foto{{ fotos.length !== 1 ? 's' : '' }} · Tags guardados automáticamente
        </span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '../api/axios'

const props = defineProps({ modelValue: Boolean, orden: Object })
const emit  = defineEmits(['update:modelValue', 'actualizado'])

const fotos          = ref([])
const categoriasTags = ref([])
const cargando       = ref(false)
const subiendo       = ref(false)
const draggingOver   = ref(false)
const baseUrl        = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const mapaTagsPlano = computed(() => {
  const m = {}
  categoriasTags.value.forEach(cat => cat.tags.forEach(t => { m[t.id] = t.nombre }))
  return m
})
const nombreTag = (tagId) => mapaTagsPlano.value[tagId] || ''

watch(() => props.modelValue, async (abierto) => {
  if (abierto && props.orden) {
    cargando.value = true
    await Promise.all([cargarFotos(), cargarTags()])
    cargando.value = false
  }
})

const cargarFotos = async () => {
  const res = await api.get(`/ordenes/${props.orden.id}/evidencias`)
  fotos.value = res.data
}

const cargarTags = async () => {
  if (categoriasTags.value.length > 0) return
  const res = await api.get('/catalogo/tags')
  categoriasTags.value = res.data
}

const subirArchivos = async (archivos) => {
  if (!archivos.length) return
  subiendo.value = true
  try {
    const formData = new FormData()
    archivos.forEach(f => formData.append('fotos', f))
    const res = await api.post(`/ordenes/${props.orden.id}/evidencias`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    fotos.value.push(...res.data.fotos)
    emit('actualizado')
  } catch { alert('Error al subir fotos') }
  finally { subiendo.value = false }
}

const subirDesdeInput = (e) => { subirArchivos(Array.from(e.target.files)); e.target.value = '' }

const onDrop = (e) => {
  draggingOver.value = false
  const archivos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
  if (archivos.length) subirArchivos(archivos)
}

const eliminarFoto = async (fotoId) => {
  if (!confirm('¿Eliminar esta foto?')) return
  try {
    await api.delete(`/evidencias/${fotoId}`)
    fotos.value = fotos.value.filter(f => f.id !== fotoId)
    emit('actualizado')
  } catch { alert('Error al eliminar') }
}

const fotoTieneTag = (foto, tagId) => foto.tags?.some(t => t.tag_id === tagId)

const toggleTag = async (foto, tagId) => {
  const yaLoTiene = fotoTieneTag(foto, tagId)
  foto.tags = yaLoTiene
    ? foto.tags.filter(t => t.tag_id !== tagId)
    : [...(foto.tags || []), { tag_id: tagId }]
  try {
    await api.put(`/evidencias/${foto.id}/tags`, { tag_ids: foto.tags.map(t => t.tag_id) })
  } catch {
    foto.tags = yaLoTiene
      ? [...(foto.tags || []), { tag_id: tagId }]
      : foto.tags.filter(t => t.tag_id !== tagId)
    alert('Error al guardar tag')
  }
}

const esVideo = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url)

const colorTexto = (c) => c?.split(' ').find(x => x.startsWith('text-')) || 'text-slate-500'
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Scrollbar delgado y sutil para la zona de tags */
.overflow-x-auto::-webkit-scrollbar { height: 4px; }
.overflow-x-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 2px; }
.overflow-x-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.overflow-x-auto::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

/* Scrollbar vertical en columnas de tags */
.overflow-y-auto::-webkit-scrollbar { width: 3px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
</style>
