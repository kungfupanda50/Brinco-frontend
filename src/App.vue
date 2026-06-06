<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

// Lista de rutas actualizada con Categorización Dual
const menuItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Clientes', path: '/clientes', icon: 'people' },

  { name: 'Órdenes', path: '/ordenes', icon: 'assignment' },
  { name: 'Nueva Orden', path: '/nueva-orden', icon: 'add_box' },
  { name: 'Inventario', path: '/inventario', icon: 'inventory_2' },
  { name: 'Proveedores', path: '/proveedores', icon: 'local_shipping' },
  { name: 'Entrada Mercancía', path: '/entrada-mercancia', icon: 'input' },
  { name: 'Caja y Pagos', path: '/caja', icon: 'attach_money' },
  { name: 'Categorías de Clientes', path: '/clientes/categorias', icon: 'groups' },
  { name: 'Categorías de Productos', path: '/categorias', icon: 'category' },
  { name: 'Usuarios', path: '/usuarios', icon: 'admin_panel_settings' },
]
</script>

<template>
  <div class="layout-wrapper">
    <!-- BARRA LATERAL (SIDEBAR) -->
    <aside :class="['sidebar', sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed']">
      <!-- Logo y Marca -->
      <div class="logo-container">
        <div class="logo-icon">
          <span class="material-icons">rocket_launch</span>
        </div>
        <div v-if="sidebarOpen" class="brand-text">
          <h1 class="brand-name">Brinco</h1>
          <p class="brand-sub">Creativo</p>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <nav class="nav-menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'nav-link-active': route.path === item.path }"
        >
          <span class="material-icons">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="nav-label">{{ item.name }}</span>
          <div v-if="sidebarOpen && route.path === item.path" class="active-dot"></div>
        </RouterLink>
      </nav>

      <!-- Botón Acción Principal -->
      <div class="cta-container">
        <RouterLink to="/nueva-orden" class="cta-button">
          <span class="material-icons">add_circle</span>
          <span v-if="sidebarOpen">NUEVA ORDEN</span>
        </RouterLink>
      </div>

      <!-- Toggle sidebar -->
      <button @click="sidebarOpen = !sidebarOpen" class="toggle-btn">
        <span class="material-icons">{{ sidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
      </button>
    </aside>

    <!-- ÁREA DE CONTENIDO (MAIN) -->
    <main class="flex-1 overflow-y-auto bg-[#f7f9fb] w-full">
      <!-- 
        CAPA DE AIRE ESTANDARIZADA:
        Usamos la clase .aire-lateral definida en style.css para un control centralizado
        manteniendo el margen de 1rem (16px) que acordamos.
      -->
      <div class="aire-lateral">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Estructura Base */
.layout-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f7f9fb;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

/* Sidebar Estilos */
.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 50;
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
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background-color: #06b6d4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2);
}

.brand-text {
  overflow: hidden;
}
.brand-name {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  margin: 0;
}
.brand-sub {
  font-size: 10px;
  font-weight: 700;
  color: #06b6d4;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
  scrollbar-width: thin;
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

.cta-container {
  padding: 16px;
  flex-shrink: 0;
}
.cta-button {
  width: 100%;
  background-color: #06b6d4;
  color: #ffffff;
  padding: 12px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2);
  transition: transform 0.2s;
}
.cta-button:active {
  transform: scale(0.95);
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
.toggle-btn:hover {
  color: #64748b;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar Custom */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
