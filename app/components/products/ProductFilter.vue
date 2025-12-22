<!-- app\components\products\ProductFilter.vue -->
<template lang="pug">
.product-filter.h-full.border-none.select-none
  //- Заголовок и кнопка сброса
  .filter-header.flex.justify-between.items-center.mb-3(v-if="!isHorizontal")
    .flex.flex-col.w-full
      .flex.justify-between.items-center
        button.btn.btn-info.rounded-lg(
          @click="resetAllFilters" 
          v-if="activeFiltersCount > 0" 
        )
          span.text-sm.text-white Сбросить фильтры
        div(v-else class="lg:bg-transparent pb-2 lg:mt-1 lg:pt-0 lg:pl-0").bg-primary.rounded-lg.px-4.py-2
          span.text-base-content.font-medium(class="text-sm lg:text-lg") Фильтры:
        
        //- Количество товаров (только для вертикального режима)
        .product-count-display.ml-2(v-if="!isHorizontal && shouldShowProductCount")
          .badge.badge-md.badge-outline.px-2.py-3.rounded-md(class="text-info lg:badge-sm")
            span {{ productCountText }} товаров

  //- Основной контейнер
  .filter-content.flex.flex-1.min-h-0.overflow-hidden(
    :class="isHorizontal ? 'horizontal-content' : 'vertical-content'"
  )

    //- Количество товаров (для горизонтального режима)
    .filter-section.flex.flex-col.flex-shrink-0.p-2.bg-base-100.rounded-lg.mt-2.absolute.-top-3.right-26(
      v-if="shouldShowProductCount && isHorizontal"
    )
      .product-count-display.w-full
        .flex.items-center.justify-between
          span.text-sm.mr-2.text-info Показано товаров:
          .badge.badge-primary.px-2.py-1.rounded-sm
            span.text-sm.font-medium {{ productCountText }}
    //- Горизонтальный режим
    template(v-if="isHorizontal")
      .horizontal-layout.flex.flex-row.flex-1.min-h-0.gap-2
        //- Левая колонка: сортировка и цена
        .left-column.flex.flex-col.min-h-0.gap-0(class="w-2/5")
          //- Сортировка
          .filter-section.flex.flex-col.flex-shrink-0.p-2.bg-base-100.rounded-lg
            ProductSort(
              ref="sortRef"
              :sortBy="safeSort.sortBy"
              :sortOrder="safeSort.sortOrder"
              @sort-change="handleSortChange"
              :compact="isHorizontal"
            )

          //- Диапазон цен
          .filter-section.flex.flex-col.flex-1.min-h-0.p-2.bg-base-100.rounded-lg
            ProductPriceRange(
              ref="priceRangeRef"
              :minPrice="safePriceRange.min"
              :maxPrice="safePriceRange.max"
              :currentMin="safeFilters.priceRange.min"
              :currentMax="safeFilters.priceRange.max"
              @update:priceRange="(value) => updateFilter('priceRange', value)"
              :compact="isHorizontal"
            )

          //- Кнопка сброса для горизонтального режима
          .filter-section.flex.flex-col.flex-shrink-0.absolute.-top-3.left-0(
            v-if="activeFiltersCount > 0"
          )
            button.btn.btn-info.btn-sm.rounded-lg.w-full.mt-2.py-4(
              @click="resetAllFiltersWithScroll"
              title="Сбросить все фильтры"
            )
              span.mr-1 🔄
              span.text-sm.text-white Сбросить фильтры

        //- Правая колонка: категории
        .right-column.flex.flex-col.min-h-0(class="w-3/5")
          .filter-section.flex.flex-col.flex-1.min-h-0.p-2.bg-base-100.rounded-lg
            ProductCategories(
              ref="categoriesRef"
              :categories="safeCategories"
              :selectedCategories="safeFilters.categories"
              @update:selectedCategories="updateCategories"
              :searchQuery="safeSearchQuery"
              :compact="isHorizontal"
            )

    //- Вертикальный режим
    template(v-else)
      .vertical-layout.flex.flex-col.flex-1.min-h-0.gap-3.overflow-y-auto.overflow-x-hidden
        //- Сортировка
        .filter-section
          ProductSort(
            ref="sortRef"
            :sortBy="safeSort.sortBy"
            :sortOrder="safeSort.sortOrder"
            @sort-change="handleSortChangeWithScroll"
            :compact="false"
          )

        //- Диапазон цен
        .filter-section
          ProductPriceRange(
            ref="priceRangeRef"
            :minPrice="safePriceRange.min"
            :maxPrice="safePriceRange.max"
            :currentMin="safeFilters.priceRange.min"
            :currentMax="safeFilters.priceRange.max"
            @update:priceRange="(value) => updateFilterWithScroll('priceRange', value)"
            :compact="false"
          )

        //- Категории
        .filter-section.flex-1.overflow-hidden
          ProductCategories(
            ref="categoriesRef"
            :categories="safeCategories"
            :selectedCategories="safeFilters.categories"
            @update:selectedCategories="updateCategoriesWithScroll"
            :searchQuery="safeSearchQuery"
            :compact="false"
          )

        //- //- Количество товаров (внизу вертикального режима)
        //- .filter-section.mt-2(v-if="shouldShowProductCount && !isHorizontal")
        //-   .product-count-display.bg-base-100.rounded-lg.p-3
        //-     .flex.items-center.justify-between
        //-       span.text-sm.font-medium.text-base-content Показано товаров:
        //-       .badge.badge-primary.badge-lg.px-3.py-2
        //-         span.font-bold.text-white {{ productCountText }}
