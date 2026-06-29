<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <!-- Header del Modal -->
      <div class="modal-header">
        <h2>Generar Cotización</h2>
        <button @click="$emit('cerrar')" class="btn-close">×</button>
      </div>

      <!-- Body del Modal -->
      <div class="modal-body" v-if="cargando">
        <p>Cargando datos...</p>
      </div>

      <div class="modal-body" v-else>
        <div class="row">
          <div class="col-md-4">
            <label>Plantilla (Estructura y Diseño)</label>
            <select v-model="presupuesto.plantilla_id" class="form-control">
              <option v-for="p in plantillas" :key="p.id" :value="p.id">
                {{ p.nombre }} ({{ p.tipo_estructura }})
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label>Moneda</label>
            <select v-model="presupuesto.moneda_id" class="form-control">
              <option v-for="m in monedas" :key="m.id" :value="m.id">
                {{ m.nombre }} (Tasa: {{ m.tasa_cambio }})
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label>Política de Anticipo</label>
            <input type="text" v-model="presupuesto.nota_anticipo" class="form-control" />
          </div>
        </div>

        <hr />

        <!-- Tabla Dinámica de Líneas -->
        <h5>Detalles del Presupuesto</h5>
        <div v-for="(linea, index) in presupuesto.lineas" :key="index" class="linea-container">
          <div class="linea-header">
            <span>Línea {{ index + 1 }}</span>
            <button @click="eliminarLinea(index)" class="btn-danger-sm">Eliminar</button>
          </div>

          <div class="linea-row">
            <div class="col-desc">
              <textarea
                v-model="linea.descripcion"
                placeholder="Descripción del item"
                class="form-control"
              ></textarea>
              <button @click="generarIA(index)" class="btn-ia">✨ Redactar con IA</button>
            </div>

            <!-- Campos dinámicos según estructura -->
            <div class="col-params" v-if="estructuraActual === 'medidas'">
              <input
                type="number"
                v-model="linea.metadata.ancho"
                placeholder="Ancho"
                class="form-control-sm"
              />
              <input
                type="number"
                v-model="linea.metadata.alto"
                placeholder="Alto"
                class="form-control-sm"
              />
            </div>

            <div class="col-params">
              <input
                type="number"
                v-model="linea.cantidad"
                placeholder="Cant."
                class="form-control-sm"
                @input="calcularLinea(linea)"
              />
              <input
                type="number"
                v-model="linea.precio_unitario"
                placeholder="Precio Unit."
                class="form-control-sm"
                @input="calcularLinea(linea)"
              />
              <div class="total-linea">
                Total: {{ monedaSimbolo }} {{ linea.total_linea.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Imágenes de la línea -->
          <div class="img-linea-container">
            <div v-for="(img, i) in linea.imagenes" :key="i" class="img-thumbnail">
              <img :src="baseUrl + img" alt="ref" />
              <button @click="linea.imagenes.splice(i, 1)">×</button>
            </div>
            <input
              type="file"
              @change="subirImagen($event, linea)"
              accept="image/*"
              :disabled="linea.imagenes.length >= 3"
            />
            <small v-if="linea.imagenes.length >= 3">Máx 3 alcanzado</small>
          </div>
        </div>

        <button @click="agregarLinea" class="btn-add-line">+ Agregar Línea</button>

        <hr />

        <!-- Imágenes Sueltas -->
        <h5>Imágenes Adicionales (Sueltas)</h5>
        <div class="img-linea-container">
          <div v-for="(img, i) in presupuesto.imagenes_sueltas" :key="i" class="img-thumbnail">
            <img :src="baseUrl + img" alt="ref" />
            <button @click="presupuesto.imagenes_sueltas.splice(i, 1)">×</button>
          </div>
          <input type="file" @change="subirImagenSuelta($event)" accept="image/*" />
        </div>

        <hr />

        <!-- Totales -->
        <div class="totales">
          <div>
            <label>Costo de Envío</label>
            <input type="number" v-model="presupuesto.costo_envio" @input="calcularTotales" />
          </div>
          <div>
            <label>Descuento</label>
            <input type="number" v-model="presupuesto.descuento" @input="calcularTotales" />
          </div>
          <h3>Total Final: {{ monedaSimbolo }} {{ presupuesto.total.toFixed(2) }}</h3>
        </div>
      </div>

      <!-- Footer del Modal -->
      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn-secondary">Cancelar</button>
        <button @click="guardarPresupuesto" class="btn-primary" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar y Generar PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/axios' // <--- USAMOS TU INSTANCIA PERSONALIZADA
const baseUrl = 'http://localhost:3000'

const props = defineProps({
  clienteId: { type: Number, required: true },
  ordenId: { type: Number, default: null },
})
const emit = defineEmits(['cerrar'])

// Ya no necesitamos apiUrl porque tu instancia 'api' ya sabe a dónde ir
const cargando = ref(true)
const guardando = ref(false)
const plantillas = ref([])
const monedas = ref([])

const presupuesto = reactive({
  plantilla_id: null,
  moneda_id: 1,
  nota_anticipo: 'Anticipo del 50% requerido',
  lineas: [],
  imagenes_sueltas: [],
  costo_envio: 0,
  descuento: 0,
  subtotal: 0,
  total: 0,
})

const estructuraActual = computed(() => {
  const p = plantillas.value.find((p) => p.id === presupuesto.plantilla_id)
  // Si no existe tipo_estructura, devolvemos 'simple' por defecto
  return p?.tipo_estructura || 'simple'
})

const monedaSimbolo = computed(() => {
  const m = monedas.value.find((m) => m.id === presupuesto.moneda_id)
  return m ? m.simbolo : 'Q'
})

onMounted(async () => {
  try {
    const response = await api.get('/presupuestos/data-inicial')
    const payload = response.data

    // Cambiamos 'plantillas' por 'temas'
    if (payload && payload.temas) {
      plantillas.value = payload.temas
      monedas.value = payload.monedas || []
    } else {
      throw new Error('No se encontraron temas en la respuesta')
    }

    const def = plantillas.value.find((p) => p.is_default === 1)
    presupuesto.plantilla_id = def ? def.id : plantillas.value[0].id

    agregarLinea()
  } catch (err) {
    console.error('Error detallado:', err)
    alert('Error al cargar datos iniciales.')
  } finally {
    cargando.value = false
  }
})

const agregarLinea = () => {
  presupuesto.lineas.push({
    descripcion: '',
    metadata: {},
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
  let sub = presupuesto.lineas.reduce((acc, l) => acc + l.total_linea, 0)
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
    linea.imagenes.push(data.url)
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
    presupuesto.imagenes_sueltas.push(data.url)
  } catch (err) {
    alert('Error al subir imagen suelta')
  }
}

const generarIA = async (index) => {
  const palabra = presupuesto.lineas[index].descripcion || 'producto personalizado'
  try {
    const { data } = await api.post('/presupuestos/ia-descripcion', {
      palabraClave: palabra,
    })
    presupuesto.lineas[index].descripcion = data.descripcion
  } catch (err) {
    alert('La IA no está disponible en este momento.')
  }
}

const guardarPresupuesto = async () => {
  guardando.value = true
  calcularTotales()
  try {
    // 1. Guardamos el presupuesto en la base de datos
    const { data } = await api.post('/presupuestos', {
      ...presupuesto,
      cliente_id: props.clienteId,
      orden_id: props.ordenId,
    })

    // 2. Obtenemos el PDF desde el backend
    const response = await api.get(`/presupuestos/${data.id}/pdf`, {
      responseType: 'blob',
    })

    // 3. Le decimos explícitamente al navegador que es un PDF
    const file = new Blob([response.data], { type: 'application/pdf' })

    // 4. Creamos una URL temporal y la abrimos en una pestaña nueva
    const fileURL = URL.createObjectURL(file)
    window.open(fileURL, '_blank')

    // 5. Cerramos el modal
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-container {
  background: white;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.modal-header,
.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.modal-footer {
  border-top: 1px solid #eee;
  border-bottom: none;
}
.modal-body {
  padding: 20px;
  flex-grow: 1;
}
.linea-container {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
}
.linea-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
}
.linea-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.col-desc {
  flex: 2;
}
.col-params {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.img-linea-container {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}
.img-thumbnail {
  position: relative;
  width: 60px;
  height: 60px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}
.img-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-thumbnail button {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 10px;
}
.totales {
  text-align: right;
  margin-top: 20px;
}
.totales input {
  width: 150px;
  margin-left: 10px;
}
.btn-ia {
  font-size: 12px;
  color: blue;
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 5px;
}
.btn-add-line {
  margin: 15px 0;
  padding: 10px;
  background: #f0f0f0;
  border: 1px dashed #ccc;
  width: 100%;
  cursor: pointer;
}
.btn-primary {
  background: #1a3a5c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background: #ccc;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-danger-sm {
  color: red;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
}
.form-control,
.form-control-sm {
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-control-sm {
  padding: 5px;
}
</style>
