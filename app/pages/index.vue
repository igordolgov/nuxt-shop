<!-- app\pages\index.vue -->
<template lang="pug">
//- Главный контейнер страницы с использованием CSS Grid
.grid-container.min-h-screen
  //- Хедер сайта - занимает первую строку
  ClientOnly
    Header.header-area(
      :activeFiltersCount="activeFiltersCount"
      :displayedProductsCount="safeDisplayedProducts.length"
      :totalProductsCount="totalProductsCount"
      :searchQuery="safeSearchQuery"
      :isSearching="safeIsSearching"
      :showSuggestions="safeShowSuggestions"
      :searchSuggestions="safeSuggestions"
      :hasSearchSuggestions="safeHasSuggestions"
      :activeSuggestionIndex="safeActiveSuggestionIndex"
      :showFilters="showMobileFilters"
      @update:searchQuery="handleSearchQueryUpdate"
      @suggestionSelected="handleSuggestionSelected"
      @performSearch="handlePerformSearch"
      @resetSearch="handleResetSearch"
      @search="handleGlobalSearch"
      @clear-search="handleClearSearch"
      @toggleFilters="toggleMobileFilters"
      @update:activeSuggestionIndex="handleUpdateActiveSuggestionIndex"
      @update:showSuggestions="handleUpdateShowSuggestions"
      @filters-update="handleFiltersUpdateWithScroll"
      @sort-update="handleSortUpdateWithScroll"
      @search-query-update="handleSearchQueryUpdate"
      @reset-filters="handleResetFiltersWithScroll"
    )

  //- Панель мобильных фильтров - позиционируется поверх контента
  ClientOnly
    MobileFiltersPanel.mobile-filters(
      v-if="showMobileFilters"
      :searchQuery="safeSearchQuery"
      :categories="safeCategories"
      :filters="safeFilters"
      :sort="safeSort"
      :priceRange="safePriceRange"
      :total-count="totalProductsCount"
      :filtered-count="safeDisplayedProducts.length"
      @close="closeMobileFilters"
      @update:filters="handleFiltersUpdateWithScroll"
      @update:sort="handleSortUpdateWithScroll"
      @update:searchQuery="handleSearchQueryUpdate"
      @reset-filters="handleResetFiltersWithScroll"
      @scroll-to-top="scrollToProductsTop"
    )

  //- Основной контент с использованием CSS Grid для адаптивной раскладки
  .main-content-wrapper
    .content-area.grid-area
      //- Десктопный сайдбар - только на больших экранах
      ClientOnly
        DesktopSidebar.sidebar-area(
          v-if="!isMobile"
          :searchQuery="safeSearchQuery"
          :categories="safeCategories"
          :filters="safeFilters"
          :sort="safeSort"
          :priceRange="safePriceRange"
          :total-count="totalProductsCount"
          :filtered-count="safeDisplayedProducts.length"
          @update:filters="handleFiltersUpdateWithScroll"
          @update:sort="handleSortUpdateWithScroll"
          @update:searchQuery="appState.setSearchQuery"
          @reset-filters="handleResetFiltersWithScroll"
          @scroll-to-top="scrollToProductsTop"
        )

      //- Основная область с товарами
      .main-area.bg-base-100(
        :class="getMainContentClasses()"
        class="sm:pt-0"
      )
        //- Контейнер для товаров с возможностью прокрутки
        .products-container(
          ref="productsContainerRef"
          :style="containerStyle"
        )
          //- Рендерим ProductsSection только после определения ориентации
          ProductsSection(
            v-if="orientationDetermined"
            :products="safeDisplayedProducts"
            :isLoading="safeIsLoading"
            :isMobile="isMobile"
            :isHorizontal="isHorizontal"
            :searchQuery="safeSearchQuery"
            :activeFiltersCount="activeFiltersCount"
            @toggleFavorite="appState.toggleFavorite"
            @addToCart="addToCart"
            @resetFilters="handleResetFiltersWithScroll"
            @refreshProducts="refreshProducts"
            @clearSearch="handleClearSearch"
          )
          //- Загрузочный спиннер пока определяется ориентация
          .loading-orientation(v-else)
            .spinner.flex.items-center.justify-center.h-full
              svg.w-8.h-8.animate-spin.text-primary(xmlns="http://www.w3.org/2000/svg", fill="none", viewBox="0 0 24 24")
                circle.opacity-25(cx="12", cy="12", r="10", stroke="currentColor", stroke-width="4")
                path.opacity-75(fill="currentColor", d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z")

  //- Мобильный футер - в портретной ориентации снизу
  ClientOnly
    MobileNavFooter(
      v-if="isMobile && orientationDetermined"
      :class="[isHorizontal ? 'horizontal-footer-left' : 'footer-area']"
      :isHorizontal="isHorizontal"
      :activeFiltersCount="activeFiltersCount"
      :activeTab="currentTab"
      @toggleFilters="toggleMobileFilters"
      @openCart="openCart"
      @openFavorites="openFavorites"
      @openAuth="openAuth"
    )

  //- Кнопка наверх
  ClientOnly
    ScrollToTop.scroll-top(
      :visible="showScrollTop && orientationDetermined"
      :target="scrollTarget"
    )
</template>

<style scoped>
/* ============================================
  ОСНОВНАЯ СТРУКТУРА
   ============================================ */

/* Главный контейнер */
.grid-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  overflow: hidden;
}

