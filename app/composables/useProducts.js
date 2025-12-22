// composables/useProducts.js
import { ref, computed, watch } from 'vue'

export const useProducts = () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const notify = useNotifyQueue()

  // Получаем единый экземпляр useFavorites
  const favorites = useFavorites()

  // Реактивное состояние для принудительного обновления фильтрации
  const favoritesUpdateTrigger = ref(0)

  // Слушаем события обновления избранного
  if (process.client) {
    window.addEventListener('favorites-updated', () => {
      console.log('🔄 Событие favorites-updated получено в useProducts')
      favoritesUpdateTrigger.value++
      
      // Также обновляем локальное состояние продуктов
      if (products.value.length > 0) {
        const updatedProducts = products.value.map(product => ({
          ...product,
          isFavorite: favorites.isFavorite(product.id)
        }))
        products.value = updatedProducts
        
        // Обновляем localStorage
        try {
          const cleanedProducts = cleanProductsForStorage(products.value)
          localStorage.setItem('products', JSON.stringify(cleanedProducts))
          console.log('💾 Товары сохранены в localStorage (без base64):', cleanedProducts.length)
        } catch (e) {
          console.warn('⚠️ Не удалось сохранить в localStorage:', e.message)
          // Если все равно ошибка, сохраняем без изображений вообще
          const minimalProducts = products.value.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            inStock: p.inStock,
            categories: p.categories
          }))
          localStorage.setItem('products', JSON.stringify(minimalProducts))
        }
      }
    })
  }

  // Функция для автоматического обновления inStock на основе stockQuantity
  const updateProductStockStatus = (product) => {
    return {
      ...product,
      inStock: product.stockQuantity > 0
    }
  }

  // Загрузка товаров с сервера
  const loadProducts = async () => {
    console.log('🌐 Загрузка товаров...')
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/products')
      console.log('📥 Получены данные с сервера:', response.length, 'товаров')
      
      // Обновляем товары, устанавливая isFavorite из useFavorites и синхронизируя inStock
      products.value = response.map(product => 
        updateProductStockStatus({
          ...product,
          isFavorite: favorites.isFavorite(product.id)
        })
      )
      
      // Сохраняем в localStorage для кэширования
      if (process.client) {
        localStorage.setItem('products', JSON.stringify(products.value))
        console.log('💾 Товары сохранены в localStorage')
      }
      
      console.log('✅ Товары загружены с сервера и сохранены в состояние:', products.value.length)
      return products.value
      
    } catch (err) {
      console.error('❌ Ошибка загрузки товаров:', err)
      error.value = err.message
      notify.error('Ошибка загрузки товаров')
      
      // Пытаемся загрузить из localStorage как запасной вариант
      if (process.client) {
        const cached = localStorage.getItem('products')
        if (cached) {
          const parsedProducts = JSON.parse(cached)
          
          products.value = parsedProducts.map(product => 
            updateProductStockStatus({
              ...product,
              isFavorite: favorites.isFavorite(product.id)
            })
          )
          
          console.log('📥 Загружено из localStorage:', products.value.length, 'товаров')
          notify.info('Используются кэшированные данные')
        }
      }
      
      return []
    } finally {
      loading.value = false
    }
  }

  // Переключение избранного
  const toggleFavorite = async (productId) => {
    try {
      // Используем метод из useFavorites
      favorites.toggleFavorite(productId)
      
      // Обновляем локальное состояние продуктов для реактивности
      const productIndex = products.value.findIndex(p => p.id === productId)
      if (productIndex !== -1) {
        products.value[productIndex].isFavorite = favorites.isFavorite(productId)
        
        // Обновляем localStorage
        if (process.client) {
          localStorage.setItem('products', JSON.stringify(products.value))
        }
      }

      return true
    } catch (err) {
      console.error('❌ Ошибка переключения избранного:', err)
      notify.error('Ошибка при обновлении избранного')
      return false
    }
  }

  // Обновление товара
  const updateProduct = async (productId, updatedData) => {
    console.log('🔄 Обновление товара:', productId, updatedData)
    
    try {
      // Автоматически обновляем inStock если изменился stockQuantity
      const finalData = {
        ...updatedData,
        inStock: updatedData.stockQuantity > 0
      }

      const response = await $fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: finalData
      })
      
      console.log('✅ Товар обновлен на сервере:', response)
      
      // Обновляем в локальном состоянии
      const index = products.value.findIndex(p => p.id === productId)
      if (index !== -1) {
        // Сохраняем состояние isFavorite из useFavorites
        const wasFavorite = favorites.isFavorite(productId)
        products.value[index] = updateProductStockStatus({ 
          ...products.value[index], 
          ...finalData,
          isFavorite: wasFavorite
        })
        
        // Обновляем localStorage
        if (process.client) {
          localStorage.setItem('products', JSON.stringify(products.value))
        }
        
        notify.success('Товар успешно обновлен')
        return products.value[index]
      }
      
      throw new Error('Товар не найден в локальном состоянии')
      
    } catch (err) {
      console.error('❌ Ошибка обновления товара:', err)
      notify.error('Ошибка обновления товара: ' + err.message)
      throw err
    }
  }

  // Создание нового товара
  const createProduct = async (productData) => {
    console.log('🆕 Создание нового товара:', productData)
    
    try {
      // Автоматически устанавливаем inStock на основе stockQuantity
      const finalData = {
        ...productData,
        inStock: productData.stockQuantity > 0
      }

      const response = await $fetch('/api/products', {
        method: 'POST',
        body: finalData
      })
      
      console.log('✅ Товар создан на сервере:', response)
      
      // Создаем новый товар с правильной структурой
      const newProduct = updateProductStockStatus({
        id: response.id || Date.now().toString(),
        name: response.name || productData.name,
        description: response.description || productData.description,
        price: response.price || productData.price,
        categories: response.categories || productData.categories,
        image: response.image || productData.image,
        gallery: response.gallery || productData.gallery,
        inStock: response.inStock !== undefined ? response.inStock : (productData.stockQuantity > 0),
        stockQuantity: response.stockQuantity || productData.stockQuantity,
        isFavorite: false,
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || new Date().toISOString()
      })
      
      // Добавляем в локальное состояние
      products.value = [newProduct, ...products.value]
      
      // Обновляем localStorage
      if (process.client) {
        try {
          localStorage.setItem('products', JSON.stringify(products.value))
          console.log('💾 Товары обновлены в localStorage:', products.value.length)
        } catch (e) {
          console.warn('⚠️ Не удалось обновить localStorage:', e.message)
        }
      }
      
      notify.success('Товар успешно создан')
      return newProduct
      
    } catch (err) {
      console.error('❌ Ошибка создания товара:', err)
      notify.error('Ошибка создания товара: ' + err.message)
      throw err
    }
  }

  // Удаление товара
  const deleteProduct = async (productId) => {
    console.log('🗑️ Удаление товара:', productId)
    
    try {
      await $fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      console.log('✅ Товар удален с сервера')
      
      // Удаляем из локального состояния
      const index = products.value.findIndex(p => p.id === productId)
      if (index !== -1) {
        const productName = products.value[index].name
        products.value.splice(index, 1)
        
        // Обновляем localStorage
        if (process.client) {
          localStorage.setItem('products', JSON.stringify(products.value))
          
          // Также удаляем из избранных через useFavorites
          if (favorites.isFavorite(productId)) {
            favorites.removeFromFavorites(productId)
          }
        }
        
        notify.success(`Товар "${productName}" удален`)
        return true
      }
      
      throw new Error('Товар не найден в локальном состоянии')
      
    } catch (err) {
      console.error('❌ Ошибка удаления товара:', err)
      notify.error('Ошибка удаления товара: ' + err.message)
      throw err
    }
  }

  // Обновление количества товара (например, при покупке)
  const updateProductQuantity = (productId, newQuantity) => {
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      products.value[productIndex].stockQuantity = newQuantity
      products.value[productIndex].inStock = newQuantity > 0
      
      // Обновляем localStorage
      if (process.client) {
        localStorage.setItem('products', JSON.stringify(products.value))
      }
      
      console.log(`🔄 Обновлено количество товара ${productId}: ${newQuantity}`)
      return true
    }
    return false
  }

  // Уменьшение количества товара (при добавлении в корзину)
  const decreaseProductQuantity = (productId, amount = 1) => {
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      const currentQuantity = products.value[productIndex].stockQuantity
      const newQuantity = Math.max(0, currentQuantity - amount)
      
      products.value[productIndex].stockQuantity = newQuantity
      products.value[productIndex].inStock = newQuantity > 0
      
      // Обновляем localStorage
      if (process.client) {
        localStorage.setItem('products', JSON.stringify(products.value))
      }
      
      console.log(`➖ Уменьшено количество товара ${productId}: ${currentQuantity} -> ${newQuantity}`)
      return newQuantity
    }
    return -1
  }

  // Получение товара по ID
  const getProductById = (id) => {
    return products.value.find(product => product.id === id)
  }

  // Получение товаров по категории
  const getProductsByCategory = (category) => {
    if (!category) return products.value
    return products.value.filter(product => 
      product.categories && product.categories.includes(category)
    )
  }

  // Функция для очистки base64 данных перед сохранением в localStorage
  const cleanProductsForStorage = (products) => {
    return products.map(product => ({
      ...product,
      image: product.image && product.image.startsWith('data:') 
        ? ''
        : product.image,
      gallery: Array.isArray(product.gallery) 
        ? product.gallery.filter(img => !img.startsWith('data:')) // Убираем base64 из галереи
        : []
    }))
  }

  // Поиск товаров
  const searchProducts = (query) => {
    if (!query) return products.value
    
    const searchTerm = query.toLowerCase()
    return products.value.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.categories && product.categories.some(cat => 
        cat.toLowerCase().includes(searchTerm)
      ))
    )
  }

  // Фильтрация товаров
  const filterProducts = (filters) => {
    let filtered = products.value

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.categories && product.categories.includes(filters.category)
      )
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice)
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product => product.inStock === filters.inStock)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }

  // Сортировка товаров
  const sortProducts = (productsList, sortBy) => {
    if (!sortBy || !sortBy.field) return productsList

    const sorted = [...productsList]
    
    switch (sortBy.field) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default:
        break
    }

    if (sortBy.direction === 'desc') {
      sorted.reverse()
    }

    return sorted
  }

  // Получение всех категорий
  const categories = computed(() => {
    const allCategories = products.value.flatMap(product => 
      product.categories || []
    )
    const uniqueCategories = [...new Set(allCategories)]
    return uniqueCategories.sort()
  })

  // Получение избранных товаров - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const favoriteProducts = computed(() => {
    // Используем триггер для принудительного обновления
    const trigger = favoritesUpdateTrigger.value
    
    console.log('🔄 Обновление списка избранных товаров, триггер:', trigger)
    
    // Фильтруем товары по актуальному состоянию избранных
    const filtered = products.value.filter(product => {
      const isFav = favorites.isFavorite(product.id)
      console.log(`📋 Товар ${product.id} (${product.name}): ${isFav ? 'в избранном' : 'не в избранном'}`)
      return isFav
    })
    
    console.log('✅ Найдено избранных товаров:', filtered.length)
    return filtered
  })

  // Проверка, является ли товар избранным
  const isFavorite = (productId) => {
    return favorites.isFavorite(productId)
  }

  // Получение количества избранных товаров
  const favoritesCount = computed(() => {
    // Используем триггер для принудительного обновления
    const trigger = favoritesUpdateTrigger.value
    return favorites.favoritesCount
  })

  // Инициализация - загрузка товаров при создании - УБРАНА АВТОМАТИЧЕСКАЯ ЗАГРУЗКА
  // if (process.client) {
  //   // Сначала пытаемся загрузить из localStorage для быстрого отображения
  //   const cached = localStorage.getItem('products')
  //   if (cached) {
  //     const parsedProducts = JSON.parse(cached)
      
  //     // Синхронизируем с актуальным состоянием избранных и обновляем inStock
  //     products.value = parsedProducts.map(product => 
  //       updateProductStockStatus({
  //         ...product,
  //         isFavorite: favorites.isFavorite(product.id)
  //       })
  //     )
      
  //     console.log('📥 Загружено из localStorage:', products.value.length, 'товаров')
  //   }
    
  //   // Затем загружаем с сервера для актуальных данных
  //   loadProducts()
  // }

  return {
    // Состояние
    products: computed(() => products.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    categories,
    favoriteProducts,
    isFavorite,
    favoritesCount,

    // Методы
    loadProducts,
    updateProduct,
    createProduct,
    deleteProduct,
    updateProductQuantity,
    decreaseProductQuantity,
    getProductById,
    getProductsByCategory,
    searchProducts,
    filterProducts,
    sortProducts,
    toggleFavorite
  }
}