import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Acceso al Sistema', public: true },
  },

  {
    path: '/no-autorizado',
    name: 'NoAutorizado',
    component: () => import('../views/NoAutorizado.vue'),
    meta: { title: 'Acceso Restringido', public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: 'Panel de Control', permiso: 'p_dashboard' },
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('../views/Inventario.vue'),
    meta: { title: 'Inventario de Insumos', permiso: 'p_inventario' },
  },
  {
    path: '/ordenes',
    name: 'OrdenesTrabajo',
    component: () => import('../views/OrdenesTrabajo.vue'),
    meta: { title: 'Órdenes de Trabajo', permiso: 'p_ordenes' },
  },
  {
    path: '/nueva-orden',
    name: 'NuevaOrden',
    component: () => import('../views/NuevaOrden.vue'),
    meta: { title: 'Nueva Orden', permiso: 'p_nueva_orden' },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/Clientes.vue'),
    meta: { title: 'Gestión de Clientes', permiso: 'p_clientes' },
  },
  {
    path: '/clientes/:id/historial',
    name: 'HistorialCliente',
    component: () => import('../views/HistorialOrdenesCliente.vue'),
    meta: { title: 'Historial de Órdenes', permiso: 'p_clientes' },
  },
  {
    path: '/clientes/categorias',
    name: 'CategoriasClientes',
    component: () => import('../views/CategoriasClientes.vue'),
    meta: { title: 'Categorías de Clientes', permiso: 'p_cat_clientes' },
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('../views/Proveedores.vue'),
    meta: { title: 'Gestión de Proveedores', permiso: 'p_proveedores' },
  },
  {
    path: '/proveedores/:id/compras',
    name: 'HistorialComprasProveedor',
    component: () => import('../views/HistorialComprasProveedor.vue'),
    meta: { title: 'Historial de Compras', permiso: 'p_proveedores' },
  },
  {
    path: '/entrada-mercancia',
    name: 'EntradaMercancia',
    component: () => import('../views/EntradaMercancia.vue'),
    meta: { title: 'Entrada de Mercancía', permiso: 'p_entrada_mercancia' },
  },
  {
    path: '/caja',
    name: 'CajaPagos',
    component: () => import('../views/CajaPagos.vue'),
    meta: { title: 'Caja y Pagos', permiso: 'p_caja' },
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: () => import('../views/Categorias.vue'),
    meta: { title: 'Categorías de Productos', permiso: 'p_cat_productos' },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/Usuarios.vue'),
    meta: { title: 'Usuarios y Permisos', permiso: 'p_usuarios' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const baseTitle = 'Brinco Creativo'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle

  if (to.meta.public) return next()

  const token = localStorage.getItem('auth_token')
  if (!token) return next('/login')

  const permiso = to.meta.permiso
  if (permiso) {
    const user = JSON.parse(localStorage.getItem('user_brinco') || '{}')
    if (user[permiso] !== 1) {
      return next({ path: '/no-autorizado', query: { falta: permiso } })
    }
  }
  next()
})

export default router
