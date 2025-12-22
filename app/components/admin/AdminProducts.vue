<!-- app\components\AdminProducts.vue -->
<template lang="pug">
.admin-page.min-h-screen.bg-base-100
  Header

  //- Фиксированная верхняя панель под хедером
  .admin-header.mb-3.bg-base-100.border-b.border-base-300.shadow-sm
    div(class="container mx-auto max-w-7xl p-2 sm:p-4")
      div(class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4")
        //- Левая часть: заголовок и статистика - компактно на мобильных
        div(class="flex items-center justify-between gap-2 flex-shrink-0")
          .flex.items-center.gap-2
            div(class="w-7 h-7 rounded-lg bg-primary text-primary-content flex items-center justify-center")
              svg(class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24")
                path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z")
                path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z")
            div
              h1(class="text-lg sm:text-xl font-bold") Админпанель
              div(class="text-xs text-base-content opacity-70")
                span(class="hidden sm:inline") Показано: 
                | {{ shownCount }}/{{ productsCount }}
        
          //- Кнопки действий - скрыты на десктопе, видны на мобильных
          div(class="flex sm:hidden items-center gap-1")
            button.btn.btn-xs.btn-square.btn-primary(@click="showAddModal = true" title="Добавить")
              svg.w-3.h-3(fill="none" stroke="currentColor" viewBox="0 0 24 24")
                path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4")
            button.btn.btn-xs.btn-square.btn-secondary(@click="refreshData" title="Обновить")
              svg.w-3.h-3(fill="none" stroke="currentColor" viewBox="0 0 24 24")
                path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15")

        //- Центр: поиск и фильтры - вертикально на мобильных
        div(class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 relative")
          //- Поиск - полная ширина
          div(class="form-control w-full sm:flex-1 sm:max-w-md")
            .join.w-full
              input(class="input input-bordered input-xs sm:input-sm join-item w-full rounded-md border-base-content/50" type="text" placeholder="Поиск товаров..." v-model="adminSearchQuery" @input="handleAdminSearch")
              button.btn.btn-xs.btn-ghost.join-item(class="sm:btn-sm" @click="clearAdminSearch" :disabled="!adminSearchQuery")
                svg(class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12")

          //- Компактные фильтры - горизонтальный скролл на мобильных
          div(class="flex items-center gap-2 flex-shrink-0 pb-1 sm:pb-0 relative z-10")
            //- Категории
            .dropdown.dropdown-start
              button.btn.btn-xs.btn-primary.gap-0.relative(
                @click="handleCategoryButtonClick"
                ref="categoryButtonRef"
                class="sm:btn-sm"
                :class="{ 'btn-active': showCategoryDropdown }"
              )
                span.text-xs 📂
                span(class="hidden sm:inline text-xs") Кат.
                span.badge.badge-xs.badge-primary.absolute.-top-1.-right-1(v-if="selectedCategories.length > 0") {{ selectedCategories.length }}
            
            //- Статус фильтры
            div(class="join join-xs sm:join-sm")
              button.btn.btn-xs.btn-outline.border-stone-600.join-item(
                v-for="filter in statusFilters"
                :key="filter.value"
                :class="currentFilter === filter.value ? 'bg-primary text-primary-content' : ''"
                class="sm:btn-sm"
                @click="setFilter(filter.value)"
                :title="filter.label"
              ) {{ filter.icon }}

            //- Сортировка
            .dropdown.dropdown-end
              button.btn.btn-xs.btn-primary.border-stone-600.gap-1.relative(
                @click="handleSortButtonClick"
                ref="sortButtonRef"
                class="sm:btn-sm"
                :class="{ 'btn-active': showSortDropdown }"
              )
                span.text-xs ↕️
                span(class="hidden sm:inline text-xs") {{ getSortButtonTextMobile() }}

        //- Правая часть: действия - скрыта на мобильных
        div(class="hidden sm:flex items-center gap-2 flex-shrink-0")
          button.btn.btn-sm.btn-square.text.btn-secondary(@click="refreshData" title="Обновить")
            svg.w-4.h-4(fill="none" stroke="currentColor" viewBox="0 0 24 24")
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15")

          button.btn.btn-sm.btn-square.text.btn-secondary(@click="exportData" title="Экспорт")
            svg.w-4.h-4(fill="none" stroke="currentColor" viewBox="0 0 24 24")
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10")

          button.btn.btn-sm.btn-primary(@click="showAddModal = true" title="Добавить товар")
            svg.w-4.h-4(fill="none" stroke="currentColor" viewBox="0 0 24 24")
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4")

  //- Основное содержимое
  .admin-content.mt-14.container.mx-auto.max-w-8xl.p-2(class="sm:p-4")
    .card.bg-base-100.shadow-lg
      .card-body.p-0
        //- Загрузка
        div(class="p-6 sm:p-8 text-center" v-if="isLoading")
          div(class="loading loading-spinner loading-md sm:loading-lg text-primary")
          p(class="mt-4 text-sm sm:text-base text-base-content opacity-70") Загрузка товаров...

        //- Таблица - горизонтальный скролл на мобильных
        .overflow-x-auto(v-else-if="safeProducts.length > 0")
          table(class="table table-zebra table-xs sm:table-sm min-w-[640px] sm:min-w-0")
            thead
              tr.text-base-content.border-b(class="border-secondary/50")
                th(class="w-10 sm:w-12 hidden sm:table-cell") ID
                th(class="w-12 sm:w-16") Фото
                th Название
                th(class="w-14 sm:w-16 text-center") Цена
                th(class="w-24 sm:w-32 xs:table-cell") Категории
                th(class="w-18 sm:w-20") Статус
                th(class="w-24 sm:w-28") Действия
            tbody
              tr(v-for="product in sortedProducts" :key="product.id")
                td(class="hidden sm:table-cell")
                  .font-mono.text-xs.opacity-70 {{ getSafeId(product.id) }}
                td
                  .avatar
                    div(class="mask mask-squircle w-7 h-7 sm:w-9 sm:h-9")
                      img(:src="getSafeImage(product.image)" :alt="product.name")
                td
                  div(class="font-medium text-xs sm:text-sm" v-html="highlightSearch(product.name)")
                  .text-sm.opacity-70.line-clamp-1 {{ product.description }}
                td.text-right
                  div(class="font-bold text-sm sm:text-base px-6") {{ formatPrice(product.price) }}₽
                td(class="xs:table-cell")
                  .flex.flex-wrap.gap-1
                    span.text-xs.px-1.border.rounded-sm(
                      v-for="category in getSafeCategories(product.categories)" 
                      :key="category"
                      class="text-secondary/80"
                    ) {{ category }}
                td
                  div(class="badge badge-xs sm:badge-sm min-w-8 sm:min-w-10 rounded-sm text-xs sm:text-md font-bold" :class="product.inStock ? 'badge-success' : 'badge-error'")
                    | {{ product.inStock ? product.stockQuantity : 'Нет' }}
                td
                  .flex.gap-1
                    button(class="btn btn-xs sm:btn-sm p-1 sm:p-2 btn-secondary" @click="editProduct(product)" title="Редактировать")
                      svg(class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24")
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z")
                    button(class="btn btn-xs sm:btn-sm p-1 sm:p-2 btn-error text-base-content" @click="handleDeleteProduct(product)" title="Удалить")
                      svg(class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24")
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16")

        //- Пустое состояние
        div(class="text-center p-6 sm:py-12" v-else)
          div(class="text-3xl sm:text-4xl mb-4 opacity-30") 📦
          h3(class="text-base sm:text-lg font-semibold mb-2") Товары не найдены
          p(class="text-sm opacity-70 mb-4") Добавьте первый товар или измените фильтры
          button.btn.btn-primary.btn-sm(@click="refreshProducts") Обновить

        //- Статистика внизу - компактнее на мобильных
        div(class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-base-200" v-if="!isLoading && safeProducts.length > 0")
          div(class="flex flex-wrap items-center gap-2 sm:gap-4 text-sm mb-2 sm:mb-0")
            .text-xs.opacity-70 {{ productsCount }} всего
            div(class="badge badge-xs sm:badge-sm badge-success rounded-sm") {{ inStockCount }} в наличии
            div(class="badge badge-xs sm:badge-sm badge-error rounded-sm") {{ outOfStockCount }} нет
          .text-xs.opacity-70 Обновлено: {{ new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) }}

    //- Модальные окна
    AdminAddProductModal(
      v-model:isOpen="showAddModal"
      @productAdded="handleProductAdded"
      :allCategories="safeCategories"
    )
    AdminEditProductModal(
      v-model:isOpen="showEditModal"
      :product="currentEditProduct"
      @productUpdated="handleProductUpdated"
      :allCategories="safeCategories"
    )

  //- Добавляем кнопку прокрутки в конец компонента
  ClientOnly
    ScrollToTop

  //- Выпадающие меню через Teleport в body
  ClientOnly
    Teleport(to="body")
      //- Выпадающее меню категорий
      .dropdown-category-portal(v-if="showCategoryDropdown && categoryButtonRef")
        .dropdown-content.menu.p-2.shadow.rounded-box.w-64.mt-1(
          class="z-[9999]"
          :style="categoryDropdownStyle"
          ref="categoryDropdownRef"
        )
          div(class="overflow-y-auto max-h-60")
            .space-y-0
              label.cursor-pointer.label.justify-start.p-1(
                v-for="category in availableCategories" 
                :key="category"
              )
                input.checkbox.checkbox-xs.mr-0.rounded-sm(
                  class="border-base-content/50"
                  type="checkbox" 
                  :value="category"
                  v-model="selectedCategories"
                  @click.stop
                )
                span.label-text.text-base-content.text-xs {{ category }}
            .divider.my-2
            .flex.gap-2.p-2
              button.btn.btn-xs.btn-outline.btn-sm.flex-1(@click.stop="selectAllCategories") Все
              button.btn.btn-xs.btn-outline.btn-sm.flex-1(@click.stop="clearCategories") Очистить

      //- Выпадающее меню сортировки
      .dropdown-sort-portal(v-if="showSortDropdown && sortButtonRef")
        ul.dropdown-content.menu.p-2.shadow.rounded-box.w-32.mt-1(
          class="z-[9999]"
          :style="sortDropdownStyle"
          ref="sortDropdownRef"
        )
          li.menu-title
            span.text-xs Сортировка
          li(v-for="sortOption in sortOptions" :key="sortOption.field")
            a.text-xs(
              @click.stop="toggleSort(sortOption.field)" 
              :class="sortField === sortOption.field ? 'active' : ''"
            )
              | {{ sortOption.label }}
              span.ml-auto.text-xs(v-if="sortField === sortOption.field")
                | {{ sortDirection === 'asc' ? '↑' : '↓' }}
</template>

<style scoped>
.admin-header {
  position: fixed;
  top: 3rem;
  left: 0;
  right: 0;
  z-index: 40;
}

.admin-content {
  min-height: calc(100dvh - 8rem);
}

.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.table {
  font-size: 0.75rem;
}

.table th {
  background: hsl(var(--b2));
  font-weight: 600;
  padding: 0.5rem;
}

.table td {
  padding: 0.5rem;
  vertical-align: middle;
}

:deep(mark.bg-yellow-200) {
  background-color: rgb(240, 206, 72) !important;
  color: black;
  padding: 0;
  border-radius: 0.25rem;
}

/* Мобильные стили */
@media (max-width: 640px) {
  .admin-header {
    position: static;
  }
  
  .table {
    font-size: 0.7rem;
  }
  
  .table td, .table th {
    padding: 0.375rem 0.25rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .admin-header .container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .admin-header .flex-1 {
    width: 100%;
  }
}

/* Адаптивные стили для таблицы */
@media (max-width: 480px) {
  .table td:nth-child(4),
  .table th:nth-child(4) {
    font-size: 0.7rem;
  }
  
  .table td:nth-child(6),
  .table th:nth-child(6) {
    padding-left: 0.125rem;
    padding-right: 0.125rem;
  }
}

/* Улучшение скролла на мобильных */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* Скрытие лишних элементов на очень маленьких экранах */
@media (max-width: 360px) {
  .admin-header .btn span:not(.badge) {
    display: none;
  }
  
  .admin-header .btn {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
  }
}
</style>

<style>
/* Глобальные стили для порталов */
.dropdown-category-portal,
.dropdown-sort-portal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
}

.dropdown-category-portal .dropdown-content,
.dropdown-sort-portal .dropdown-content {
  position: absolute;
  animation: dropdownFade 0.2s ease-out;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid hsl(var(--b3));
  background-color: hsl(var(--b1)) !important;
  opacity: 1 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  color: hsl(var(--bc));
}

.dropdown-category-portal .dropdown-content *,
.dropdown-sort-portal .dropdown-content * {
  background-color: transparent !important;
}

.dropdown-category-portal .dropdown-content .menu-title,
.dropdown-sort-portal .dropdown-content .menu-title {
  background-color: hsl(var(--b2)) !important;
}

.dropdown-category-portal .dropdown-content li a,
.dropdown-sort-portal .dropdown-content li a {
  background-color: transparent !important;
}

.dropdown-category-portal .dropdown-content li a:hover,
.dropdown-sort-portal .dropdown-content li a:hover {
  background-color: hsl(var(--b3)) !important;
}

.dropdown-category-portal .dropdown-content li a.active,
.dropdown-sort-portal .dropdown-content li a.active {
  background-color: hsl(var(--p)) !important;
  color: hsl(var(--pc)) !important;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
import Header from '../layout/Header.vue'
import ScrollToTop from '../ScrollToTop.vue'
import { onClickOutside } from '@vueuse/core'

// Используем глобальный composable для состояния
const {
  products,
  categories,
  isLoading,
  loadProducts,
  deleteProduct,
  initializeApp
} = useAppState()

// Получаем notify из NuxtApp
const { $notify } = useNuxtApp()

// Загружаем товары при монтировании
onMounted(async () => {
  await initializeApp()
})

// Состояние админки
const showAddModal = ref(false)
const showEditModal = ref(false)
const currentEditProduct = ref(null)
const currentFilter = ref('all')
const adminSearchQuery = ref('')
const error = ref(null)
const selectedCategories = ref([])
const sortField = ref('createdAt')
const sortDirection = ref('desc')

// Состояние для выпадающих меню
const showCategoryDropdown = ref(false)
const showSortDropdown = ref(false)

// Refs для позиционирования
const categoryButtonRef = ref(null)
const sortButtonRef = ref(null)
const categoryDropdownRef = ref(null)
const sortDropdownRef = ref(null)

const sortOptions = [
  { field: 'createdAt', label: 'Дата' },
  { field: 'name', label: 'Название' },
  { field: 'price', label: 'Цена' },
  { field: 'stockQuantity', label: 'Кол-во' }
]

const statusFilters = [
  { value: 'all', label: 'Все', icon: '📦' },
  { value: 'inStock', label: 'В наличии', icon: '✅' },
  { value: 'outOfStock', label: 'Не в наличии', icon: '❌' },
  { value: 'favorites', label: 'Избранные', icon: '❤️' }
]

// Computed свойства
const availableCategories = computed(() => {
  const allCategories = new Set()
  safeProducts.value.forEach(product => {
    if (product.categories) {
      product.categories.forEach(category => allCategories.add(category))
    }
  })
  return Array.from(allCategories).sort()
})

// Позиционирование выпадающих меню
const categoryDropdownStyle = computed(() => {
  if (!categoryButtonRef.value || typeof window === 'undefined') return {}
  
  const rect = categoryButtonRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    position: 'fixed',
    backgroundColor: 'hsl(var(--b1))',
    backgroundImage: 'none'
  }
})

const sortDropdownStyle = computed(() => {
  if (!sortButtonRef.value || typeof window === 'undefined') return {}
  
  const rect = sortButtonRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.right - 128}px`, // 128px = ширина меню
    position: 'fixed',
    backgroundColor: 'hsl(var(--b1))',
    backgroundImage: 'none'
  }
})

const safeCategories = computed(() => categories.value || [])
const safeProducts = computed(() => products.value || [])
const productsCount = computed(() => safeProducts.value.length)
const inStockCount = computed(() => safeProducts.value.filter(p => p.inStock).length)
const outOfStockCount = computed(() => safeProducts.value.filter(p => !p.inStock).length)
const shownCount = computed(() => sortedProducts.value.length)

// Методы работы с dropdown
const handleCategoryButtonClick = (event) => {
  event.stopPropagation()
  showCategoryDropdown.value = !showCategoryDropdown.value
  if (showCategoryDropdown.value) {
    showSortDropdown.value = false
  }
}

const handleSortButtonClick = (event) => {
  event.stopPropagation()
  showSortDropdown.value = !showSortDropdown.value
  if (showSortDropdown.value) {
    showCategoryDropdown.value = false
  }
}

// Методы работы с категориями
const selectAllCategories = () => {
  selectedCategories.value = [...availableCategories.value]
}

const clearCategories = () => {
  selectedCategories.value = []
}

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  showSortDropdown.value = false
}

// Текст для кнопки сортировки (мобильная версия)
const getSortButtonTextMobile = () => {
  const option = sortOptions.find(opt => opt.field === sortField.value)
  if (!option) return ''
  
  const direction = sortDirection.value === 'asc' ? '↑' : '↓'
  // Сокращаем для мобильных
  const shortLabel = option.label === 'Кол-во' ? 'Кол-во' : 
                    option.label === 'Название' ? 'Назв.' : 
                    option.label
  return `${shortLabel} ${direction}`
}

// Отфильтрованные товары
const filteredProducts = computed(() => {
  let filtered = [...safeProducts.value]
  
  switch (currentFilter.value) {
    case 'inStock':
      filtered = filtered.filter(p => p.inStock)
      break
    case 'outOfStock':
      filtered = filtered.filter(p => !p.inStock)
      break
    case 'favorites':
      filtered = filtered.filter(p => p.isFavorite)
      break
    case 'all':
    default:
      break
  }
  
  if (adminSearchQuery.value.trim()) {
    const query = adminSearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query) || false
      const descMatch = product.description?.toLowerCase().includes(query) || false
      const categoryMatch = product.categories?.some(cat => 
        cat.toLowerCase().includes(query)
      ) || false
      
      return nameMatch || descMatch || categoryMatch
    })
  }
  
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(product => 
      product.categories?.some(category => 
        selectedCategories.value.includes(category)
      )
    )
  }
  
  return filtered
})

// Сортировка товаров
const sortedProducts = computed(() => {
  const productsToSort = [...filteredProducts.value]
  
  if (!sortField.value) return productsToSort
  
  return productsToSort.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    switch (sortField.value) {
      case 'name':
        aValue = (aValue || '').toLowerCase()
        bValue = (bValue || '').toLowerCase()
        break
      case 'price':
      case 'stockQuantity':
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
        break
      case 'inStock':
        aValue = aValue ? 1 : 0
        bValue = bValue ? 1 : 0
        break
      case 'createdAt':
        aValue = getProductTimestamp(a)
        bValue = getProductTimestamp(b)
        break
    }
    
    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })
})

// Вспомогательные функции
const getProductTimestamp = (product) => {
  if (product.createdAt) {
    return new Date(product.createdAt).getTime()
  }
  return Number(product.id) || 0
}

const highlightSearch = (text) => {
  if (!adminSearchQuery.value.trim() || !text) return text
  
  const query = adminSearchQuery.value.trim()
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.toString().replace(regex, '<mark class="bg-yellow-200 text-base-content px-1 rounded">$1</mark>')
}

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const getSafeImage = (imageUrl) => {
  if (!imageUrl || imageUrl.includes('placeholder.com') || imageUrl.includes('via.placeholder.com')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5YTlhOWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OTzwvdGV4dD48L3N2Zz4='
  }
  return imageUrl
}

const getSafeId = (id) => {
  if (!id) return 'N/A'
  const idString = String(id)
  return idString.slice(-4)
}

const getSafeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return []
  }
  return categories.slice(0, 2)
}

// Методы с обновленными notify уведомлениями
const setFilter = (filter) => {
  currentFilter.value = filter
}

const handleAdminSearch = () => {
  // Поиск работает через computed свойство filteredProducts
}

const clearAdminSearch = () => {
  adminSearchQuery.value = ''
}

const refreshData = async () => {
  try {
    await loadProducts()
    $notify.success('Данные обновлены')
  } catch (err) {
    error.value = err.message
    $notify.error('Ошибка обновления')
  }
}

const editProduct = (product) => {
  currentEditProduct.value = { ...product }
  showEditModal.value = true
}

const handleDeleteProduct = async (product) => {
  if (!confirm(`Удалить "${product.name}"?`)) return
  
  try {
    const success = await deleteProduct(product.id)
    if (success) {
      $notify.success(`"${product.name}" удален`)
    } else {
      $notify.error('Ошибка удаления')
    }
  } catch (err) {
    error.value = err.message
    $notify.error('Ошибка удаления')
  }
}

const exportData = () => {
  const dataStr = JSON.stringify(safeProducts.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `products-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  $notify.success('Данные экспортированы')
}

// Обработка добавления нового товара
const handleProductAdded = async (newProduct) => {
  showAddModal.value = false
  
  // Принудительно обновляем список товаров из базы данных
  await loadProducts(true)
  $notify.success(`Товар "${newProduct.name}" успешно добавлен`)
}

// Обработка обновления товара
const handleProductUpdated = async (updatedProduct) => {
  showEditModal.value = false
  currentEditProduct.value = null
  
  // Принудительно обновляем список товаров из базы данных
  await loadProducts(true)
  $notify.success(`Товар "${updatedProduct.name}" успешно обновлен`)
}

const refreshProducts = async () => {
  try {
    await loadProducts()
    $notify.success('Товары обновлены')
  } catch (error) {
    $notify.error('Ошибка обновления')
  }
}

// Закрытие dropdown при клике вне
onClickOutside(categoryDropdownRef, () => {
  if (showCategoryDropdown.value) {
    showCategoryDropdown.value = false
  }
})

onClickOutside(sortDropdownRef, () => {
  if (showSortDropdown.value) {
    showSortDropdown.value = false
  }
})

// Глобальный обработчик клика для закрытия dropdown
onMounted(() => {
  document.addEventListener('click', () => {
    if (showCategoryDropdown.value) {
      showCategoryDropdown.value = false
    }
    if (showSortDropdown.value) {
      showSortDropdown.value = false
    }
  })
})
</script>