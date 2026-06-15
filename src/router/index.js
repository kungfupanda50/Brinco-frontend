import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Acceso al Sistema', public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Panel de Control' },
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/Inventario.vue'),
    meta: { title: 'Inventario de Insumos' },
  },
  {
    path: '/ordenes',
    name: 'OrdenesTrabajo',
    component: () => import('../views/OrdenesTrabajo.vue'),
    meta: { title: 'Órdenes de Trabajo' },
  },
  {
    path: '/nueva-orden',
    name: 'NuevaOrden',
    component: () => import('../views/NuevaOrden.vue'),
    meta: { title: 'Nueva Orden' },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/Clientes.vue'),
    meta: { title: 'Gestión de Clientes' },
  },
  {
    path: '/clientes/:id/historial',
    name: 'HistorialCliente',
    component: () => import('../views/HistorialOrdenesCliente.vue'),
    meta: { title: 'Historial de Órdenes' },
  },
  {
    path: '/clientes/categorias',
    name: 'CategoriasClientes',
    component: () => import('../views/CategoriasClientes.vue'),
    meta: { title: 'Categorías de Clientes' },
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('../views/Proveedores.vue'),
    meta: { title: 'Gestión de Proveedores' },
  },
  {
    path: '/proveedores/:id/compras',
    name: 'HistorialComprasProveedor',
    component: () => import('../views/HistorialComprasProveedor.vue'),
    meta: { title: 'Historial de Compras' },
  },
  {
    path: '/entrada-mercancia',
    name: 'EntradaMercancia',
    component: () => import('../views/EntradaMercancia.vue'),
    meta: { title: 'Entrada de Mercancía' },
  },
  {
    path: '/caja',
    name: 'CajaPagos',
    component: () => import('../views/CajaPagos.vue'),
    meta: { title: 'Caja y Pagos' },
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: () => import('../views/Categorias.vue'),
    meta: { title: 'Categorías de Productos' },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/Usuarios.vue'),
    meta: { title: 'Usuarios y Permisos' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// === SISTEMA DE PROTECCIÓN DE RUTAS (NUEVO) ===
router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('auth_brinco') === 'true'

  // Establecer título dinámico
  const baseTitle = 'Brinco Creativo'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle

  // Lógica de acceso
  if (!to.meta.public && !isAuth) {
    console.warn(`[ROUTER] Acceso denegado a "${to.path}". Redirigiendo a Login.`)
    next('/login')
  } else if (to.name === 'Login' && isAuth) {
    next('/')
  } else {
    next()
  }
})

router.afterEach((to) => {
  console.log(`[ROUTER] Navegación exitosa: ${to.path}`)
})

export default router
