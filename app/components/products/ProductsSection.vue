<!-- app\components\products\ProductsSection.vue -->
<template lang="pug">
.products-section
  //- Всплывающее уведомление о результатах поиска
  transition(name="fade" appear)
    .search-notification(
      v-if="showNotification && searchQuery && searchQuery.length >= 2"
      :class="{ 'mobile-notification': isMobile }"
    )
      .notification-content
        .alert.bg-info.flex.items-center.justify-between.py-2.px-3
          div.text-white
            span.font-medium Поиск: 
            span "{{ searchQuery }}"
            span.ml-2.text-sm (найдено {{ displayedProductsCount }} товаров)
          button.btn.btn-sm.btn-ghost.btn-circle(@click="hideNotification")
            svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg", fill="none", viewBox="0 0 24 24", stroke="currentColor")
              path(stroke-linecap="round", stroke-linejoin="round", stroke-width="2", d="M6 18L18 6M6 6l12 12")

  .p-2.mb-6(class="sm:mb-0")
    .alert.alert-warning.mb-4(v-if="isLoading")
      .flex.items-center.gap-2
        svg.w-5.h-5.animate-spin(xmlns="http://www.w3.org/2000/svg", fill="none" viewBox="0 0 24 24", stroke="currentColor")
          path(stroke-linecap="round", stroke-linejoin="round", stroke-width="2", d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15")
        span Загрузка товаров...

    //- ДЕСКТОП - СЕТКА
    .desktop-products(v-if="!isMobile && products.length > 0")
      .grid.grid-cols-1(class="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2")
        ProductCard(
          v-for="product in products",
          :key="product.id",
          :product="product",
          :searchQuery="searchQuery"
          viewMode="grid"
          @toggle-favorite="$emit('toggleFavorite', $event)",
          @add-to-cart="$emit('addToCart', $event)"
        )

    //- МОБИЛЬНЫЕ
    .mobile-products(
      v-else-if="isMobile && products.length > 0"
      :class="{ 'horizontal-mode': isHorizontal }"
    )
      //- ВЕРТИКАЛЬНЫЙ РЕЖИМ
      .vertical-layout(v-if="!isHorizontal")
        ProductCard(
          v-for="product in products",
          :key="product.id",
          :product="product",
          :searchQuery="searchQuery"
          viewMode="list"
          @toggle-favorite="$emit('toggleFavorite', $event)",
          @add-to-cart="$emit('addToCart', $event)"
        )
      
      //- ГОРИЗОНТАЛЬНЫЙ РЕЖИМ
      .horizontal-layout(v-else)
        .product-row(
          v-for="(row, rowIndex) in horizontalRows",
          :key="rowIndex"
        )
          ProductCard(
            v-for="product in row",
            :key="product.id",
            :product="product",
            :searchQuery="searchQuery"
            viewMode="list"
            @toggle-favorite="$emit('toggleFavorite', $event)",
            @add-to-cart="$emit('addToCart', $event)"
          )

    //- Нет результатов поиска
    .no-results.text-center.py-8(v-if="!isLoading && products.length === 0 && searchQuery && searchQuery.length >= 2")
      .text-5xl.mb-3 🔍
      h3.text-lg.font-semibold.mb-2 Ничего не найдено
      p.text-base-content.text-opacity-70.mb-4 По запросу "{{ searchQuery }}" товаров не найдено
      button.btn.btn-primary.btn-sm.rounded-md(@click="clearSearch") Очистить поиск

    //- Нет товаров вообще
    .no-products.text-center.py-8(v-if="!isLoading && products.length === 0 && (!searchQuery || searchQuery.length < 2)")
      .text-5xl.mb-3 😔
      h3.text-lg.font-semibold.mb-2 Товары не найдены
      p.text-base-content.text-opacity-70.mb-4 Попробуйте изменить параметры поиска
      button.btn.btn-primary.btn-block.mb-6.rounded-lg(
        @click="$emit('resetFilters')", 
        v-if="activeFiltersCount > 0"
      ) Сбросить фильтры
      button.btn.btn-secondary.btn-sm.rounded-md(@click="$emit('refreshProducts')") Обновить
</template>

<style scoped>
/* Анимация для уведомления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Стили для всплывающего уведомления */
.search-notification {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: auto;
  max-width: 500px;
  animation: slideDown 0.3s ease-out;
}

.search-notification.mobile-notification {
  top: 60px;
  width: 90%;
  max-width: 90%;
}

.notification-content {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Мобильные товары */
.mobile-products {
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: visible;
}

/* Вертикальный режим */
.vertical-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex-direction: column;
  gap: 10px;
  padding-bottom: 0rem;
}

/* Горизонтальный режим */
.horizontal-layout {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  flex-direction: column;
  gap: 10px;
  padding: 0 4px 0 4px;
}

.product-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Для очень маленьких экранов */
@media (max-width: 360px) and (orientation: landscape) {
  .product-row {
    gap: 6px;
  }
  
  .horizontal-layout {
    padding: 0 2px 2rem 2px;
  }
}

/* Глобальные стили для подсветки */
:deep(.search-highlight) {
  background-color: #ffeb3b !important;
  border-radius: 5px !important;
  color: #000 !important;
}

:deep(.badge-highlight) {
  background-color: #ffeb3b !important;
  color: #000 !important;
}

/* SNAP-SCROLL стили для элементов */

/* Вертикальный режим (портрет) - snap по карточкам */
@media (max-width: 1024px) and (orientation: portrait) {
  .vertical-layout > * {
    scroll-snap-align: start;
  }
}

/* Горизонтальный режим (ландшафт) - snap по строкам */
@media (max-width: 1024px) and (orientation: landscape) {
  .horizontal-layout .product-row {
    scroll-snap-align: start;
  }
}

/* Для десктопа - отключаем snap */
@media (min-width: 1025px) {
  .vertical-layout > * {
    scroll-snap-align: none;
  }
  
  .horizontal-layout .product-row {
    scroll-snap-align: none;
  }
}
</style>

<script setup>
import ProductCard from './ProductCard.vue'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  products: Array,
  isLoading: Boolean,
  isMobile: Boolean,
  activeFiltersCount: Number,
  isHorizontal: Boolean,
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'toggleFavorite', 
  'addToCart', 
  'resetFilters', 
  'refreshProducts',
  'clearSearch'
])