</template>

<style scoped>
/* КРИТИЧЕСКИ ВАЖНЫЕ СТИЛИ ДЛЯ ПРОКРУТКИ */
.product-filter {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-content {
  flex: 1;
  min-height: 0;
}

/* Горизонтальный режим */
.filter-content.horizontal-content {
  overflow: hidden;
}

.horizontal-layout {
  min-height: 0;
  height: 100%;
}

.left-column, .right-column {
  min-height: 0;
  height: 100%;
}

/* Секции в горизонтальном режиме */
.filter-section {
  min-height: 0;
}

/* Прокрутка для правой колонки (категории) в горизонтальном режиме */
.right-column .filter-section {
  overflow-y: auto;
}

/* Вертикальный режим */
.filter-content.vertical-content {
  overflow-y: auto;
}

/* Стили для отображения количества товаров */
.product-count-display {
  transition: all 0.2s ease;
}

.product-count-display .badge {
  white-space: nowrap;
}

/* Адаптивные стили */
@media (max-width: 926px) and (orientation: landscape) {
  .left-column, .right-column {
    padding: 0.125rem;
  }
  
  .filter-section {
    padding: 0.5rem;
  }
  
  .product-count-display {
    padding: 0.25rem;
  }
}

/* Улучшенные скроллбары */
.right-column .filter-section::-webkit-scrollbar {
  width: 4px;
}

.right-column .filter-section::-webkit-scrollbar-track {
  background: hsl(var(--b3));
  border-radius: 2px;
}

.right-column .filter-section::-webkit-scrollbar-thumb {
  background: hsl(var(--p));
  border-radius: 2px;
}

.vertical-content::-webkit-scrollbar {
  width: 6px;
}

.vertical-content::-webkit-scrollbar-track {
  background: hsl(var(--b3));
  border-radius: 3px;
}

.vertical-content::-webkit-scrollbar-thumb {
  background: hsl(var(--p));
  border-radius: 3px;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
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
    default: () => ({
      categories: [],
      priceRange: {
        min: null,
        max: null
      },
      onlyInStock: false,
      onlyFavorites: false
    })
  },
  sort: {
    type: Object,
    default: () => ({
      sortBy: 'name',
      sortOrder: 'asc'
    })
  },
  priceRange: {
    type: Object,
    default: () => ({ 
      min: 0, 
      max: 1000 
    })
  },
  isHorizontal: {
    type: Boolean,
    default: false
  },
  // Новые пропсы для отображения количества товаров
  productCount: {
    type: Object,
    default: () => null
  },
  // Альтернативные пропсы для обратной совместимости
  filteredCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  showProductCount: {
    type: Boolean,
    default: true
  }
})

