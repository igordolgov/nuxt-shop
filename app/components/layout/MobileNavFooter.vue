<!-- ~/components/layout/MobileNavFooter.vue -->
<template lang="pug">
ClientOnly
  footer.mobile-nav-footer(
    class="bg-base-100 border-t border-base-300"
    :class="{ 'horizontal-orientation': isHorizontal }"
  )
    nav.nav-items(:class="{ 'vertical-layout': isHorizontal }")
      button.nav-item(
        @click="openHome"
        :class="{ 'is-active': activeHome }"
      )
        .nav-icon
          svg(width="24", height="24", viewBox="0 0 24 24", fill="none")
            path(d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", stroke="currentColor", stroke-width="2")
        span.nav-label Главная
      
      button.nav-item(
        @click="openCart"
        :class="{ 'is-active': activeCart }"
      )
        .nav-icon.relative
          svg(width="24", height="24", viewBox="0 0 24 24", fill="none")
            path(d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z", stroke="currentColor", stroke-width="2")
          .cart-badge(
            v-if="cartItemsCount > 0"
            :class="{ 'cart-badge-sm': cartItemsCount < 10, 'cart-badge-lg': cartItemsCount >= 10 }"
          ) {{ cartItemsCount > 99 ? '99+' : cartItemsCount }}
        span.nav-label Корзина
      
      button.nav-item(
        @click="openFavorites"
        :class="{ 'is-active': activeFavorites }"
      )
        .nav-icon.relative
          svg(width="24", height="24", viewBox="0 0 24 24", fill="none")
            path(d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", stroke="currentColor", stroke-width="2")
          .favorites-badge(
            v-if="displayFavoritesCount > 0"
            :class="{ 'favorites-badge-sm': displayFavoritesCount < 10, 'favorites-badge-lg': displayFavoritesCount >= 10 }"
          ) {{ displayFavoritesCount > 99 ? '99+' : displayFavoritesCount }}
        span.nav-label Избранное
      
      button.nav-item(
        @click="toggleFullScreen"
        :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'"
        :class="{ 'is-active': isFullscreen }"
      )
        .nav-icon
          svg(
            width="24", 
            height="24", 
            viewBox="0 0 24 24", 
            fill="none",
          )
            path(
              v-if="!isFullscreen"
              d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              stroke="currentColor"
              stroke-width="2"
            )
            path(
              v-else
              d="M9 9l6 6m0-6l-6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
            )
        span.nav-label {{ isFullscreen ? 'Свернуть' : 'Развернуть' }}
      
      button.nav-item(
        @click="openAuth"
        :class="{ 'is-active': activeAuth }"
      )
        .nav-icon.relative
          svg(
            width="24", 
            height="24", 
            viewBox="0 0 24 24", 
            fill="none",
          )
            path(
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", 
              :stroke="isAuthenticated ? 'currentColor' : 'currentColor'",
              stroke-width="2",
            )
          .auth-badge(v-if="isAuthenticated")
        span.nav-label {{ isAuthenticated ? 'Профиль' : 'Вход' }}
</template>

<style scoped>
/* Базовые стили */
.mobile-nav-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-top: 6px;
  z-index: 40;
}

.nav-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--bc));
  position: relative;
  flex: 1;
  min-height: 0;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: hsl(var(--bc) / 0.1);
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

/* ============================================
  АКТИВНАЯ ВКЛАДКА - С DaisyUI цветами
   ============================================ */

/* Активная вкладка в светлой теме */
.nav-item.is-active {
  background-color: hsl(var(--p) / 0.15) !important;
  color: hsl(var(--p)) !important;
  font-weight: 600;
}

.nav-item.is-active .nav-icon svg {
  stroke: hsl(var(--p)) !important;
  stroke-width: 2.2px;
}

/* Активная вкладка в темной теме */
:root.dark .nav-item.is-active {
  background-color: hsl(var(--p) / 0.25) !important;
  color: hsl(var(--pc)) !important;
}

:root.dark .nav-item.is-active .nav-icon svg {
  stroke: hsl(var(--pc)) !important;
}

