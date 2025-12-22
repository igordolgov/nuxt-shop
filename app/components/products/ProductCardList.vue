<!-- app\components\products\ProductCardList.vue -->
<template lang="pug">
.card.product-card-list.bg-base-100.shadow-lg.transition-all.duration-500.relative.group.overflow-hidden.rounded-xl.border(
  class="border-secondary/60",
  :class="{ 'has-search-highlight': hasSearchHighlight }"
)
  //- Кнопка избранного
  button(
    class="absolute top-1 left-1 z-10 btn btn-circle btn-xs transition-all duration-300 hover:scale-110",
    :class="isFavorite ? 'btn-error' : ''",
    @click="toggleFavorite",
    title="Добавить в избранное"
  )
    svg.w-4.h-4.transition-all.duration-300(
      :class="isFavorite ? 'fill-current scale-110' : 'fill-none stroke-secondary hover:scale-110'",
      xmlns="http://www.w3.org/2000/svg",
      viewBox="0 0 24 24",
      stroke-width="2"
    )
      path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")

  //- Контент карточки
  .card-content
    NuxtLink.flex.flex-row.items-center.gap-4.p-2(
      :to="`/product/${product.id}`",
      class="group-hover:bg-base-200/50"
    )
      div
        //- Фиксированная ширина изображения
        figure.overflow-hidden.rounded-xl.flex-shrink-0
          img(
            class="h-24 w-24 object-cover transition-transform duration-700 group-hover:scale-110",
            :src="getSafeImage(product.image)",
            :alt="product.name",
            @error="handleImageError"
          )
            //- Цена
        .pt-3
          .text-lg.font-bold.text-sky-600.transition-all.duration-300(
            v-if="product.inStock"
            class="group-hover:scale-105 text-base md:text-xl"
          ) {{ formatPrice(product.price) }} ₽
          .text-md.text-error.transition-all.duration-300(
            v-else
            class="group-hover:scale-105"
          ) нет в наличии
      .flex-1.min-w-0
        //- Название товара с подсветкой
        h2(
          class="card-title text-base-content transition-colors duration-300 group-hover:text-primary line-clamp-2 min-h-[2rem] leading-tight mb-1 text-md md:text-base"
        )
          template(v-if="!queryValidForHighlight")
            | {{ product.name }}
          template(v-else-if="nameHasHighlight")
            span(v-html="highlightedName")
          template(v-else)
            | {{ product.name }}
        
        //- Описание товара с уменьшенным шрифтом на мобильных и подсветкой
        p(
          class="text-secondary transition-colors duration-300 group-hover:text-base-content/80 line-clamp-3 min-h-[2rem] leading-snug mb-2 text-xs md:text-sm"
        )
          template(v-if="!queryValidForHighlight")
            | {{ product.description }}
          template(v-else-if="descriptionHasHighlight")
            span(v-html="highlightedDescription")
          template(v-else)
            | {{ product.description }}
        
        //- Бейджи категорий в две строки с подсветкой
        .flex.flex-wrap.gap-1.max-h-10.overflow-hidden
          span.badge.bg-gray-600.text-white.badge-xs.rounded-sm.transition-all.duration-300(
            class="hover:opacity-100 hover:badge-primary mb-1",
            v-for="category in displayedCategories",
            :key="category",
            :class="{ 'badge-highlight': queryValidForHighlight && categoryHasHighlight(category) }"
          )
            template(v-if="!queryValidForHighlight")
              | {{ category }}
            template(v-else-if="categoryHasHighlight(category)")
              span(v-html="highlightedCategory(category)")
            template(v-else)
              | {{ category }}
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSearchHighlight } from '@/composables/useSearchHighlight'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

// Используем единый useAppState
const app = useAppState()
const { $notify } = useNuxtApp()
const { getSafeImage, formatPrice, handleImageError } = useProductUtils()

// Используем композабл для подсветки (не импортируем isQueryValidForHighlight, чтобы избежать конфликта)
const { highlightText, highlightBadge, containsQuery } = useSearchHighlight()

