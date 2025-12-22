// composables/useFavorites.js
import { ref, computed } from 'vue'

let favoritesInstance = null

export const useFavorites = () => {
  if (favoritesInstance) {
    return favoritesInstance
  }

  const favorites = ref(new Set())
  
  // Загрузка избранных из localStorage
  const loadFavorites = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('favoriteProducts')
        if (stored) {
          const favoriteIds = JSON.parse(stored)
          favorites.value = new Set(favoriteIds)
          console.log('❤️ Загружены избранные:', favoriteIds.length, 'товаров')
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки избранных:', err)
        favorites.value = new Set()
      }
    }
  }

  // Сохранение избранных в localStorage
  const saveFavorites = () => {
    if (process.client) {
      try {
        const favoriteIds = Array.from(favorites.value)
        localStorage.setItem('favoriteProducts', JSON.stringify(favoriteIds))
        console.log('💾 Избранные сохранены:', favoriteIds.length, 'товаров')
      } catch (err) {
        console.error('❌ Ошибка сохранения избранных:', err)
      }
    }
  }

  // Проверка, является ли товар избранным
  const isFavorite = (productId) => {
    return favorites.value.has(productId)
  }

  // Добавление в избранное
  const addToFavorites = (productId) => {
    if (process.client) {
      favorites.value.add(productId)
      saveFavorites()
      console.log('❤️ Добавлен в избранное:', productId)
      
      // Триггерим обновление для всех слушателей
      window.dispatchEvent(new CustomEvent('favorites-updated'))
    }
  }

  // Удаление из избранного
  const removeFromFavorites = (productId) => {
    if (process.client) {
      favorites.value.delete(productId)
      saveFavorites()
      console.log('💔 Удален из избранного:', productId)
      
      // Триггерим обновление для всех слушателей
      window.dispatchEvent(new CustomEvent('favorites-updated'))
    }
  }

  // Переключение избранного
  const toggleFavorite = (productId) => {
    if (process.client) {
      if (isFavorite(productId)) {
        removeFromFavorites(productId)
      } else {
        addToFavorites(productId)
      }
    }
  }

  // Получение списка ID избранных товаров
  const favoriteIds = computed(() => {
    return Array.from(favorites.value)
  })

  // Получение количества избранных
  const favoritesCount = computed(() => {
    return favorites.value.size
  })

  // Очистка всех избранных
  const clearAllFavorites = () => {
    if (process.client) {
      favorites.value.clear()
      saveFavorites()
      console.log('🗑️ Все избранные товары очищены')
      
      // Триггерим обновление для всех слушателей
      window.dispatchEvent(new CustomEvent('favorites-updated'))
    }
  }

  // Инициализация при создании
  if (process.client) {
    loadFavorites()
  }

  favoritesInstance = {
    // Состояние
    favorites: computed(() => favorites.value),
    favoriteIds,
    favoritesCount,
    
    // Методы
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    loadFavorites,
    clearAllFavorites
  }

  return favoritesInstance
}