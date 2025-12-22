<!-- ProductCategories.vue -->
<template lang="pug">
.product-categories.pb-2(class="lg:mr-3")
  .section-header.flex.items-center.justify-between.mb-1.bg-base-100.sticky.-top-2.h-8
    h4.section-title.text-sm.pb-0.min-h-6.text-base-content Категории:
    .flex.items-center.gap-2
      button.btn.btn-xs.btn-primary(
        @click="selectAllCategories"
        v-if="localSelectedCategories.length > 0"
      ) Выбраны: {{ localSelectedCategories.length }}
      button.btn.btn-xs.btn-secondary.animate-pulse(
        @click="clearCategories" 
        v-if="localSelectedCategories.length > 0"
      ) Показать все

  .categories-container
    .flex.flex-wrap.gap-1(v-if="availableCategories.length > 0")
      label.category-item.cursor-pointer.inline-flex.items-center(
        v-for="category in sortedCategories"
        :key="category"
        :class="isSelected(category) ? 'bg-primary text-primary-content border-primary' : 'bg-base-200 border-base-content/40'"
        class="px-2 py-1 rounded-full border text-xs hover:bg-primary/40"
      )
        input.hidden(
          type="checkbox"
          :value="category"
          v-model="localSelectedCategories"
        )
        span.whitespace-nowrap(v-html="highlightSearchText(category)")

    .empty-state.text-center.py-6(v-else)
      .text-4xl.mb-2.opacity-30 📂
      .text-sm.text-base-content.opacity-70 Категории не найдены
</template>

<script setup>
// Используем единый useAppState
const app = useAppState()

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:selectedCategories'
])

// Локальное состояние для выбранных категорий
const localSelectedCategories = computed({
  get: () => props.selectedCategories || [],
  set: (value) => {
    console.log('🔄 Выбраны категории:', value)
    emit('update:selectedCategories', value)
  }
})

// Сортировка категорий для максимальной компактности
const sortedCategories = computed(() => {
  const categories = [...(props.categories || [])]
  
  // Сначала сортируем по длине (короткие -> длинные)
  return categories.sort((a, b) => {
    // Сравниваем по длине
    if (a.length !== b.length) {
      return a.length - b.length
    }
    // Если длина одинаковая, сортируем по алфавиту
    return a.localeCompare(b)
  })
})

// Доступные категории (для обратной совместимости)
const availableCategories = computed(() => sortedCategories.value)

// Проверка выбрана ли категория
const isSelected = (category) => {
  return localSelectedCategories.value.includes(category)
}

// Функция для подсветки текста поиска
const highlightSearchText = (text) => {
  if (!props.searchQuery || !text) return text
  
  const searchRegex = new RegExp(`(${escapeRegex(props.searchQuery)})`, 'gi')
  return text.replace(searchRegex, '<mark class="search-highlight">$1</mark>')
}

// Экранирование специальных символов для regex
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Выбрать все категории
const selectAllCategories = () => {
  localSelectedCategories.value = [...sortedCategories.value]
}

// Очистить все категории
const clearCategories = () => {
  localSelectedCategories.value = []
}

// Сброс категорий (для родительского компонента)
const resetCategories = () => {
  clearCategories()
}

// Логирование для отладки
onMounted(() => {
  console.log('📂 ProductCategories mounted')
  console.log('📂 Категории из props:', props.categories)
  console.log('📂 Отсортированные категории:', sortedCategories.value)
})

watch(() => props.categories, (newCategories) => {
  console.log('📂 Категории обновлены:', newCategories)
  console.log('📂 Отсортированные категории:', sortedCategories.value)
})

defineExpose({
  resetCategories,
  selectAllCategories,
  clearCategories
})
</script>

<style scoped>
.categories-container {
  max-height: 320px;
  overflow-y: auto;
}

/* Улучшение скролла */
.categories-container {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--bc) / 0.3) transparent;
}

.categories-container::-webkit-scrollbar {
  width: 4px;
}

.categories-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 2px;
}

.categories-container::-webkit-scrollbar-thumb {
  background-color: hsl(var(--bc) / 0.3);
  border-radius: 2px;
}

.categories-container::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--bc) / 0.5);
}

/* Анимации для категорий */
.category-item {
  transition: all 0.2s ease-in-out;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .categories-container {
    max-height: 280px;
  }
  
  .category-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>

<style>
/* Глобальные стили для подсветки поиска */
.search-highlight {
  background: linear-gradient(120deg, #ffd05a, #ffe572) !important;
  color: #1f2937 !important;
  border-radius: 3px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}
</style>