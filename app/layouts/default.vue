<!-- app\layouts\default.vue -->
<template lang="pug">
.h-screen.flex.flex-col
  //- Header
  main.flex-1
    slot
  ClientOnly
    ScrollToTop
</template>

<script setup>
import Header from '~/components/layout/Header.vue';
</script>

<style>
.default-layout {
  min-height: 100dvh;
  overflow: hidden;
}

/* Убираем возможные лишние отступы */
body {
  margin: 0;
  padding: 0;
}

/* Глобальные стили для подсветки */
.global-highlight-enabled .search-highlight,
.global-highlight-enabled .badge-highlight {
  background: linear-gradient(120deg, var(--wa) / 0.3, var(--wa) / 0.3);
  border-radius: 2px;
  color: var(--wa);
}

/* Если используете oklch */
.global-highlight-enabled .search-highlight,
.global-highlight-enabled .badge-highlight {
  background: linear-gradient(120deg, oklch(var(--wa) / 0.3), oklch(var(--wa) / 0.3));
  border-radius: 2px;
  color: oklch(var(--wa) / 1);
}

.global-highlight-enabled .highlight-border {
  box-shadow: 0 0 0 2px oklch(var(--p) / 0.2) !important;
}
</style>