/* ============================================
  ГОРИЗОНТАЛЬНАЯ ОРИЕНТАЦИЯ
   ============================================ */

.mobile-nav-footer.horizontal-orientation {
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 70px;
  border-top: none;
  border-left: none;
  padding: 0;
  z-index: 40;
  height: calc(100% - 56px);
  overflow: hidden;
  background: hsl(var(--b1));
}

.horizontal-orientation .nav-items.vertical-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;
}

.horizontal-orientation .nav-items.vertical-layout .nav-item {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  min-height: 0;
  border-radius: 0;
  border-bottom: 1px solid hsl(var(--b2) / 0.5);
  position: relative;
  overflow: auto;
}

.horizontal-orientation .nav-items.vertical-layout .nav-item:last-child {
  border-bottom: none;
}

.horizontal-orientation .nav-items.vertical-layout .nav-icon {
  width: 22px;
  height: 22px;
}

.horizontal-orientation .nav-items.vertical-layout .nav-label {
  line-height: 1.1;
  padding: 0 2px;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Активная вкладка в горизонтальной ориентации (светлая тема) */
.mobile-nav-footer.horizontal-orientation .nav-item.is-active {
  background-color: hsl(var(--p) / 0.2) !important;
  color: hsl(var(--p)) !important;
}

/* Активная вкладка в горизонтальной ориентации (темная тема) */
:root.dark .mobile-nav-footer.horizontal-orientation .nav-item.is-active {
  background-color: hsl(var(--p) / 0.3) !important;
  color: hsl(var(--pc)) !important;
}

:root.dark .mobile-nav-footer.horizontal-orientation .nav-item.is-active .nav-icon svg {
  stroke: hsl(var(--pc)) !important;
}

/* ============================================
  БЕЙДЖИ
   ============================================ */

.cart-badge,
.favorites-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: oklch(55% 0.2 40);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 10px;
  line-height: 1;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border: 2px solid hsl(var(--b2));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.auth-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: oklch(55% 0.2 40);
  border-radius: 50%;
  width: 8px;
  height: 8px;
  z-index: 1;
}

/* Адаптация для очень маленьких экранов в горизонтальной ориентации */
@media (max-height: 300px) {
  .horizontal-orientation .nav-items.vertical-layout .nav-label {
    font-size: 10px;
  }
  
  .horizontal-orientation .nav-items.vertical-layout .nav-icon {
    width: 20px;
    height: 20px;
  }
  
  .horizontal-orientation .cart-badge,
  .horizontal-orientation .favorites-badge {
    top: 2px;
    right: 2px;
    font-size: 10px;
  }
}

/* ============================================
  АЛЬТЕРНАТИВНЫЙ ПОДХОД - с использованием CSS Custom Properties
   ============================================ */

/* Это запасной вариант, если DaisyUI переменные не работают */
.nav-item.is-active {
  --active-bg-color: rgba(123, 174, 255, 0.150);
  --active-text-color: oklch(60% 0.15 242.749);
}

:root.dark .nav-item.is-active {
  --active-bg-color: rgba(123, 174, 255, 0.150);
  --active-text-color: oklch(60% 0.15 242.749);
}

/* Применяем кастомные свойства как fallback */
.nav-item.is-active {
  background-color: rgba(123, 174, 255, 0.150) !important;
  color: var(--active-text-color, oklch(60% 0.15 242.749)) !important;
}

.nav-item.is-active .nav-icon svg {
  stroke: var(--active-text-color, oklch(60% 0.150 242.749)) !important;
}

.mobile-nav-footer.horizontal-orientation .nav-item.is-active {
  background-color: rgba(123, 174, 255, 0.089) !important;
  color: var(--active-text-color, oklch(60% 0.15 242.749)) !important;
  stroke: var(--active-text-color, oklch(60% 0.15 242.749)) !important;
}

/* ============================================
  МЕДИА-ЗАПРОСЫ ДЛЯ АДАПТИВНОСТИ
   ============================================ */

@media (max-width: 480px) {
  .nav-items {
    padding: 0 6px;
    gap: 4px;
  }
  
  .nav-item {
    padding: 6px 2px;
    gap: 2px;
  }
  
  .nav-label {
    font-size: 10px;
  }
}

