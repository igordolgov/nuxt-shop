<!-- SmartSearchInput.vue -->
<template lang="pug">
.search-container.border.rounded-lg(
  class="border-secondary/60 w-full",
  ref="searchContainer"
)
  .search-input-wrapper
    .search-icon
      svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z")
    input.search-input(
      :value="localSearchQuery"
      @input="handleInput"
      type="text"
      placeholder="Поиск"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keydown.enter.prevent="handleEnter"
      ref="searchInput"
      class="border-secondary/50"
    )
    .search-actions
      button.clear-btn.btn.btn-ghost.btn-xs(
        v-if="localSearchQuery"
        @click="resetSearch"
        type="button"
      )
        span.text-xl.text-gray-400 ×
    
  transition(name="fade-slide")
    .suggestions-panel.card.compact.bg-base-100.shadow-xl(
      v-if="shouldShowSuggestionsPanel"
      @mousedown.prevent="handlePanelMouseDown"
    )
      .card-body.px-2.py-0.text-white
        .suggestions-content
          .suggestion-item.loading.p-3(v-if="isSearching && !hasInitialResults")
            .loading.loading-spinner.loading-xs
            span Поиск...
          
          template(v-if="hasSuggestions && queryHasMinLength")
            .suggestion-item.py-2(
              v-for="(item, index) in displayedSuggestions"
              :key="item.id"
              :class="{ 'bg-base-300': localActiveSuggestionIndex === index }"
              @mousedown="selectSuggestion(item)"
              @mouseenter="updateActiveIndex(index)"
            )
              .item-details
                .item-nam.font-medium.text-sm(v-html="getHighlightedText(item, 'name')")
                .item-category.text-xs(v-if="item.category" v-html="getHighlightedText(item, 'category')")
                .item-description.text-xs(v-if="item.description" v-html="getHighlightedText(item, 'description')")
          
          .suggestion-item.min-chars.p-3(v-if="localSearchQuery && localSearchQuery.length === 1")
            span.text-gray-400 Введите ещё {{ 2 - localSearchQuery.length }} букву...
          
          .suggestion-item.empty.p-3(v-if="!isSearching && localSearchQuery && localSearchQuery.length >= 2 && !hasSuggestions && hasPerformedSearch")
            span Ничего не найдено для "{{ localSearchQuery }}"
          
          .suggestion-item.initial.p-1(v-if="!localSearchQuery && !hasSuggestions && !isSearching && isPanelForcedOpen")
            span.text-gray-400 Введите название товара...
</template>

<style scoped>
.search-container {
  position: relative;
  width: auto;
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--fallback-b1, oklch(var(--b1)/1));
  border: 1px solid oklch(var(--bc) / 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 36px;
  width: auto;
  flex-shrink: 0;
}

.search-input-wrapper:focus-within {
  border-color: oklch(var(--p)/1);
  box-shadow: 0 0 0 2px oklch(var(--p)/0.1);
  width: auto;
}

.search-icon {
  padding: 0 8px;
  color: oklch(var(--bc)/0.5);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 2px 0;
  font-size: 14px;
  background: transparent;
  color: oklch(var(--bc)/1);
  height: 100%;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.search-input::placeholder {
  color: oklch(var(--bc)/0.5);
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
  flex-shrink: 0;
}

.suggestions-panel {
  position: absolute;
  top: 100%;
  margin-top: 2px;
  z-index: 1000;
  height: auto;
  overflow-y: auto;
  width: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  margin: 0px;
}

.suggestion-item:hover {
  background: oklch(var(--b2)/1);
}

.suggestion-item.loading {
  justify-content: center;
}

.suggestion-item.min-chars {
  justify-content: center;
  cursor: default;
  font-style: italic;
}

.suggestion-item.empty {
  justify-content: center;
  cursor: default;
}

.suggestion-item.initial {
  justify-content: center;
  cursor: default;
}

.item-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Адаптивность для мобильных */
@media (max-width: 640px) {
  .search-container {
    max-width: auto;
  }
  
  .suggestions-panel {
    position: fixed;
    top: 54px;
    left: 6px;
    right: 6px;
    max-height: 70vh;
    margin-top: 0;
  }
}

/* Стили для подсветки через глубокий селектор */
:deep(.search-highlight) {
  background: linear-gradient(120deg, oklch(var(--wa)/0.3), oklch(var(--wa)/0.3));
  border-radius: 2px;
  color: oklch(var(--wa)/1);
}

/* Анимация появления панели */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSearchHighlight } from '@/composables/useSearchHighlight'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  showSuggestions: {
    type: Boolean,
    default: false
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  hasSuggestions: {
    type: Boolean,
    default: false
  },
  totalResults: {
    type: Number,
    default: 0
  },
  activeSuggestionIndex: {
    type: Number,
    default: -1
  },
  isActive: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'suggestionSelected',
  'performSearch',
  'resetSearch',
  'update:activeSuggestionIndex',
  'update:showSuggestions',
  'search',
  'selectProduct'
])