import { watch } from 'vue'

watch(() => props.productCount, (newVal) => {
  console.log('🔄 productCount изменился:', newVal)
}, { deep: true })

watch(() => props.totalCount, (newVal) => {
  console.log('🔄 totalCount изменился:', newVal)
})

watch(() => props.filteredCount, (newVal) => {
  console.log('🔄 filteredCount изменился:', newVal)
})

const emit = defineEmits([
  'update:filters',
  'update:sort',
  'update:searchQuery',
  'reset-filters',
  'scroll-to-top'
])

// Refs
const sortRef = ref(null)
const categoriesRef = ref(null)
const priceRangeRef = ref(null)

// Безопасные computed свойства
const safeSearchQuery = computed(() => {
  return props.searchQuery || ''
})

const safeCategories = computed(() => {
  const categories = Array.isArray(props.categories) ? props.categories : []
  
  return categories
    .map(cat => ({ name: cat, length: cat.length }))
    .sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length
      return a.name.localeCompare(b.name)
    })
    .map(item => item.name)
})

const safeFilters = computed(() => {
  const defaultFilters = {
    categories: [],
    priceRange: { min: null, max: null },
    onlyInStock: false,
    onlyFavorites: false
  }
  
  if (!props.filters || typeof props.filters !== 'object') {
    return defaultFilters
  }
  
  return {
    categories: Array.isArray(props.filters.categories) ? props.filters.categories : defaultFilters.categories,
    priceRange: props.filters.priceRange && typeof props.filters.priceRange === 'object' 
      ? { 
          min: props.filters.priceRange.min !== undefined ? props.filters.priceRange.min : null,
          max: props.filters.priceRange.max !== undefined ? props.filters.priceRange.max : null
        }
      : defaultFilters.priceRange,
    onlyInStock: Boolean(props.filters.onlyInStock),
    onlyFavorites: Boolean(props.filters.onlyFavorites)
  }
})

const safeSort = computed(() => {
  const defaultSort = {
    sortBy: 'name',
    sortOrder: 'asc'
  }
  
  if (!props.sort || typeof props.sort !== 'object') {
    return defaultSort
  }
  
  return {
    sortBy: props.sort.sortBy || defaultSort.sortBy,
    sortOrder: props.sort.sortOrder || defaultSort.sortOrder
  }
})

const safePriceRange = computed(() => {
  const defaultRange = { min: 0, max: 1000 }
  
  if (!props.priceRange || typeof props.priceRange !== 'object') {
    return defaultRange
  }
  
  return {
    min: Number(props.priceRange.min) || defaultRange.min,
    max: Number(props.priceRange.max) || defaultRange.max
  }
})

// Безопасное получение количества товаров
const safeProductCount = computed(() => {
  // Если передан объект productCount
  if (props.productCount && typeof props.productCount === 'object') {
    const count = props.productCount
    return {
      total: Number(count.total) || 0,
      filtered: Number(count.filtered) || 0,
      showing: Number(count.showing) || 0
    }
  }
  
  // Иначе используем отдельные пропсы для обратной совместимости
  return {
    total: Number(props.totalCount) || 0,
    filtered: Number(props.filteredCount) || 0,
    showing: Number(props.filteredCount) || 0
  }
})

// Определяем, нужно ли показывать счетчик товаров
const shouldShowProductCount = computed(() => {
  // Всегда показывать счетчик
  return true
})

const productCountText = computed(() => {
  const { total, filtered, showing } = safeProductCount.value
  
  // Если нет данных, показываем "Загрузка..."
  if (total === 0 && filtered === 0 && showing === 0) {
    return "Загрузка..."
  }
  
  // Если showing задан и отличается от filtered (есть пагинация)
  if (showing > 0 && showing !== filtered) {
    return `${showing} из ${filtered} (всего ${total})`
  }
  
  // Если filtered отличается от total (применены фильтры)
  if (filtered !== total && filtered > 0) {
    return `${filtered} из ${total}`
  }
  
  // Если показаны все товары или нет фильтров
  return `${total}`
})