// Проверяем, достаточно ли длинный запрос для подсветки
const queryValidForHighlight = computed(() => {
  return props.searchQuery && props.searchQuery.trim().length >= 2
})

// Функция для подсветки категорий
const highlightedCategory = (category) => {
  return highlightBadge(category, props.searchQuery)
}

// Проверяем, есть ли подсветка в категории
const categoryHasHighlight = (category) => {
  return queryValidForHighlight.value && containsQuery(category, props.searchQuery)
}

// Подсвеченные тексты
const highlightedName = computed(() => {
  if (!queryValidForHighlight.value || !props.product?.name) return ''
  return highlightText(props.product.name, props.searchQuery)
})

const highlightedDescription = computed(() => {
  if (!queryValidForHighlight.value || !props.product?.description) return ''
  return highlightText(props.product.description, props.searchQuery)
})

// Проверяем, есть ли подсветка
const nameHasHighlight = computed(() => {
  return queryValidForHighlight.value && containsQuery(props.product.name, props.searchQuery)
})

const descriptionHasHighlight = computed(() => {
  return queryValidForHighlight.value && containsQuery(props.product.description, props.searchQuery)
})

// Проверяем, нужно ли подсвечивать карточку
const hasSearchHighlight = computed(() => {
  if (!queryValidForHighlight.value) return false
  
  // Проверяем имя и описание
  if (nameHasHighlight.value || descriptionHasHighlight.value) {
    return true
  }
  
  // Проверяем категории
  const categories = props.product.categories || []
  return categories.some(category => categoryHasHighlight(category))
})

// Следим за изменениями searchQuery
watch(() => props.searchQuery, (newQuery) => {
  console.log('🔄 ProductCardList searchQuery:', newQuery, 
    'valid for highlight:', queryValidForHighlight.value,
    'nameHasHighlight:', nameHasHighlight.value,
    'descriptionHasHighlight:', descriptionHasHighlight.value)
})

// Ограничиваем количество отображаемых категорий для компактности
const displayedCategories = computed(() => {
  const categories = props.product.categories || []
  return categories.slice(0, 4) // Показываем максимум 4 категории
})

// Вычисляемое свойство для избранного
const isFavorite = computed(() => {
  return app.isFavorite(props.product.id)
})

// Обработчик избранного
const toggleFavorite = () => {
  app.toggleFavorite(props.product.id)
}
</script>

<style scoped>
.btn-error {
  background: oklch(55% 0.2 40);
}

/* Стили для подсветки поиска */
:deep(.search-highlight) {
  background-color: #ffeb3b !important;
  border-radius: 2px !important;
  color: #000 !important;
}

/* Стили для подсветки в бейджах */
:deep(.badge-highlight) {
  background-color: #ffeb3b !important;
  color: #000 !important;
}

:deep(.badge-highlight .search-highlight) {
  background-color: #ff5722 !important;
  color: white !important;
}

/* Стиль карточки с подсветкой */
.has-search-highlight {
  border-left-color: #ffeb3b !important;
  border-left-width: 3px !important;
}

/* Улучшения для мобильных устройств */
@media (max-width: 768px) {
  .product-card-list {
    margin-bottom: 0.5rem;
  }
  
  /* Убеждаемся, что изображение имеет фиксированную ширину */
  figure {
    width: 6rem !important;
    height: 6rem !important;
  }
  
  /* Уменьшаем отступы на мобильных */
  .card-content {
    padding: 0.5rem;
  }
  
  /* Уменьшаем шрифт описания */
  .text-xs {
    font-size: 0.9rem;
    line-height: 1.2;
  }
  
  /* Компактные бейджи */
  .badge-xs {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
    height: auto;
    line-height: 1;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 380px) {
  figure {
    width: 5rem !important;
    height: 5rem !important;
  }
  
  .gap-4 {
    gap: 0.75rem;
  }
}

/* Обеспечиваем перенос бейджей на две строки */
.flex-wrap {
  flex-wrap: wrap;
}

.max-h-10 {
  max-height: 2.5rem;
}
</style>