// Используем композабл для подсветки
const { highlightText } = useSearchHighlight()

const searchInput = ref(null)
const searchContainer = ref(null)

// Локальное состояние для реактивности
const localSearchQuery = ref(props.searchQuery)
const localShowSuggestions = ref(props.showSuggestions)
const localActiveSuggestionIndex = ref(props.activeSuggestionIndex)
const hasInitialResults = ref(false)
const hasPerformedSearch = ref(false)
const isPanelForcedOpen = ref(false)
const isInputFocused = ref(false)
const isPanelMouseDown = ref(false)
const closePanelTimer = ref(null)
const scrollTimer = ref(null)

// Computed свойства
const queryHasMinLength = computed(() => {
  return localSearchQuery.value && localSearchQuery.value.length >= 2
})

const displayedSuggestions = computed(() => {
  console.log('displayedSuggestions:', {
    query: localSearchQuery.value,
    queryLength: localSearchQuery.value?.length,
    propsSuggestionsCount: props.suggestions?.length,
    productsCount: props.products?.length
  })
  
  // Для запросов меньше 2 символов не показываем результаты
  if (!localSearchQuery.value || localSearchQuery.value.length < 2) {
    return []
  }
  
  // Приоритет: использовать suggestions из props (серверные результаты)
  if (props.suggestions && props.suggestions.length > 0) {
    return props.suggestions
  }
  
  // Если нет серверных результатов, используем локальную фильтрацию products
  if (props.products && props.products.length > 0) {
    const query = localSearchQuery.value.toLowerCase()
    return props.products.filter(product => {
      const name = product.name?.toLowerCase() || ''
      const description = product.description?.toLowerCase() || ''
      const category = product.category?.toLowerCase() || ''
      
      return name.includes(query) || 
            description.includes(query) || 
            category.includes(query)
    }).slice(0, 5)
  }
  
  return []
})

const shouldShowSuggestionsPanel = computed(() => {
  console.log('shouldShowSuggestionsPanel:', {
    isInputFocused: isInputFocused.value,
    isPanelMouseDown: isPanelMouseDown.value,
    localSearchQuery: localSearchQuery.value,
    queryLength: localSearchQuery.value?.length,
    localShowSuggestions: localShowSuggestions.value,
    isPanelForcedOpen: isPanelForcedOpen.value,
    displayedSuggestionsCount: displayedSuggestions.value.length,
    isSearching: props.isSearching,
    hasPerformedSearch: hasPerformedSearch.value
  })
  
  // Основное правило: если инпут не в фокусе и не было клика на панель, не показываем
  if (!isInputFocused.value && !isPanelMouseDown.value) {
    console.log('Panel: input not focused')
    return false
  }
  
  // Если инпут в фокусе или был клик на панель, показываем панель в следующих случаях:
  
  // 1. Показываем начальное состояние (подсказку) когда нет запроса
  if (!localSearchQuery.value) {
    console.log('Panel: empty query, show initial')
    return true
  }
  
  // 2. Показываем сообщение о минимальном количестве символов
  if (localSearchQuery.value.length === 1) {
    console.log('Panel: query length 1, show min chars')
    return true
  }
  
  // 3. Показываем если идет поиск
  if (props.isSearching) {
    console.log('Panel: is searching')
    return true
  }
  
  // 4. Показываем если есть подсказки
  if (displayedSuggestions.value.length > 0) {
    console.log('Panel: has suggestions')
    return true
  }
  
  // 5. Показываем если есть запрос от 2 символов и поиск уже выполнялся (результат "ничего не найдено")
  if (localSearchQuery.value.length >= 2 && hasPerformedSearch.value) {
    console.log('Panel: no results for query')
    return true
  }
  
  // 6. Показываем если панель принудительно открыта
  if (isPanelForcedOpen.value) {
    console.log('Panel: forced open')
    return true
  }
  
  console.log('Panel: no condition met, not showing')
  return false
})

// Watchers для синхронизации с props
watch(() => props.searchQuery, (newVal) => {
  if (newVal !== localSearchQuery.value) {
    localSearchQuery.value = newVal
  }
})

watch(() => props.showSuggestions, (newVal) => {
  if (newVal !== localShowSuggestions.value) {
    localShowSuggestions.value = newVal
  }
})

watch(() => props.activeSuggestionIndex, (newVal) => {
  if (newVal !== localActiveSuggestionIndex.value) {
    localActiveSuggestionIndex.value = newVal
  }
})