/* Хедер - фиксированная высота, вся ширина */
.header-area {
  flex-shrink: 0;
  width: 100%;
  z-index: 40;
}

/* Обертка основного контента */
.main-content-wrapper {
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

/* ============================================
  ОБЛАСТЬ КОНТЕНТА С CSS GRID
   ============================================ */

/* Контейнер для контента использует CSS Grid */
.content-area {
  flex: 1;
  display: grid;
  
  /* На мобильных: одна колонка */
  grid-template-columns: 1fr;
  grid-template-areas: "main";
  
  /* На десктопе: две колонки */
  @media (min-width: 1025px) {
    grid-template-columns: 280px 1fr;
    grid-template-areas: "sidebar main";
    gap: 1rem;
    padding: 0 1rem;
  }
}

/* Область сайдбара - только на десктопе */
.sidebar-area {
  grid-area: sidebar;
  display: none;
  
  @media (min-width: 1025px) {
    display: block;
    padding-top: 10px;
  }
}

/* Основная область с товарами */
.main-area {
  grid-area: main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

/* ============================================
  КОНТЕЙНЕР ТОВАРОВ
   ============================================ */

/* Контейнер для товаров */
.products-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

/* Загрузка при определении ориентации */
.loading-orientation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* ============================================
  МОБИЛЬНЫЙ ФУТЕР - ОСНОВНЫЕ СТИЛИ
   ============================================ */

/* Мобильный футер в портретной ориентации (снизу) */
.footer-area {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  z-index: 30;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* Мобильный футер в горизонтальной ориентации (слева) */
.horizontal-footer-left {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 70px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: white;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  padding-top: 1rem;
  gap: 1.5rem;
}

/* Для очень маленьких экранов в ландшафте */
@media (max-width: 360px) and (orientation: landscape) {
  .horizontal-footer-left {
    width: 50px;
  }
}

/* Основная область в горизонтальном режиме */
.main-area.horizontal-orientation {
  margin-left: 64px !important;
  width: calc(100% - 64px) !important;
  padding-left: 0 !important;
  
  @media (max-width: 740px) and (orientation: landscape) {
    margin-left: 60px !important;
    width: calc(100% - 60px) !important;
  }
  
  @media (max-width: 360px) and (orientation: landscape) {
    margin-left: 50px !important;
    width: calc(100% - 50px) !important;
  }
}

/* КОНТЕЙНЕР ТОВАРОВ В ГОРИЗОНТАЛЬНОМ РЕЖИМЕ */
.main-area.horizontal-orientation .products-container {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* ============================================
  СЕТКА ТОВАРОВ В ГОРИЗОНТАЛЬНОМ РЕЖИМЕ
   ============================================ */

/* По умолчанию для горизонтального режима - 4 колонки */
.main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout) {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 0.5rem !important;
  padding: 0 !important;
  padding-bottom: 8px !important;
}

/* Для узких экранов в ландшафте - 3 колонки */
@media (max-width: 700px) and (orientation: landscape) {
  .main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout) {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

/* Для очень узких экранов в ландшафте - 2 колонки */
@media (max-width: 500px) and (orientation: landscape) {
  .main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

/* Для планшетов в ландшафте - 5 колонок */
@media (min-width: 927px) and (max-width: 1024px) and (orientation: landscape) {
  .main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout) {
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  }
}

/* Для мобильных в портретной ориентации - 2 колонки */
.main-area:not(.horizontal-orientation) .products-container ::v-deep(.vertical-layout) {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 0.5rem !important;
  padding-bottom: 0rem !important;
}

/* ============================================
  SNAP-SCROLL
   ============================================ */

/* SNAP-SCROLL для портретной ориентации */
@media (max-width: 1024px) and (orientation: portrait) {
  .products-container {
    scroll-snap-type: y mandatory;
    scroll-padding: 8px 0;
    scroll-behavior: smooth;
    overscroll-behavior: contain;
    scroll-snap-stop: always;
  }
  
  .main-area:not(.horizontal-orientation) .products-container ::v-deep(.vertical-layout .product-item),
  .main-area:not(.horizontal-orientation) .products-container ::v-deep(.vertical-layout .product-card) {
    scroll-snap-align: start !important;
  }
}

/* SNAP-SCROLL для горизонтального режима */
@media (max-width: 1024px) and (orientation: landscape) {
  .products-container {
    scroll-snap-type: y mandatory !important;
    scroll-padding: 8px 0;
    scroll-behavior: smooth;
    overscroll-behavior: contain;
    scroll-snap-stop: always;
    padding-bottom: 20px !important;
  }
  
  .main-area.horizontal-orientation .products-container {
    scroll-snap-type: y mandatory !important;
    scroll-padding: 8px 0.5rem !important;
  }
}

/* Отключаем snap-scroll на десктопе */
@media (min-width: 1025px) {
  .products-container {
    scroll-snap-type: none;
    max-height: calc(100dvh - 64px);
  }
}

/* ============================================
  АДАПТИВНЫЕ ВЫСОТЫ И ШИРИНЫ
   ============================================ */

/* Мобильные устройства - портретная ориентация */
@media (max-width: 768px) {
  .products-container {
    max-height: calc(100dvh - 0px);
    padding-bottom: 86px;
  }
  
  .main-area.horizontal-orientation .products-container {
    max-height: calc(100dvh - 60px);
    padding-bottom: 0 !important;
    height: calc(100dvh - 60px);
  }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
  .products-container {
    max-height: calc(100dvh - 60px);
  }
}

/* Очень маленькие экраны в ландшафте */
@media (max-width: 360px) and (orientation: landscape) {
  .main-area.horizontal-orientation .products-container {
    scroll-padding: 4px 0 !important;
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }
  
  .main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  
  .main-area.horizontal-orientation .products-container ::v-deep(.horizontal-layout > *) {
    min-height: 160px;
    max-height: 160px;
    height: 160px;
  }
}

/* ============================================
  КНОПКА НАВЕРХ
   ============================================ */

.scroll-top {
  position: fixed;
  right: 16px;
  z-index: 20;
}

.main-area.horizontal-orientation {
  bottom: 16px;
}

/* Панель мобильных фильтров */
.mobile-filters {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
}
</style>

<script setup>
import Header from '~/components/layout/Header.vue'
import ProductsSection from '~/components/products/ProductsSection.vue'
import DesktopSidebar from '~/components/layout/DesktopSidebar.vue'
import MobileFiltersPanel from '~/components/layout/MobileFiltersPanel.vue'
import ScrollToTop from '~/components/ScrollToTop.vue'
import MobileNavFooter from '~/components/layout/MobileNavFooter.vue'

import { useAppState } from '@/composables/useAppState'
import { useMobileDetection } from '@/composables/useMobileDetection'
import { useCart } from '@/composables/useCart'
import { nextTick, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { addToCart } = useCart()
const appState = useAppState()
const { isMobile } = useMobileDetection()
const { $notify } = useNuxtApp()

// Реактивные переменные
const showMobileFilters = ref(false)
const showScrollTop = ref(false)
const productsContainerRef = ref(null)
const isHorizontal = ref(false)
const orientationDetermined = ref(false)

// Добавляем определение активной вкладки
const currentTab = ref('home')

watch(
  () => route.path,
  (path) => {
    if (path === '/') currentTab.value = 'home'
    else if (path.startsWith('/cart')) currentTab.value = 'cart'
    else if (path.startsWith('/favorites')) currentTab.value = 'favorites'
    else if (path.startsWith('/auth') || path.startsWith('/user')) currentTab.value = 'auth'
    else currentTab.value = ''
  }
)

// Динамический target для ScrollToTop
const scrollTarget = computed(() => {
  return productsContainerRef.value || '.products-container'
})

// Стиль для контейнера продуктов
const containerStyle = computed(() => {
  if (!process.client) return {}
  
  if (isMobile.value && isHorizontal.value) {
    return {
      height: 'calc(100dvh - 60px)',
      maxHeight: 'calc(100dvh - 60px)'
    }
  }
  
  return {}
})

// Функция для получения классов основной области
const getMainContentClasses = () => {
  const classes = []
  if (isMobile.value) {
    classes.push('mobile-layout')
  }
  if (isMobile.value && isHorizontal.value) {
    classes.push('horizontal-orientation')
  }
  return classes.join(' ')
}

// Функция проверки ориентации устройства
const checkOrientation = () => {
  if (process.client) {
    const width = window.innerWidth
    const height = window.innerHeight
    const isLandscape = width > height
    
    const isMobileDevice = width <= 768
    
    if (isMobileDevice) {
      isHorizontal.value = isLandscape && width <= 926
    } else {
      isHorizontal.value = isLandscape && width <= 1024
    }
    
    console.log('Ориентация:', {
      width,
      height,
      isLandscape,
      isMobileDevice,
      isHorizontal: isHorizontal.value,
      orientationDetermined: orientationDetermined.value
    })
    
    if (!orientationDetermined.value) {
      orientationDetermined.value = true
    }
  }
}

// Обработчик скролла
const handleContainerScroll = () => {
  if (!process.client || !productsContainerRef.value) return
  
  const container = productsContainerRef.value
  const scrollTop = container.scrollTop
  showScrollTop.value = scrollTop > 100
}

// Вычисляемые свойства
const safeSearchQuery = computed(() => appState.search?.query?.value || '')
const safeIsSearching = computed(() => appState.search?.isSearching?.value || false)
const safeShowSuggestions = computed(() => appState.search?.showSuggestions?.value || false)
const safeSuggestions = computed(() => appState.search?.suggestions?.value || [])
const safeHasSuggestions = computed(() => appState.search?.hasSuggestions?.value || false)
const safeActiveSuggestionIndex = computed(() => appState.search?.activeSuggestionIndex?.value || -1)
const safeCategories = computed(() => appState.categories?.value || [])
const safeFilters = computed(() => appState.filters?.value || {})
const safeSort = computed(() => {
  const currentSort = appState.sort?.value
  // Проверяем, есть ли сортировка, если нет - используем дефолтную
  if (!currentSort || !currentSort.field) {
    return { field: 'createdAt', order: 'desc' }
  }
  return currentSort
})
const safePriceRange = computed(() => appState.actualPriceRange?.value || {})
const safeIsLoading = computed(() => appState.loading?.value || false)
const safeDisplayedProducts = computed(() => appState.displayedProducts?.value || [])
const safeProducts = computed(() => appState.products?.value || [])
const totalProductsCount = computed(() => safeProducts.value?.length || 0)

// Количество активных фильтров
const activeFiltersCount = computed(() => {
  let count = 0
  const filters = safeFilters.value
  if (!filters) return 0
  
  if (filters.categories && filters.categories.length > 0) count++
  if (filters.onlyInStock) count++
  if (filters.onlyFavorites) count++
  
  const actualMin = safePriceRange.value?.min || 0
  const actualMax = safePriceRange.value?.max || 100000
  const filterMin = filters.priceRange?.min || actualMin
  const filterMax = filters.priceRange?.max || actualMax
  
  if (filterMin > actualMin || filterMax < actualMax) count++
  
  return count
})

// Функция для расчета оптимальной высоты контейнера
const adjustContainerHeight = () => {
  if (!process.client || !productsContainerRef.value || !isMobile.value || !isHorizontal.value) return
  
  const container = productsContainerRef.value
  const cardHeight = 180
  const width = window.innerWidth
  let columns = 4
  if (width <= 500) columns = 2
  else if (width <= 700) columns = 3
  else if (width <= 926) columns = 4
  
  const rows = Math.ceil(safeDisplayedProducts.value.length / columns)
  const gridHeight = rows * cardHeight + (rows - 1) * 8
  
  if (gridHeight > container.clientHeight) {
    container.style.height = 'calc(100dvh - 60px)'
  } else {
    container.style.height = `${gridHeight + 20}px`
  }
}

// Функция инициализации
const initOrientationAndScroll = () => {
  if (process.client) {
    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100)
    })
    
    if (productsContainerRef.value) {
      productsContainerRef.value.addEventListener('scroll', handleContainerScroll, { passive: true })
    }
    
    setTimeout(() => {
      if (!orientationDetermined.value) {
        orientationDetermined.value = true
      }
      adjustContainerHeight()
    }, 300)
  }
}

// Функция очистки
const destroyOrientationAndScroll = () => {
  if (process.client) {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
    
    if (productsContainerRef.value) {
      productsContainerRef.value.removeEventListener('scroll', handleContainerScroll)
    }
  }
}

// Функция прокрутки к началу товаров
const scrollToProductsTop = () => {
  if (process.client) {
    setTimeout(() => {
      if (productsContainerRef.value) {
        productsContainerRef.value.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      
      console.log('🔼 Прокрутка к началу товаров')
    }, 150)
  }
}

// Основная функция сброса фильтров с прокруткой
const handleResetFiltersWithScroll = async () => {
  console.log('🔄 Сброс фильтров с прокруткой к началу')
  
  try {
    // 1. Закрываем панель фильтров
    showMobileFilters.value = false
    
    // 2. Сохраняем текущую сортировку
    const currentSort = { ...safeSort.value }
    
    // 3. Сбрасываем только фильтры, НЕ сортировку
    appState.handleFiltersUpdate({
      categories: [],
      priceRange: { min: null, max: null },
      onlyInStock: false,
      onlyFavorites: false
    })
    
    // 4. Сбрасываем поисковый запрос
    appState.setSearchQuery('')
    
    // 5. Восстанавливаем сортировку (если она была)
    if (currentSort.field) {
      appState.handleSortUpdate(currentSort)
    }
    
    // 6. Даем время на обновление DOM
    await nextTick()
    
    // 7. Прокручиваем к началу
    scrollToProductsTop()
    
    /* $notify.success('Фильтры сброшены', 'Показаны все товары') */
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе фильтров:', error)
    $notify.error('Ошибка при сбросе фильтров', 'Попробуйте еще раз')
  }
}

// Обработчики событий с прокруткой
const handleFiltersUpdateWithScroll = (filters) => {
  console.log('📱 Index: обновление фильтров', filters)
  appState.handleFiltersUpdate(filters)
  scrollToProductsTop()
}

const handleSortUpdateWithScroll = (sort) => {
  console.log('📱 Index: обновление сортировки', sort)
  appState.handleSortUpdate(sort)
  scrollToProductsTop()
}

// Старые обработчики (для обратной совместимости)
const handleSearchQueryUpdate = (query) => appState.setSearchQuery(query)
const handleGlobalSearch = (query) => appState.setSearchQuery(query)
const handleSuggestionSelected = async (suggestion) => {
  try {
    await router.push(`/product/${suggestion.id}`)
  } catch (error) {
    appState.setSearchQuery(suggestion.name)
    appState.search.performSearch()
  }
}
const handlePerformSearch = () => appState.search.performSearch()
const handleResetSearch = () => appState.search.resetSearch()
const handleClearSearch = () => appState.setSearchQuery('')
const handleUpdateActiveSuggestionIndex = (index) => appState.search.activeSuggestionIndex.value = index
const handleUpdateShowSuggestions = (value) => appState.search.showSuggestions.value = value

// Старая функция для обратной совместимости
const handleResetFilters = () => handleResetFiltersWithScroll()

const refreshProducts = async () => {
  try {
    await appState.loadProducts()
    $notify.success('Товары обновлены')
  } catch (error) {
    console.error('❌ Ошибка:', error)
    $notify.error('Ошибка обновления')
  }
}

const toggleMobileFilters = () => {
  console.log('📱 Открытие/закрытие панели фильтров')
  showMobileFilters.value = !showMobileFilters.value
}

const closeMobileFilters = () => {
  console.log('📱 Закрытие панели фильтров')
  showMobileFilters.value = false
}

// Функции навигации
const openCart = () => { if (process.client) window.location.href = '/cart' }
const openFavorites = () => { if (process.client) window.location.href = '/favorites' }
const openAuth = () => { if (process.client) window.location.href = '/auth/login' }

// Хуки жизненного цикла
onMounted(() => {
  // Проверяем и устанавливаем сортировку по умолчанию если нет
  if (!safeSort.value.field) {
    const defaultSort = { field: 'createdAt', order: 'desc' }
    appState.handleSortUpdate(defaultSort)
    console.log('📦 Установлена сортировка по умолчанию:', defaultSort)
  }
  
  if (safeProducts.value.length === 0 && !safeIsLoading.value) {
    appState.loadProducts()
  }
  
  if (process.client) {
    initOrientationAndScroll()
  }
})

onUnmounted(() => {
  destroyOrientationAndScroll()
})

// Наблюдатели
watch(showMobileFilters, (newVal) => {
  if (process.client) {
    document.body.style.overflow = newVal ? 'hidden' : ''
  }
})

watch(isHorizontal, (newVal) => {
  console.log('Горизонтальный режим изменен:', newVal)
  if (process.client) {
    setTimeout(() => {
      handleContainerScroll()
      adjustContainerHeight()
    }, 50)
  }
})

watch(isMobile, (newVal) => {
  console.log('Мобильный режим изменен:', newVal)
  if (newVal) {
    initOrientationAndScroll()
  } else {
    showScrollTop.value = false
    isHorizontal.value = false
    orientationDetermined.value = true
  }
})

watch(productsContainerRef, (newContainer, oldContainer) => {
  if (process.client) {
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', handleContainerScroll)
    }
    if (newContainer) {
      newContainer.addEventListener('scroll', handleContainerScroll, { passive: true })
    }
  }
})

// Наблюдатель за продуктами
watch(safeDisplayedProducts, () => {
  if (process.client && isMobile.value && isHorizontal.value) {
    setTimeout(adjustContainerHeight, 100)
  }
})

// Наблюдатель за фильтрами и сортировкой - автоматическая прокрутка
watch([safeFilters, safeSort], () => {
  // Автоматически прокручиваем к началу при изменении фильтров или сортировки
  setTimeout(() => {
    if (process.client) {
      scrollToProductsTop()
    }
  }, 200)
}, { deep: true })
</script>