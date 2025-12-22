<template lang="pug">
.product-stock-favorites
  .flex.flex-wrap.gap-2.items-center
    //- Чипс "Только в наличии"
    label.btn.cursor-pointer.inline-flex.items-center(
      :class="localOnlyInStock ? 'bg-success text-success-content' : 'bg-gray-400 text-base-100'"
      class="px-3 py-1 rounded-xl border text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm"
    )
      input.hidden(
        type="checkbox"
        :checked="localOnlyInStock"
        @change="updateOnlyInStock($event.target.checked)"
      )
      span.text-base-200.whitespace-nowrap в наличии

    //- Чипс "Только избранное"
    label.btn.btn-primary.cursor-pointer.inline-flex.items-center(
      :class="localOnlyFavorites ? 'bg-warning text-warning-content' : 'bg-gray-400 text-base-100'"
      class="px-3 py-1 rounded-xl border text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm"
    )
      input.hidden(
        type="checkbox"
        :checked="localOnlyFavorites"
        @change="updateOnlyFavorites($event.target.checked)"
      )
      span.whitespace-nowrap избранное
      span ({{ app.favoritesCount }})
</template>

<script setup>
// Используем единый useAppState
const app = useAppState()

const props = defineProps({
  onlyInStock: {
    type: Boolean,
    default: false
  },
  onlyFavorites: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:onlyInStock',
  'update:onlyFavorites',
  'view-favorites',
  'clear-favorites'
])

// Локальные состояния
const localOnlyInStock = computed(() => props.onlyInStock)
const localOnlyFavorites = computed(() => props.onlyFavorites)

// Методы обновления
const updateOnlyInStock = (value) => {
  emit('update:onlyInStock', value)
}

const updateOnlyFavorites = (value) => {
  emit('update:onlyFavorites', value)
}

// Показать все избранные товары
const viewAllFavorites = () => {
  console.log('🔍 Показать все избранные товары')
  emit('update:onlyFavorites', true)
  emit('view-favorites')
  app.addNotification(`Показаны ${app.favoritesCount} избранных товаров`, 'info')
}

// Очистить все избранные товары
const clearAllFavorites = () => {
  if (app.favoritesCount === 0) {
    app.addNotification('Нет избранных товаров для очистки', 'warning')
    return
  }

  console.log('🗑️ Очистка всех избранных товаров')
  
  // Используем глобальную функцию очистки избранного
  app.clearAllFavorites()
  
  // Выключаем фильтр "Только избранное"
  emit('update:onlyFavorites', false)
  emit('clear-favorites')
}

// Сброс фильтров наличия и избранного
const resetStockFavorites = () => {
  emit('update:onlyInStock', false)
  emit('update:onlyFavorites', false)
}

defineExpose({
  resetStockFavorites,
  viewAllFavorites,
  clearAllFavorites
})
</script>

<style scoped>
.chip {
  transition: all 0.2s ease-in-out;
}

.chip:hover {
  transform: translateY(-1px);
}

.favorites-actions {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-xs {
  padding: 0;
  font-size: 0.5rem;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .chip {
    font-size: 0.5rem;
  }
}
</style>