@media (max-width: 740px) and (orientation: landscape) {
  .mobile-nav-footer.horizontal-orientation {
    width: 60px;
  }
  
  .horizontal-orientation .nav-items.vertical-layout .nav-label {
    font-size: 8px;
  }
  
  .horizontal-orientation .nav-items.vertical-layout .nav-icon {
    width: 20px;
    height: 20px;
  }
}

/* ============================================
  ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ ГОРИЗОНТАЛЬНОЙ ОРИЕНТАЦИИ
   ============================================ */

/* Добавляем CSS-переменную для ширины навигации */
.mobile-nav-footer.horizontal-orientation {
  --horizontal-nav-width: 70px;
}

@media (max-width: 740px) and (orientation: landscape) {
  .mobile-nav-footer.horizontal-orientation {
    --horizontal-nav-width: 60px;
  }
}
</style>

<script setup>
import { useCart } from '@/composables/useCart'
import { useAppState } from '@/composables/useAppState'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from '#app'

const { totalItems } = useCart()
const appState = useAppState()
const router = useRouter()

// Определяем горизонтальную ориентацию
const isHorizontal = ref(false)

// Состояние избранного
const localFavoritesCount = ref(0)

// Состояние авторизации
const isAuthenticated = computed(() => appState.isAuthenticated.value)

// Состояние полноэкранного режима
const isFullscreen = ref(false)

// Текущий путь
const currentPath = ref('')

// Обновление текущего пути
const updateCurrentPath = () => {
  if (process.client) {
    currentPath.value = window.location.pathname
  }
}

// Computed свойства для каждой вкладки
const activeHome = computed(() => {
  const path = currentPath.value
  return path === '/' || path === '/index' || path === '/home'
})

const activeCart = computed(() => {
  return currentPath.value?.startsWith('/cart') || false
})

const activeFavorites = computed(() => {
  return currentPath.value?.startsWith('/favorites') || false
})

const activeAuth = computed(() => {
  const path = currentPath.value
  return path?.startsWith('/auth') || 
         path?.startsWith('/login') || 
         path?.startsWith('/register') ||
         path?.startsWith('/profile') ||
         path?.startsWith('/user') ||
         path?.startsWith('/account') || false
})

// Используем локальное значение для отображения избранного
const displayFavoritesCount = computed(() => {
  return localFavoritesCount.value || 0
})

// Количество товаров в корзине
const cartItemsCount = computed(() => totalItems.value || 0)

// Проверка ориентации экрана
const checkOrientation = () => {
  if (process.client) {
    const isLandscape = window.innerWidth > window.innerHeight
    const isTabletSize = window.innerWidth <= 926 && window.innerWidth >= 768
    isHorizontal.value = isLandscape && isTabletSize
  }
}

// Проверка состояния полноэкранного режима
const checkFullscreen = () => {
  if (process.client) {
    isFullscreen.value = !!(document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement)
  }
}

// Переключение полноэкранного режима
const toggleFullScreen = () => {
  if (process.client) {
    if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement) {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
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
}

// Загрузка избранного из localStorage
const loadFavoritesFromStorage = () => {
  if (!process.client) return
  
  try {
    const favoritesData = localStorage.getItem('favoriteProducts')
    
    if (favoritesData) {
      const parsed = JSON.parse(favoritesData)
      
      if (Array.isArray(parsed)) {
        localFavoritesCount.value = parsed.length
      } else if (parsed && typeof parsed === 'object') {
        let count = 0
        for (const key in parsed) {
          if (parsed[key] === true) {
            count++
          }
        }
        localFavoritesCount.value = count
      } else {
        localFavoritesCount.value = 0
      }
    } else {
      const otherData = localStorage.getItem('favorites') || localStorage.getItem('userFavorites')
      if (otherData) {
        const parsed = JSON.parse(otherData)
        if (Array.isArray(parsed)) {
          localFavoritesCount.value = parsed.length
        } else if (parsed && parsed.items && Array.isArray(parsed.items)) {
          localFavoritesCount.value = parsed.items.length
        } else if (parsed && typeof parsed === 'object') {
          localFavoritesCount.value = Object.keys(parsed).length
        } else {
          localFavoritesCount.value = 0
        }
      } else {
        localFavoritesCount.value = 0
      }
    }
    
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error)
    localFavoritesCount.value = 0
  }
}

