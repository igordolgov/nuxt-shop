<!-- components/ScrollToTop.vue -->
<template lang="pug">
button.scroll-to-top-btn(
  v-show="visible", 
  @click="scrollToTop",
  :class="{ 'visible': visible }",
  aria-label="Прокрутить к началу"
)
  .btn-icon.animate-bounce
    svg(
      viewBox="0 0 24 24",
      width="48",
      height="48"
    )
      path(
        fill="currentColor",
        d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
      )
</template>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border-radius: 50%;
  cursor: pointer;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateY(100px) scale(0.8);
}

.scroll-to-top-btn.visible {
  animation: slideUpFadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.scroll-to-top-btn:hover {
  transform: translateY(0) scale(1.1);
}

.scroll-to-top-btn:active {
  transform: translateY(0) scale(0.95);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.scroll-to-top-btn:hover .btn-icon {
  transform: translateY(-3px);
}

.scroll-to-top-btn:active .btn-icon {
  transform: translateY(0);
}

@keyframes slideUpFadeIn {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 92px;
    right: 20px;
  }
  
  .btn-icon {
    opacity: 60%;
  }
  
  .scroll-to-top-btn:hover {
    transform: translateY(0) scale(1.05);
  }
  
  .scroll-to-top-btn:hover .btn-icon {
    transform: translateY(-2px);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .scroll-to-top-btn {
    bottom: 32px;
  }
}

@media (min-width: 1440px) {
  .scroll-to-top-btn {
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-to-top-btn {
    transition: opacity 0.3s ease !important;
    animation: none !important;
  }
  
  .btn-icon {
    transition: none !important;
  }
}

.scroll-to-top-btn:focus {
  outline: none;
}

.scroll-to-top-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 3px;
}
</style>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  // Добавляем опциональный target для прокрутки
  target: {
    type: String,
    default: 'window' // или 'container'
  }
})

const visible = ref(false)

// Функция для поиска контейнера товаров
const findProductsContainer = () => {
  return document.querySelector('.products-container')
}

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ПРОКРУТКИ К ВЕРХУ
const scrollToTop = () => {
  console.log('🔄 SCROLL TO TOP, target:', props.target)
  
  if (props.target === 'container') {
    // Прокручиваем контейнер товаров
    const container = findProductsContainer()
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return
    }
  }
  
  // По умолчанию прокручиваем window
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  
  // Дополнительно пробуем прокрутить контейнер товаров, если он есть
  const container = findProductsContainer()
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

watch(() => props.visible, (newVal) => {
  console.log('📢 ScrollTop visibility changed:', newVal)
  visible.value = newVal
})
</script>