watch(() => props.suggestions, (newVal) => {
  if (newVal && newVal.length > 0) {
    hasInitialResults.value = true
    hasPerformedSearch.value = true
  }
})

// Основной обработчик ввода
const handleInput = (event) => {
  const value = event.target.value
  localSearchQuery.value = value
  emit('update:searchQuery', value)
  
  // Триггерим поиск только если 2 или больше букв
  if (value && value.length >= 2) {
    emit('search', value)
    
    // Показываем подсказки при вводе от 2 символов
    if (!localShowSuggestions.value) {
      localShowSuggestions.value = true
      emit('update:showSuggestions', true)
    }
  } else {
    // Скрываем подсказки если меньше 2 символов
    if (localShowSuggestions.value) {
      localShowSuggestions.value = false
      emit('update:showSuggestions', false)
    }
  }
}

const handleFocus = () => {
  console.log('Input focused')
  isInputFocused.value = true
  // Очищаем таймер закрытия если он есть
  if (closePanelTimer.value) {
    clearTimeout(closePanelTimer.value)
    closePanelTimer.value = null
  }
  // Очищаем таймер скролла если он есть
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
    scrollTimer.value = null
  }
  // При фокусе открываем панель
  isPanelForcedOpen.value = true
}

const handleBlur = (event) => {
  console.log('Input blurred')
  // Увеличиваем задержку для закрытия панели
  closePanelTimer.value = setTimeout(() => {
    // Проверяем, был ли клик на самой панели
    if (!isPanelMouseDown.value) {
      console.log('Closing panel from blur timer')
      isInputFocused.value = false
      isPanelForcedOpen.value = false
      localShowSuggestions.value = false
      emit('update:showSuggestions', false)
    } else {
      console.log('Panel mouse down, keeping panel open')
    }
  }, 200)
}

const handlePanelMouseDown = (event) => {
  console.log('Panel mouse down')
  // Если кликнули на саму панель (а не на элемент внутри), предотвращаем снятие фокуса
  if (event.target.classList.contains('suggestions-panel')) {
    event.preventDefault()
  }
  
  // Устанавливаем флаг, что пользователь нажал на панель
  isPanelMouseDown.value = true
  
  // Фокус должен остаться на инпуте
  if (searchInput.value) {
    searchInput.value.focus()
  }
  
  // Сбрасываем флаг после небольшой задержки
  setTimeout(() => {
    isPanelMouseDown.value = false
  }, 300)
}

const handleKeydown = (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (displayedSuggestions.value.length > 0) {
        const nextIndex = localActiveSuggestionIndex.value < displayedSuggestions.value.length - 1 
          ? localActiveSuggestionIndex.value + 1 
          : 0
        localActiveSuggestionIndex.value = nextIndex
        emit('update:activeSuggestionIndex', nextIndex)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (displayedSuggestions.value.length > 0) {
        const prevIndex = localActiveSuggestionIndex.value > 0 
          ? localActiveSuggestionIndex.value - 1 
          : displayedSuggestions.value.length - 1
        localActiveSuggestionIndex.value = prevIndex
        emit('update:activeSuggestionIndex', prevIndex)
      }
      break
    case 'Escape':
      closeSuggestionsPanel()
      localSearchQuery.value = ''
      emit('update:searchQuery', '')
      searchInput.value?.blur()
      break
  }
}

const handleEnter = (event) => {
  event.preventDefault()
  // Выполняем поиск только если введено минимум 2 символа
  if (localSearchQuery.value && localSearchQuery.value.length >= 2) {
    if (localActiveSuggestionIndex.value >= 0 && displayedSuggestions.value[localActiveSuggestionIndex.value]) {
      const selectedProduct = displayedSuggestions.value[localActiveSuggestionIndex.value]
      console.log('🔍 Выбор товара по Enter:', selectedProduct.name)
      emit('suggestionSelected', selectedProduct)
      emit('selectProduct', selectedProduct)
      closeSuggestionsPanel()
      searchInput.value?.blur()
    } else {
      console.log('🔍 Выполнение поиска по Enter')
      emit('performSearch')
      hasPerformedSearch.value = true
      // После поиска тоже закрываем панель
      closeSuggestionsPanel()
    }
  }
}

const selectSuggestion = (suggestion) => {
  console.log('🔍 Выбор товара по клику:', suggestion.name)
  emit('suggestionSelected', suggestion)
  emit('selectProduct', suggestion)
  
  // Сбрасываем флаг и закрываем панель
  isPanelMouseDown.value = false
  closeSuggestionsPanel()
  searchInput.value?.blur()
}

