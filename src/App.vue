<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from './api/axios'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)
const user = ref({})

const cargarUsuario = () => {
  try {
    user.value = JSON.parse(localStorage.getItem('user_brinco') || '{}')
  } catch {
    user.value = {}
  }
}

const cargarUsuarioDesdeToken = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  try {
    const response = await api.get('/me')
    localStorage.setItem('user_brinco', JSON.stringify(response.data))
    user.value = response.data
  } catch {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_brinco')
    router.push('/login')
  }
}

onMounted(() => {
  cargarUsuario()
  cargarUsuarioDesdeToken()
})

watch(
  () => route.fullPath,
  () => cargarUsuario(),
)

const allMenuItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', permiso: 'p_dashboard' },
  { name: 'Clientes', path: '/clientes', icon: 'people', permiso: 'p_clientes' },
  { name: 'Cotizaciones', path: '/cotizaciones', icon: 'request_quote', permiso: 'p_nueva_orden' },
  { name: 'Órdenes', path: '/ordenes', icon: 'assignment', permiso: 'p_ordenes' },
  { name: 'Nueva Orden', path: '/nueva-orden', icon: 'add_box', permiso: 'p_nueva_orden' },
  { name: 'Inventario', path: '/inventario', icon: 'inventory_2', permiso: 'p_inventario' },
  { name: 'Proveedores', path: '/proveedores', icon: 'local_shipping', permiso: 'p_proveedores' },
  {
    name: 'Entrada Mercancía',
    path: '/entrada-mercancia',
    icon: 'input',
    permiso: 'p_entrada_mercancia',
  },
  { name: 'Caja y Pagos', path: '/caja', icon: 'attach_money', permiso: 'p_caja' },
  {
    name: 'Categorías Clientes',
    path: '/clientes/categorias',
    icon: 'groups',
    permiso: 'p_cat_clientes',
  },
  {
    name: 'Categorías Productos',
    path: '/categorias',
    icon: 'category',
    permiso: 'p_cat_productos',
  },
  { name: 'Usuarios', path: '/usuarios', icon: 'admin_panel_settings', permiso: 'p_usuarios' },
]

const menuItems = computed(() => {
  const permisos = user.value || {}
  return allMenuItems.filter((item) => permisos[item.permiso] === 1)
})

const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'))
const showSidebar = computed(() => route.name !== 'Login')

const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_brinco')
  router.push('/login')
}
</script>

<template>
  <div class="layout-wrapper">
    <!-- BARRA LATERAL: Solo se muestra si no estamos en Login -->
    <aside
      v-if="showSidebar"
      :class="['sidebar', sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed']"
      style="z-index: 999; position: relative"
    >
      <div class="logo-container">
        <div class="logo-wrapper">
          <img src="/src/assets/logo.png" alt="Brinco Creativo" class="brand-logo-img" />
        </div>
      </div>

      <nav class="nav-menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'nav-link-active': route.path === item.path }"
          @click="logNavigation(item)"
        >
          <span class="material-icons">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="nav-label">{{ item.name }}</span>
          <div v-if="sidebarOpen && route.path === item.path" class="active-dot"></div>
        </RouterLink>
      </nav>

      <!-- Botón de Salida -->
      <div class="logout-section p-4">
        <button @click="logout" class="logout-btn group">
          <span class="material-icons">logout</span>
          <span v-if="sidebarOpen" class="nav-label">Cerrar Sesión</span>
        </button>
      </div>

      <button @click="sidebarOpen = !sidebarOpen" class="toggle-btn">
        <span class="material-icons">{{ sidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
      </button>
    </aside>

    <!-- ÁREA DE CONTENIDO PRINCIPAL -->
    <main class="main-content" :class="{ 'no-sidebar': !showSidebar }">
      <div class="content-scroll-area">
        <div class="content-container" :class="{ 'aire-lateral': showSidebar }">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f7f9fb;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
}

.sidebar-expanded {
  width: 256px;
}
.sidebar-collapsed {
  width: 80px;
}

.logo-container {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.brand-logo-img {
  max-width: 180px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.sidebar-collapsed .brand-logo-img {
  max-width: 40px;
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.2s;
  color: #94a3b8;
  text-decoration: none;
  margin-bottom: 4px;
}

.nav-link:hover {
  background-color: #f8fafc;
  color: #475569;
}

.nav-link-active {
  background-color: #ecfeff;
  color: #06b6d4;
}

.nav-label {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.active-dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  background-color: #06b6d4;
  border-radius: 50%;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #ef4444;
  border-color: #fee2e2;
}

.toggle-btn {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.main-content.no-sidebar {
  padding: 0 !important;
}

.content-scroll-area {
  flex: 1;
  overflow-y: auto;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
}

/* Aire Lateral Maestro (16px) */
.aire-lateral {
  padding: 40px 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar minimalista */
.nav-menu::-webkit-scrollbar {
  width: 4px;
}
.nav-menu::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
</style>