// Вычисляемые свойства
const activeFiltersCount = computed(() => {
  let count = 0
  if (safeFilters.value.categories && safeFilters.value.categories.length > 0) count++
  if (safeFilters.value.priceRange && (safeFilters.value.priceRange.min !== null || safeFilters.value.priceRange.max !== null)) count++
  if (safeFilters.value.onlyInStock) count++
  if (safeFilters.value.onlyFavorites) count++
  return count
})

// Обновление фильтров
const updateFilter = (key, value) => {
  try {
    const newFilters = { ...safeFilters.value }
    
    if (key === 'priceRange') {
      newFilters.priceRange = value && typeof value === 'object' ? value : { min: null, max: null }
    } else if (key === 'categories') {
      newFilters.categories = Array.isArray(value) ? value : []
    } else if (key === 'onlyInStock') {
      newFilters.onlyInStock = Boolean(value)
    } else if (key === 'onlyFavorites') {
      newFilters.onlyFavorites = Boolean(value)
    }
    
    emit('update:filters', newFilters)
    
  } catch (error) {
    console.error('Ошибка обновления фильтра:', error)
  }
}

// Обновление фильтров с прокруткой
const updateFilterWithScroll = (key, value) => {
  updateFilter(key, value)
  emit('scroll-to-top')
}

// Обновление категорий
const updateCategories = (categories) => {
  updateFilter('categories', categories)
}

// Обновление категорий с прокруткой
const updateCategoriesWithScroll = (categories) => {
  updateCategories(categories)
  emit('scroll-to-top')
}

// Обработчик сортировки
const handleSortChange = (sort) => {
  try {
    if (sort && typeof sort === 'object') {
      const sortData = {
        field: sort.field || 'name',
        order: sort.order || 'asc'
      }
      emit('update:sort', sortData)
    }
  } catch (error) {
    console.error('Ошибка обработки сортировки:', error)
  }
}

// Обработчик сортировки с прокруткой
const handleSortChangeWithScroll = (sort) => {
  handleSortChange(sort)
  emit('scroll-to-top')
}

// Сброс всех фильтров (БЕЗ сброса сортировки)
const resetAllFilters = () => {
  try {
    // Сбрасываем только фильтры, НЕ сортировку
    if (categoriesRef.value && typeof categoriesRef.value.resetCategories === 'function') {
      categoriesRef.value.resetCategories()
    }
    if (priceRangeRef.value && typeof priceRangeRef.value.resetPriceRange === 'function') {
      priceRangeRef.value.resetPriceRange()
    }
    
    // Создаем новый объект фильтров с пустыми значениями
    const emptyFilters = {
      categories: [],
      priceRange: { min: null, max: null },
      onlyInStock: false,
      onlyFavorites: false
    }
    
    // Эмитим событие сброса фильтров
    emit('update:filters', emptyFilters)
    emit('reset-filters')
    
  } catch (error) {
    console.error('Ошибка сброса фильтров:', error)
  }
}

// Сброс фильтров с прокруткой
const resetAllFiltersWithScroll = () => {
  resetAllFilters()
  emit('scroll-to-top')
}

onMounted(() => {
  console.log('🚀 ProductFilter mounted')
  console.log('📊 ProductFilter productCount пропс:', props.productCount)
  console.log('📊 ProductFilter totalCount:', props.totalCount, 'filteredCount:', props.filteredCount)
  console.log('📊 ProductFilter showProductCount пропс:', props.showProductCount)
  console.log('📊 Вычисленные значения:')
  console.log('   safeProductCount:', safeProductCount.value)
  console.log('   shouldShowProductCount:', shouldShowProductCount.value)
  console.log('   productCountText:', productCountText.value)
  console.log('   activeFiltersCount:', activeFiltersCount.value)
})
</script>