const updateActiveIndex = (index) => {
  localActiveSuggestionIndex.value = index
  emit('update:activeSuggestionIndex', index)
}

const resetSearch = () => {
  localSearchQuery.value = ''
  localActiveSuggestionIndex.value = -1
  hasPerformedSearch.value = false
  hasInitialResults.value = false
  emit('resetSearch')
  emit('update:showSuggestions', false)
  searchInput.value?.focus()
  // При сбросе открываем панель с начальным состоянием
  openSuggestionsPanel()
}

// Методы управления панелью
const openSuggestionsPanel = () => {
  if (!localShowSuggestions.value) {
    localShowSuggestions.value = true
    emit('update:showSuggestions', true)
  }
  // Также включаем принудительное открытие
  isPanelForcedOpen.value = true
}

const closeSuggestionsPanel = () => {
  localShowSuggestions.value = false
  emit('update:showSuggestions', false)
  isPanelForcedOpen.value = false
  isInputFocused.value = false
  isPanelMouseDown.value = false
}

const getHighlightedText = (item, field) => {
  // Используем подсветку только если запрос от 2 символов
  const text = item[field] || ''
  if (localSearchQuery.value && localSearchQuery.value.length >= 2) {
    return highlightText(text, localSearchQuery.value)
  }
  return text
}

// Обработчик клика за пределами компонента
const handleClickOutside = (event) => {
  // Если клик был вне компонента поиска, закрываем панель и убираем фокус
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    isInputFocused.value = false
    
    // Очищаем таймер, чтобы не было конфликтов
    if (closePanelTimer.value) {
      clearTimeout(closePanelTimer.value)
      closePanelTimer.value = null
    }
    
    // Закрываем панель
    closeSuggestionsPanel()
    
    // Убираем фокус с инпута
    if (searchInput.value) {
      // Двойной вызов blur для надежности
      searchInput.value.blur()
      searchInput.value.blur()
    }
  }
}

// Обработчик скролла
const handleScroll = () => {
  console.log('Page scrolled, removing focus from input')
  
  // Очищаем предыдущий таймер
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }
  
  // Устанавливаем новый таймер для отложенного выполнения
  scrollTimer.value = setTimeout(() => {
    // При скролле страницы убираем фокус и закрываем панель
    isInputFocused.value = false
    closeSuggestionsPanel()
    
    // Надежный способ убрать фокус с инпута
    if (searchInput.value) {
      // Метод 1: Просто вызываем blur
      searchInput.value.blur()
      
      // Метод 2: Если blur не сработал, пытаемся изменить фокус на body
      setTimeout(() => {
        if (document.activeElement === searchInput.value) {
          document.activeElement.blur()
        }
      }, 10)
      
      // Метод 3: Альтернативный способ - переключить атрибут readonly
      setTimeout(() => {
        if (document.activeElement === searchInput.value) {
          searchInput.value.readOnly = true
          setTimeout(() => {
            searchInput.value.readOnly = false
            searchInput.value.blur()
          }, 10)
        }
      }, 20)
      
      // Метод 4: Если все еще в фокусе, пытаемся переключить focus на другой элемент
      setTimeout(() => {
        if (document.activeElement === searchInput.value) {
          // Создаем невидимый элемент и переключаем фокус на него
          const tempInput = document.createElement('input')
          tempInput.style.position = 'absolute'
          tempInput.style.opacity = '0'
          tempInput.style.height = '0'
          tempInput.style.width = '0'
          document.body.appendChild(tempInput)
          tempInput.focus()
          setTimeout(() => {
            document.body.removeChild(tempInput)
            searchInput.value.blur()
          }, 10)
        }
      }, 30)
    }
    
    // Очищаем таймер
    scrollTimer.value = null
  }, 100)
}

// Улучшенный обработчик для мобильных устройств
const handleTouchMove = () => {
  console.log('Touch move detected, removing focus')
  handleScroll()
}

// Восстанавливаем состояние при монтировании
onMounted(() => {
  if (localSearchQuery.value && localSearchQuery.value.length > 0) {
    // Показываем подсказки если есть запрос
    nextTick(() => {
      openSuggestionsPanel()
    })
  } else if (props.isActive) {
    // Показываем начальную подсказку только если компонент активен
    isPanelForcedOpen.value = true
  }
  
  // Добавляем обработчики для закрытия панели
  if (process.client) {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Добавляем обработчик для мобильных устройств
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    // Также обрабатываем событие wheel (скролл колесиком мыши)
    window.addEventListener('wheel', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  // Очищаем все таймеры
  if (closePanelTimer.value) {
    clearTimeout(closePanelTimer.value)
  }
  
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }
  
  // Удаляем все обработчики
  if (process.client) {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('wheel', handleScroll)
  }
})
</script>