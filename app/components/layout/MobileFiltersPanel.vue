<!-- components/layout/MobileFiltersPanel.vue -->
<template lang="pug">
.mobile-filters-wrapper(
  class="lg:hidden"
  :class="{ 'horizontal-orientation': isHorizontal }"
)
  .mobile-filters-overlay(@click="handleClose")
  .mobile-filters-panel(
    :class="{ 'horizontal-panel': isHorizontal }"
  )
    .filters-header.flex.items-center.justify-between.p-4.bg-base-100.border-b.border-base-300(
      class="sm:px-3 sm:py-1"
      :class="{ 'horizontal-header': isHorizontal }"
    )
      .flex.items-center
        h2.text-lg.font-bold.text-base-content(class="hidden sm:block") Фильтры
      
      .flex.items-center.gap-2
        //- Кнопка "Применить" для закрытия панели
        button.btn.btn-info.btn-sm.rounded-lg(
          @click="handleApplyAndClose"
          class="px-3 py-1"
        )
          span.text-xs.text-white Применить

    .filters-content.p-4.bg-base-100.overflow-y-auto(
      class="sm:p-1"
      :class="{ 'horizontal-content': isHorizontal }"
    )
      ProductFilter(
        :total-count="totalCount"
        :filtered-count="filteredCount"
        :show-product-count="true"
        :searchQuery="searchQuery"
        :categories="categories"
        :filters="filters"
        :sort="sort"
        :priceRange="priceRange"
        :isHorizontal="isHorizontal"
        @update:filters="handleFiltersUpdate"
        @update:sort="handleSortUpdate"
        @update:searchQuery="handleSearchQueryUpdate"
        @reset-filters="handleResetFilters"
        @scroll-to-top="handleScrollToTop"
      )
</template>

<script setup>
import ProductFilter from '~/components/products/ProductFilter.vue'
import { useMobileDetection } from '@/composables/useMobileDetection'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const { isMobile } = useMobileDetection()
const isHorizontal = ref(false)

const checkOrientation = () => {
  if (process.client) {
    isHorizontal.value = window.innerWidth > window.innerHeight && window.innerWidth <= 926
  }
}

const initOrientationListeners = () => {
  if (process.client) {
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
  }
}

const destroyOrientationListeners = () => {
  if (process.client) {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
  }
}

// Обработчик обновления фильтров (НЕ закрываем панель сразу)
const handleFiltersUpdate = (filters) => {
  console.log('📱 MobileFiltersPanel: обновление фильтров', filters)
  emit('update:filters', filters)
}

// Обработчик обновления сортировки (НЕ закрываем панель сразу)
const handleSortUpdate = (sort) => {
  console.log('📱 MobileFiltersPanel: обновление сортировки', sort)
  emit('update:sort', sort)
}

// Обработчик обновления поискового запроса
const handleSearchQueryUpdate = (query) => {
  emit('update:searchQuery', query)
}

// Обработчик сброса фильтров (БЕЗ сброса сортировки)
const handleResetFilters = () => {
  console.log('🔄 MobileFiltersPanel: сброс фильтров (без сортировки)')
  emit('reset-filters')
}

// Обработчик прокрутки к началу
const handleScrollToTop = () => {
  emit('scroll-to-top')
}

// Обработчик "Применить и закрыть"
const handleApplyAndClose = () => {
  console.log('✅ MobileFiltersPanel: применение фильтров и закрытие')
  emit('close')
  
  // Даем небольшой таймаут для обновления DOM перед прокруткой
  setTimeout(() => {
    emit('scroll-to-top')
  }, 150)
}

// Обработчик закрытия панели
const handleClose = () => {
  emit('close')
}

onMounted(() => {
  initOrientationListeners()
})

onUnmounted(() => {
  destroyOrientationListeners()
})

watch(isMobile, () => {
  checkOrientation()
})

// пропсы
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  sort: {
    type: Object,
    default: () => ({})
  },
  priceRange: {
    type: Object,
    default: () => ({})
  },
  // ДОБАВЬТЕ эти пропсы для количества товаров
  totalCount: {
    type: Number,
    default: 0
  },
  filteredCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'close',
  'update:filters',
  'update:sort',
  'update:searchQuery',
  'reset-filters',
  'scroll-to-top'
])
</script>