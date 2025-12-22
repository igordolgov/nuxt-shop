<!-- app\components\products\ProductCardGrid.vue -->
<template lang="pug">
.card.product-card.p-0.bg-base-100.shadow-xl.transition-all.duration-500.relative.group.overflow-hidden(
  class="border-secondary/60 border rounded-xl"
  :class="{ 'has-search-highlight': hasSearchHighlight }"
)
  //- Кнопка избранного с ClientOnly для избежания hydration mismatch
  ClientOnly
    button(
      class="absolute top-1 left-1 z-10 btn btn-circle btn-xs transition-all duration-300 hover:scale-110",
      :class="isFavorite ? 'btn-error' : ''",
      @click="toggleFavorite",
      title="Добавить в избранное"
    )
      svg.w-3.h-3.transition-all.duration-300(
        :class="isFavorite ? 'fill-current scale-110' : 'fill-none stroke-secondary hover:scale-110'",
        xmlns="http://www.w3.org/2000/svg",
        viewBox="0 0 24 24",
        stroke-width="2"
      )
        path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")

  //- Ссылка на товар (только для изображения и названия)
  .card-content
    NuxtLink.block(:to="`/product/${product.id}`")
      figure.px-2.pt-2.overflow-hidden
        img(
          class="rounded-xl h-32 w-full object-cover transition-transform duration-700 group-hover:scale-110",
          :src="getSafeImage(product.image)",
          :alt="product.name",
          @error="handleImageError"
        )
      .card-body.relative.p-2.bg-base-100.transform.transition-all.duration-500.gap-y-1(
        class="z-[1] group-hover:translate-y-[-10px] pb-0"
      )
        //- Название товара с подсветкой
        h2(
          class="card-title min-h-8 lg:min-h-10 text-base-content transition-colors duration-300 group-hover:text-sky-600 line-clamp-2 leading-tight text-sm lg:text-base"
        )
          template(v-if="!queryValidForHighlight")
            | {{ product.name }}
          template(v-else-if="nameHasHighlight")
            span(v-html="highlightedName")
          template(v-else)
            | {{ product.name }}
        
        //- Описание товара с адаптивным шрифтом и подсветкой
        p(
          class="text-secondary line-clamp-2 leading-snug transition-colors duration-300 group-hover:text-base-content/80 text-xs lg:text-sm"
        )
          template(v-if="!queryValidForHighlight")
            | {{ product.description }}
          template(v-else-if="descriptionHasHighlight")
            span(v-html="highlightedDescription")
          template(v-else)
            | {{ product.description }}
    
    //- Цена и кнопка корзины (вне ссылки)
    .card-actions.justify-between.items-center.mt-0.px-3.pb-2
      .text-lg.font-bold.text-sky-700.transition-all.duration-300(
        v-if="product.inStock"
        class="group-hover:scale-105 text-base lg:text-lg"
      ) {{ formatPrice(product.price) }} ₽
      .text-md.text-error.transition-all.duration-300(
        v-else
        class="group-hover:scale-105"
      ) нет в наличии

  //- Glow эффект
  .absolute.inset-0.rounded-xl(
    class="bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
  )
</template>

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

/* Стиль карточки с подсветкой */
.has-search-highlight {
  border-left-color: #ffeb3b !important;
  border-left-width: 3px !important;
}

.has-search-highlight::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #ffeb3b, transparent);
  z-index: 1;
}

/* Адаптивные стили для мобильных */
@media (max-width: 768px) {
  .product-card {
    margin-bottom: 0rem;
  }
/*   
  .card-body {
    padding: 1rem 0.5rem;
  } */
  
  .line-clamp-2 {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .line-clamp-3 {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}

/* Улучшение читаемости на маленьких экранах */
@media (max-width: 480px) {
  .min-h-\[3rem\] {
    min-height: 2.5rem;
  }
  
  .min-h-\[3.75rem\] {
    min-height: 3rem;
  }
}
</style>

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

// Используем композабл для подсветки
const { highlightText, containsQuery, isQueryValidForHighlight } = useSearchHighlight()

// Проверяем, достаточно ли длинный запрос для подсветки
const queryValidForHighlight = computed(() => {
  return props.searchQuery && props.searchQuery.trim().length >= 2
})

// Вычисляемое свойство для избранного
const isFavorite = computed(() => {
  return app.isFavorite(props.product.id)
})

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
  return nameHasHighlight.value || descriptionHasHighlight.value
})

// Следим за изменениями searchQuery
watch(() => props.searchQuery, (newQuery) => {
  console.log('🔄 ProductCardGrid searchQuery:', newQuery, 
    'valid for highlight:', queryValidForHighlight.value,
    'nameHasHighlight:', nameHasHighlight.value,
    'descriptionHasHighlight:', descriptionHasHighlight.value)
})

// Обработчик избранного
const toggleFavorite = () => {
  app.toggleFavorite(props.product.id)
}
</script>