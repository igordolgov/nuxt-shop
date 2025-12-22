<!-- app\layouts\custom.vue -->
<template lang="pug">
.min-h-screen.flex
  Header
  //- Основной контент - ПРОКРУЧИВАЕМЫЙ
  .flex-1.min-w-0.pt-14
    slot
</template>