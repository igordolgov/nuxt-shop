<!-- app\app.vue -->
<template lang="pug">
NuxtLayout
  NuxtPage
</template>

<style>
/* Глобальные стили для подсветки */
.badge-highlight {
  position: relative;
  overflow: hidden;
}

.badge-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffeb3b;
  z-index: -1;
  border-radius: 0.25rem;
}

.badge-highlight .search-highlight {
  background-color: #ff5722 !important;
  color: white !important;
  border-radius: 2px;
  margin: 0 -1px;
}
</style>

<script setup>
</script>