// Обработчик кастомного события
const handleFavoritesUpdated = () => {
  loadFavoritesFromStorage()
}

// Навигационные функции
const openHome = () => {
  router.push('/')
}

const openCart = () => {
  router.push('/cart')
}

const openFavorites = () => {
  router.push('/favorites')
}

const openAuth = () => {
  if (isAuthenticated.value) {
    router.push('/user')
  } else {
    router.push('/auth/login')
  }
}

// Функция для управления CSS-переменной навигации
const updateNavigationWidthVariable = () => {
  if (!process.client) return
  
  if (isHorizontal.value) {
    // Устанавливаем CSS-переменную с шириной навигации
    document.documentElement.style.setProperty(
      '--horizontal-nav-width', 
      window.innerWidth <= 740 ? '60px' : '70px'
    )
  } else {
    // Сбрасываем переменную, когда не в горизонтальном режиме
    document.documentElement.style.setProperty('--horizontal-nav-width', '0px')
  }
}

// Следим за изменениями ориентации
watch(isHorizontal, (newValue) => {
  updateNavigationWidthVariable()
  
  // Добавляем/удаляем класс body для горизонтальной ориентации
  if (process.client) {
    if (newValue) {
      document.body.classList.add('has-horizontal-nav')
    } else {
      document.body.classList.remove('has-horizontal-nav')
    }
  }
})

// Инициализация
onMounted(() => {
  if (process.client) {
    // Загружаем избранное
    loadFavoritesFromStorage()
    
    // Устанавливаем начальный путь
    updateCurrentPath()
    
    // Проверяем ориентацию и полноэкранный режим
    checkOrientation()
    checkFullscreen()
    updateNavigationWidthVariable()
    
    // Добавляем начальный класс к body
    if (isHorizontal.value) {
      document.body.classList.add('has-horizontal-nav')
    }

    // Слушаем события
    document.addEventListener('fullscreenchange', checkFullscreen)
    document.addEventListener('webkitfullscreenchange', checkFullscreen)
    document.addEventListener('mozfullscreenchange', checkFullscreen)
    document.addEventListener('MSFullscreenChange', checkFullscreen)

    window.addEventListener('resize', () => {
      checkOrientation()
      updateNavigationWidthVariable()
    })
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        checkOrientation()
        updateNavigationWidthVariable()
      }, 100)
    })
    
    // Обновляем путь при навигации
    window.addEventListener('popstate', updateCurrentPath)
    
    // Также обновляем при кликах
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        setTimeout(updateCurrentPath, 100)
      }
    })
    
    // Обновляем при возвращении на вкладку
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          updateCurrentPath()
          loadFavoritesFromStorage()
        }, 100)
      }
    })
    
    // Слушаем кастомные события
    window.addEventListener('favorites-updated', handleFavoritesUpdated)
  }
})

onUnmounted(() => {
  if (process.client) {
    // Убираем все слушатели
    document.removeEventListener('fullscreenchange', checkFullscreen)
    document.removeEventListener('webkitfullscreenchange', checkFullscreen)
    document.removeEventListener('mozfullscreenchange', checkFullscreen)
    document.removeEventListener('MSFullscreenChange', checkFullscreen)

    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
    window.removeEventListener('popstate', updateCurrentPath)
    window.removeEventListener('visibilitychange', updateCurrentPath)
    window.removeEventListener('favorites-updated', handleFavoritesUpdated)
    
    document.removeEventListener('click', () => {})
    
    // Удаляем класс и переменную
    document.body.classList.remove('has-horizontal-nav')
    document.documentElement.style.setProperty('--horizontal-nav-width', '0px')
  }
})

// Периодически обновляем избранное
if (process.client) {
  setInterval(() => {
    loadFavoritesFromStorage()
  }, 2000)
}
</script>