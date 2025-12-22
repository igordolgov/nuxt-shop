// composables/useMobileDetection.js
import { ref, onMounted, onUnmounted, readonly } from 'vue'

export const useMobileDetection = () => {
  const isMobile = ref(false)
  
  const checkMobile = () => {
    if (process.client) {
      isMobile.value = window.innerWidth < 1024
    }
  }
  
  const getMobileBreakpoint = () => {
    return 1024 // lg breakpoint
  }
  
  // Инициализация
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  
  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', checkMobile)
    }
  })
  
  return {
    isMobile: readonly(isMobile),
    checkMobile,
    getMobileBreakpoint
  }
}