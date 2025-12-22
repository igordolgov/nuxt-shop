// useFilters.js
import { ref, computed } from 'vue'

export const useFilters = (products) => {
  // Функция для получения начальной сортировки из localStorage
  const getInitialSort = () => {
    if (process.client) {
      try {
        const savedSort = localStorage.getItem('productSort')
        if (savedSort) {
          const parsed = JSON.parse(savedSort)
          // Проверяем корректность сохраненной сортировки
          if (parsed && typeof parsed === 'object' && parsed.field && parsed.order) {
            console.log('📦 Загружена сохраненная сортировка из localStorage:', parsed)
            return parsed
          }
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки сортировки из localStorage:', error)
      }
    }
    // Значение по умолчанию: новые сверху
    console.log('📦 Используется сортировка по умолчанию: новые сверху')
    return { field: 'createdAt', order: 'desc' }
  }

  const searchQuery = ref('')
  const filters = ref({
    categories: [],
    onlyInStock: false,
    onlyFavorites: false,
    priceRange: { min: null, max: null }
  })
  
  // Инициализируем сортировку из localStorage или используем по умолчанию
  const sort = ref(getInitialSort())

  // Вычисляемые свойства для фильтрации и сортировки
  const displayedProducts = computed(() => {
    if (!products.value || !Array.isArray(products.value) || products.value.length === 0) return []
    
    let filtered = [...products.value]

    // Поиск
    if (searchQuery.value?.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.categories?.some(cat => cat?.toLowerCase().includes(query))
      )
    }

    // Фильтрация по категориям
    if (filters.value.categories?.length > 0) {
      filtered = filtered.filter(product =>
        product.categories?.some(cat => filters.value.categories.includes(cat))
      )
    }

    // Фильтр наличия
    if (filters.value.onlyInStock) {
      filtered = filtered.filter(product => product.inStock)
    }

    // Фильтр избранного
    if (filters.value.onlyFavorites) {
      filtered = filtered.filter(product => product.isFavorite)
    }

    // Фильтр по цене
    if (filters.value.priceRange?.min !== null) {
      filtered = filtered.filter(product => product.price >= filters.value.priceRange.min)
    }
    if (filters.value.priceRange?.max !== null) {
      filtered = filtered.filter(product => product.price <= filters.value.priceRange.max)
    }

    // Сортировка - ВАЖНО: всегда применяем текущую сортировку
    return sortProducts(filtered, sort.value)
  })

  const actualPriceRange = computed(() => {
    if (!products.value || products.value.length === 0) return { min: 0, max: 1000 }
    const prices = products.value.map(p => p.price).filter(price => !isNaN(price))
    if (prices.length === 0) return { min: 0, max: 1000 }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  })

  // Методы сортировки с сохранением порядка
  const sortProducts = (productsToSort, sortConfig) => {
    if (!sortConfig?.field) {
      return productsToSort.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.id || 0)
        const dateB = new Date(b.createdAt || b.id || 0)
        return dateB - dateA
      })
    }

    return [...productsToSort].sort((a, b) => {
      let aVal = a[sortConfig.field]
      let bVal = b[sortConfig.field]

      // Для дат
      if (sortConfig.field === 'createdAt' || sortConfig.field === 'updatedAt') {
        const dateA = new Date(aVal || a.id || 0)
        const dateB = new Date(bVal || b.id || 0)
        return sortConfig.order === 'desc' ? dateB - dateA : dateA - dateB
      }
      
      // Для ID
      if (sortConfig.field === 'id') {
        const numA = parseInt(aVal) || 0
        const numB = parseInt(bVal) || 0
        return sortConfig.order === 'desc' ? numB - numA : numA - numB
      }

      // Для цены
      if (sortConfig.field === 'price') {
        return sortConfig.order === 'desc' ? bVal - aVal : aVal - bVal
      }

      // Для названия
      if (sortConfig.field === 'name') {
        if (!aVal) aVal = ''
        if (!bVal) bVal = ''
        return sortConfig.order === 'desc' 
          ? bVal.toString().localeCompare(aVal.toString())
          : aVal.toString().localeCompare(bVal.toString())
      }

      // Для текстовых полей
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1
      return 0
    })
  }

  // Методы управления состоянием
  const handleSearchUpdate = (value) => {
    searchQuery.value = value
  }

  const handleFiltersUpdate = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const handleSortUpdate = (newSort) => {
    if (newSort && typeof newSort === 'object') {
      const updatedSort = { ...sort.value, ...newSort }
      sort.value = updatedSort
      
      // Сохраняем в localStorage
      if (process.client) {
        try {
          localStorage.setItem('productSort', JSON.stringify(updatedSort))
          console.log('💾 Сортировка сохранена в localStorage:', updatedSort)
        } catch (error) {
          console.error('❌ Ошибка сохранения сортировки в localStorage:', error)
        }
      }
    }
  }

  const resetFilters = () => {
    filters.value = {
      categories: [],
      onlyInStock: false,
      onlyFavorites: false,
      priceRange: { min: null, max: null }
    }
    searchQuery.value = ''
    // НЕ сбрасываем сортировку при сбросе фильтров!
  }

  // Полный сброс с сортировкой (сбрасываем все, включая сортировку)
  const resetAll = () => {
    filters.value = {
      categories: [],
      onlyInStock: false,
      onlyFavorites: false,
      priceRange: { min: null, max: null }
    }
    searchQuery.value = ''
    // Сбрасываем сортировку к значению по умолчанию
    const defaultSort = { field: 'createdAt', order: 'desc' }
    sort.value = defaultSort
    
    // Сохраняем в localStorage
    if (process.client) {
      localStorage.setItem('productSort', JSON.stringify(defaultSort))
    }
  }

  // Метод для прокрутки к началу
  const scrollToTop = () => {
    if (process.client) {
      setTimeout(() => {
        const container = document.querySelector('.products-container')
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
        
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }, 100)
    }
  }

  return {
    // Состояние
    searchQuery: computed(() => searchQuery.value),
    filters: computed(() => filters.value),
    sort: computed(() => sort.value),
    
    // Вычисляемые свойства
    displayedProducts,
    actualPriceRange,
    
    // Методы
    handleSearchUpdate,
    handleFiltersUpdate,
    handleSortUpdate,
    resetFilters,
    resetAll,
    scrollToTop
  }
}