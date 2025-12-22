// composables/useAppState.js
import { useProducts } from './useProducts'
import { useFilters } from './useFilters'
import { useNotifications } from './useNotifications'
import { useAuth } from './useAuth'
import { ref, computed, watch, reactive } from 'vue'

let globalState = null

export const useAppState = () => {
  if (globalState) {
    return globalState
  }

  // Инициализация модулей
  const notifications = useNotifications()
  const products = useProducts(notifications)
  const filters = useFilters(products.products)
  const auth = useAuth()

  // Состояние избранного (локальное, без API)
  const favoritesState = reactive({
    items: [],
    products: [],
    loading: false,
    favoritesCount: computed(() => favoritesState.items.length)
  })

  // Функции для избранного (работают только на клиенте)
  const favorites = {
    async loadFavorites() {
      if (process.client) {
        try {
          favoritesState.loading = true
          const savedFavorites = localStorage.getItem('userFavorites')
          if (savedFavorites) {
            favoritesState.items = JSON.parse(savedFavorites)
            await this.loadFavoriteProducts()
          }
        } catch (error) {
          console.error('Ошибка загрузки избранного:', error)
        } finally {
          favoritesState.loading = false
        }
      }
    },

    async loadFavoriteProducts() {
      if (favoritesState.items.length === 0) {
        favoritesState.products = []
        return
      }

      try {
        const allProducts = products.products.value
        favoritesState.products = allProducts.filter(product => 
          favoritesState.items.includes(product.id)
        )
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
      }
    },

    async addToFavorites(productId) {
      const { $notify } = useNuxtApp()
      
      if (!auth.isAuthenticated.value) {
        $notify.warning('Войдите в систему чтобы добавить в избранное')
        return navigateTo('/auth/login')
      }

      try {
        if (!favoritesState.items.includes(productId)) {
          favoritesState.items.push(productId)
          
          if (process.client) {
            localStorage.setItem('userFavorites', JSON.stringify(favoritesState.items))
          }
          
          await this.loadFavoriteProducts()
          this.updateProductsFavoritesState()
        }
        return true
      } catch (error) {
        console.error('Ошибка добавления в избранное:', error)
        $notify.error('Ошибка добавления в избранное')
        return false
      }
    },

    async removeFromFavorites(productId) {
      const { $notify } = useNuxtApp()
      
      try {
        favoritesState.items = favoritesState.items.filter(id => id !== productId)
        favoritesState.products = favoritesState.products.filter(p => p.id !== productId)
        
        if (process.client) {
          localStorage.setItem('userFavorites', JSON.stringify(favoritesState.items))
        }
        
        this.updateProductsFavoritesState()
        return true
      } catch (error) {
        console.error('Ошибка удаления из избранного:', error)
        $notify.error('Ошибка удаления из избранного')
        return false
      }
    },

    isFavorite(productId) {
      return favoritesState.items.includes(productId)
    },

    async toggleFavorite(productId) {
      if (this.isFavorite(productId)) {
        return await this.removeFromFavorites(productId)
      } else {
        return await this.addToFavorites(productId)
      }
    },

    clearAllFavorites() {
      favoritesState.items = []
      favoritesState.products = []
      if (process.client) {
        localStorage.removeItem('userFavorites')
      }
    },

    updateProductsFavoritesState() {
      if (products.products.value.length > 0) {
        const updatedProducts = products.products.value.map(product => ({
          ...product,
          isFavorite: this.isFavorite(product.id)
        }))
        products.products.value = updatedProducts
      }
    }
  }

  // Состояния для поиска
  const searchQuery = useState('searchQuery', () => '')
  const isSearching = useState('isSearching', () => false)
  const showSuggestions = useState('showSuggestions', () => false)
  const searchResults = useState('searchResults', () => [])
  const suggestionItems = useState('suggestionItems', () => [])
  const activeSuggestionIndex = useState('activeSuggestionIndex', () => -1)

  // Вычисляемые свойства для поиска
  const hasSuggestions = computed(() => suggestionItems.value.length > 0)
  const totalResults = computed(() => searchResults.value.length)

  // Функция поиска
  let searchTimeout = null
  const performSearch = (query) => {
    if (!query || query.length < 2) {
      searchResults.value = []
      suggestionItems.value = []
      isSearching.value = false
      return
    }

    isSearching.value = true

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      try {
        const results = searchInItems(query, products.products.value)
        searchResults.value = results
        suggestionItems.value = results.slice(0, 5)
      } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
        suggestionItems.value = []
      } finally {
        isSearching.value = false
      }
    }, 300)
  }

  const searchInItems = (query, items) => {
    const normalizedQuery = query.toLowerCase().trim()
    const searchFields = ['name', 'description', 'category', 'brand']
    
    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = getNestedValue(item, field)?.toString().toLowerCase()
        if (!fieldValue) return false
        return fieldValue.includes(normalizedQuery)
      })
    }).map(item => ({
      ...item,
      highlights: generateHighlights(item, normalizedQuery, searchFields)
    }))
  }

  const generateHighlights = (item, query, fields) => {
    const highlights = {}
    
    fields.forEach(field => {
      const fieldValue = getNestedValue(item, field)
      if (fieldValue) {
        highlights[field] = highlightText(fieldValue.toString(), query)
      }
    })
    
    return highlights
  }

  const highlightText = (text, query) => {
    if (!query) return text
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
    return text.replace(regex, `<span class="search-highlight">$1</span>`)
  }

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  const handleKeydown = (event) => {
    if (!showSuggestions.value) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        activeSuggestionIndex.value = Math.min(
          activeSuggestionIndex.value + 1,
          suggestionItems.value.length - 1
        )
        break
        
      case 'ArrowUp':
        event.preventDefault()
        activeSuggestionIndex.value = Math.max(activeSuggestionIndex.value - 1, -1)
        break
        
      case 'Enter':
        event.preventDefault()
        if (activeSuggestionIndex.value >= 0) {
          selectSuggestion(suggestionItems.value[activeSuggestionIndex.value])
        } else {
          performSearchAction()
        }
        break
        
      case 'Escape':
        hideSuggestions()
        break
    }
  }

  const selectSuggestion = (suggestion) => {
    searchQuery.value = suggestion.name || suggestion.title
    hideSuggestions()
    filters.handleSearchUpdate(searchQuery.value)
  }

  const showSuggestionsPanel = () => {
    if (searchQuery.value.length >= 2) {
      showSuggestions.value = true
    }
  }

  const hideSuggestions = () => {
    showSuggestions.value = false
    activeSuggestionIndex.value = -1
  }

  const resetSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    suggestionItems.value = []
    hideSuggestions()
    filters.handleSearchUpdate('')
  }

  const performSearchAction = () => {
    filters.handleSearchUpdate(searchQuery.value)
    hideSuggestions()
  }

  const showAllResults = () => {
    console.log('🔄 Показать все результаты:', {
      searchQuery: searchQuery.value,
      hasSuggestions: hasSuggestions.value,
      totalResults: totalResults.value
    })
    
    filters.handleSearchUpdate(searchQuery.value)
    hideSuggestions()
    
    console.log('✅ Фильтры обновлены, подсказки скрыты')
  }

  const getHighlightedText = (item, field) => {
    return item.highlights?.[field] || getNestedValue(item, field) || ''
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Проверка аутентификации - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const checkAuth = async () => {
    try {
      console.log('🔐 Проверка аутентификации...')
      // Используем $fetch вместо useFetch для избежания предупреждения
      const data = await $fetch('/api/auth/user', {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      })
      
      if (data?.user && data?.isAuthenticated) {
        console.log('✅ Пользователь аутентифицирован:', data.user.email)
        // Используем updateAuthState вместо прямого присваивания
        if (auth.updateAuthState) {
          auth.updateAuthState(data.user)
        } else {
          auth.user.value = data.user
        }
        
        // Загружаем избранное при авторизации
        await favorites.loadFavorites()
      } else {
        console.log('❌ Пользователь не аутентифицирован')
        if (auth.updateAuthState) {
          auth.updateAuthState(null)
        } else {
          auth.user.value = null
        }
        favorites.clearAllFavorites()
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error)
      if (auth.updateAuthState) {
        auth.updateAuthState(null)
      } else {
        auth.user.value = null
      }
      favorites.clearAllFavorites()
    }
  }

  // Выход из системы - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const logout = async () => {
    try {
      console.log('🚪 Начало выхода из системы...')
      
      const data = await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // Очищаем локальное состояние через updateAuthState
      if (auth.updateAuthState) {
        auth.updateAuthState(null)
      } else {
        auth.user.value = null
      }
      favorites.clearAllFavorites()

      // Очищаем localStorage/sessionStorage
      if (process.client) {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
        localStorage.removeItem('auth-token')
        localStorage.removeItem('userFavorites')
        
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/" + (location.hostname === 'localhost' ? '' : '; domain=.' + location.hostname.split('.').slice(-2).join('.'))
        })
      }

      console.log('✅ Выход выполнен успешно')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Ошибка выхода:', error)
      // Даже при ошибке очищаем локальное состояние
      if (auth.updateAuthState) {
        auth.updateAuthState(null)
      } else {
        auth.user.value = null
      }
      favorites.clearAllFavorites()
      return { success: false, error: error.message }
    }
  }

  // Принудительная очистка состояния
  const forceClearAuthState = () => {
    console.log('🧹 Принудительная очистка состояния аутентификации')
    if (auth.updateAuthState) {
      auth.updateAuthState(null)
    } else {
      auth.user.value = null
    }
    favorites.clearAllFavorites()
    
    if (process.client) {
      localStorage.removeItem('user')
      localStorage.removeItem('userFavorites')
      sessionStorage.removeItem('user')
    }
  }

  // Метод для прокрутки к началу списка товаров
  const scrollToProductsTop = () => {
    if (process.client) {
      setTimeout(() => {
        // Прокручиваем контейнер товаров
        const container = document.querySelector('.products-container')
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
        
        // Также прокручиваем всю страницу для надежности
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
        
        // Для старых браузеров
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        
        console.log('🔼 Прокрутка к началу товаров выполнена')
      }, 100)
    }
  }

  // Метод для обновления фильтров с прокруткой
  const handleFiltersUpdateWithScroll = (newFilters) => {
    handleFiltersUpdate(newFilters)
    scrollToProductsTop()
  }

  // Метод для обновления сортировки с прокруткой
  const handleSortUpdateWithScroll = (newSort) => {
    handleSortUpdate(newSort)
    scrollToProductsTop()
  }

  // Watchers
  watch(searchQuery, (newQuery) => {
    if (newQuery && newQuery.length >= 2) {
      performSearch(newQuery)
      showSuggestionsPanel()
    } else {
      searchResults.value = []
      suggestionItems.value = []
      hideSuggestions()
    }
  })

  watch(searchQuery, (newQuery) => {
    if (newQuery !== filters.searchQuery.value) {
      filters.handleSearchUpdate(newQuery)
    }
  })

  watch(() => auth.isAuthenticated.value, (isAuthenticated) => {
    if (isAuthenticated) {
      favorites.loadFavorites()
    } else {
      favorites.clearAllFavorites()
    }
  })

  if (process.client) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'userFavorites' && e.newValue) {
        try {
          const newFavorites = JSON.parse(e.newValue)
          favoritesState.items = newFavorites
          favorites.loadFavoriteProducts()
          favorites.updateProductsFavoritesState()
        } catch (error) {
          console.error('Ошибка синхронизации избранного:', error)
        }
      }
    })
  }

  // Инициализация приложения
  const initializeApp = async () => {
    try {
      if (process.client && products.products.value.length === 0) {
        await products.loadProducts()
      }
      
      await checkAuth()
      await favorites.loadFavorites()
      filters.resetFilters()
      
      console.log('✅ AppState инициализирован')
    } catch (err) {
      products.error.value = err.message
      console.error('❌ Ошибка инициализации AppState:', err)
    }
  }

  // Объединенное состояние
  globalState = {
    // Состояние из модулей
    ...products,
    ...filters,
    ...notifications,
    ...auth,
    
    // Избранное
    favorites: {
      items: computed(() => favoritesState.items),
      products: computed(() => favoritesState.products),
      loading: computed(() => favoritesState.loading),
      favoritesCount: computed(() => favoritesState.favoritesCount),
      
      loadFavorites: favorites.loadFavorites.bind(favorites),
      addToFavorites: favorites.addToFavorites.bind(favorites),
      removeFromFavorites: favorites.removeFromFavorites.bind(favorites),
      isFavorite: favorites.isFavorite.bind(favorites),
      toggleFavorite: favorites.toggleFavorite.bind(favorites),
      clearAllFavorites: favorites.clearAllFavorites.bind(favorites)
    },

    // Умный поиск
    search: {
      query: searchQuery,
      isSearching,
      showSuggestions,
      suggestions: suggestionItems,
      results: searchResults,
      activeSuggestionIndex,
      
      hasSuggestions,
      totalResults,
      
      handleKeydown,
      selectSuggestion,
      showSuggestionsPanel,
      hideSuggestions,
      resetSearch,
      performSearch: performSearchAction,
      showAllResults,
      getHighlightedText,
      formatPrice
    },

    // Дополнительные методы
    initializeApp,
    checkAuth,
    logout,
    forceClearAuthState,
    scrollToProductsTop,
    handleFiltersUpdateWithScroll,
    handleSortUpdateWithScroll,

    // Геттеры для обратной совместимости
    getSearchQuery: () => filters.searchQuery.value,
    setSearchQuery: (value) => { 
      searchQuery.value = value
      filters.handleSearchUpdate(value)
    },

    // Метод для полного сброса состояния
    resetAppState: () => {
      searchQuery.value = ''
      searchResults.value = []
      suggestionItems.value = []
      hideSuggestions()
      filters.resetFilters()
      forceClearAuthState()
      favorites.clearAllFavorites()
    }
  }

  return globalState
}