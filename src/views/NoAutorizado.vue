<template>
  <div class="no-autorizado-container">
    <div class="card">
      <!-- Ícono visual -->
      <div class="icon-wrapper">
        <span class="material-icons icono">gpp_bad</span>
      </div>

      <!-- Mensaje principal -->
      <h1 class="titulo">Acceso Restringido</h1>
      <p class="descripcion">
        No tienes los permisos necesarios para acceder a esta sección.
      </p>

      <!-- Sugerencia -->
      <div class="sugerencia">
        <span class="material-icons text-cyan-400">lightbulb</span>
        <p>Contacta al administrador si crees que deberías tener acceso.</p>
      </div>

      <!-- Botón para volver al Dashboard -->
      <router-link to="/" class="btn-volver">
        <span class="material-icons">arrow_back</span>
        Volver al Panel de Control
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No necesita lógica adicional
</script>

<style scoped>
.no-autorizado-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 2rem;
  padding: 3rem 2.5rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.icon-wrapper {
  background: #fef2f2;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.icono {
  font-size: 40px;
  color: #ef4444;
}

.titulo {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.descripcion {
  color: #64748b;
  font-weight: 500;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.sugerencia {
  background: #ecfeff;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: left;
}

.sugerencia p {
  font-size: 0.875rem;
  color: #0891b2;
  font-weight: 500;
  margin: 0;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #06b6d4;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.btn-volver:hover {
  background: #0891b2;
  transform: scale(1.02);
}
</style>