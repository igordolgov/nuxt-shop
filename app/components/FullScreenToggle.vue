<template>
  <button
    v-if="isFullscreenSupported"
    @click="toggleFullscreen"
    class="btn btn-ghost btn-circle ml-2 text-base-200 bg-secondary hover:bg-neutral-400 w-8 h-8 lg:w-10 lg:h-10 transition-transform duration-200 hover:scale-110"
    :class="{
      'btn-primary': isFullscreen,
      'btn-secondary': !isFullscreen
    }"
    :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'"
    aria-label="Переключить полноэкранный режим"
  >
    <svg v-if="!isFullscreen" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
    </svg>
    <svg v-else class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isFullscreen = ref(false)
const isFullscreenSupported = ref(false)

// Проверка поддержки полноэкранного режима
const checkFullscreenSupport = () => {
  isFullscreenSupported.value = !!(
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  )
}

// Проверка текущего состояния
const checkFullscreenStatus = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

// Переключение полноэкранного режима
const toggleFullscreen = () => {
  if (!isFullscreenSupported.value) return

  if (!isFullscreen.value) {
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

// Обработчики событий
const handleFullscreenChange = () => {
  checkFullscreenStatus()
}

// Инициализация
onMounted(() => {
  if (process.client) {
    checkFullscreenSupport()
    checkFullscreenStatus()

    // События полноэкранного режима
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  }
})
</script>