// Количество отображаемых товаров
const displayedProductsCount = computed(() => props.products.length)

// Группируем товары по 2 для горизонтального режима
const horizontalRows = computed(() => {
  const rows = []
  for (let i = 0; i < props.products.length; i += 2) {
    rows.push(props.products.slice(i, i + 2))
  }
  return rows
})

// Очистка поиска
const clearSearch = () => {
  emit('clearSearch')
}

// Логика для всплывающего уведомления
const showNotification = ref(false)
let notificationTimeout = null

// Показать уведомление
const showSearchNotification = () => {
  if (props.searchQuery && props.searchQuery.length >= 2 && !props.isLoading) {
    // Скрыть предыдущее уведомление если оно есть
    hideNotification()
    
    // Показать новое уведомление
    showNotification.value = true
    
    // Автоматически скрыть через 3 секунды
    notificationTimeout = setTimeout(() => {
      hideNotification()
    }, 3000)
  }
}

// Скрыть уведомление
const hideNotification = () => {
  showNotification.value = false
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
    notificationTimeout = null
  }
}

// Наблюдатель за загрузкой товаров
watch(() => props.isLoading, (newVal, oldVal) => {
  // Когда загрузка закончилась и есть поисковый запрос
  if (oldVal === true && newVal === false && props.searchQuery && props.searchQuery.length >= 2) {
    showSearchNotification()
  }
})

// Наблюдатель за поисковым запросом
watch(() => props.searchQuery, (newVal, oldVal) => {
  // Если запрос изменился и стал >= 2 символов
  if (newVal && newVal.length >= 2 && newVal !== oldVal) {
    // Если товары уже загружены, показываем уведомление сразу
    if (!props.isLoading) {
      showSearchNotification()
    }
  } else {
    // Если запрос очищен или стал короче 2 символов, скрываем уведомление
    hideNotification()
  }
})

// Скрыть уведомление при размонтировании
import { onUnmounted } from 'vue'
onUnmounted(() => {
  hideNotification()
})
</script>