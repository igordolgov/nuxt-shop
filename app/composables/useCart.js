// composables/useCart.js
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Глобальное состояние
const cartState = ref({
  items: [],
  promo: '',
  processing: false,
  error: ''
})

export const useCart = () => {
  const router = useRouter()
  
  // Вычисляемые свойства - возвращаем значения, а не ref объекты
  const cartItems = computed(() => cartState.value.items || [])
  const appliedPromo = computed(() => cartState.value.promo || '')
  const isProcessing = computed(() => cartState.value.processing || false)
  const promoError = computed(() => cartState.value.error || '')

  const subtotal = computed(() => {
    const items = cartItems.value
    if (!items || items.length === 0) return 0
    return items.reduce((sum, item) => {
      const price = item.currentPrice || item.price || 0
      const quantity = item.quantity || 0
      return sum + (price * quantity)
    }, 0)
  })

  const discount = computed(() => {
    if (!appliedPromo.value) return 0
    return subtotal.value * 0.1
  })

  const deliveryPrice = computed(() => {
    return subtotal.value > 2000 ? 0 : 300
  })

  const total = computed(() => {
    return subtotal.value - discount.value + deliveryPrice.value
  })

  const totalItems = computed(() => {
    const items = cartItems.value
    if (!items || items.length === 0) return 0
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  })

  const discountPercent = computed(() => {
    return subtotal.value > 0 ? Math.round((discount.value / subtotal.value) * 100) : 0
  })

  // Функция добавления в корзину с проверкой stockQuantity
  const addToCart = async (product) => {
    if (!product || !product.id) {
      console.error('Invalid product:', product)
      return false
    }

    const existingItem = cartState.value.items.find(item => item.id === product.id)
    
    if (existingItem) {
      // Проверяем, не превышает ли новое количество stockQuantity
      const newQuantity = existingItem.quantity + 1
      const maxQuantity = product.stockQuantity || 0
      
      if (newQuantity > maxQuantity) {
        console.warn(`Cannot add more than ${maxQuantity} items of ${product.name}`)
        throw new Error(`Нельзя добавить больше ${maxQuantity} шт. товара "${product.name}"`)
      }
      
      existingItem.quantity = newQuantity
    } else {
      // Проверяем, есть ли товар в наличии
      if ((product.stockQuantity || 0) === 0) {
        throw new Error(`Товар "${product.name}" отсутствует на складе`)
      }
      
      cartState.value.items.push({
        id: product.id,
        name: product.name || 'Без названия',
        description: product.description || '',
        price: product.price || 0,
        currentPrice: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        quantity: 1,
        image: product.image || '',
        category: product.categories?.[0] || 'Другое',
        stockQuantity: product.stockQuantity || 0, // Сохраняем stockQuantity
        inStock: product.inStock !== undefined ? product.inStock : true,
        discount: product.discount || 0
      })
    }
    
    await saveCartToStorage()
    
    // Отправляем событие обновления
    if (process.client) {
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }
    
    console.log('➕ Товар добавлен в корзину, всего товаров:', totalItems.value)
    return true
  }

  // Функция очистки корзины
  const clearCart = async () => {
    cartState.value.items = []
    cartState.value.promo = ''
    await saveCartToStorage()
    if (process.client) {
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }
  }

  // Обновление количества с проверкой stockQuantity
  const updateItemQuantity = async (itemId, newQuantity) => {
    const item = cartState.value.items.find(item => item.id === itemId)
    if (item) {
      // Проверяем, не превышает ли новое количество stockQuantity
      const maxQuantity = item.stockQuantity || 999
      
      if (newQuantity > maxQuantity) {
        console.warn(`Cannot set quantity more than ${maxQuantity} for ${item.name}`)
        throw new Error(`Нельзя добавить больше ${maxQuantity} шт. товара "${item.name}"`)
      }
      
      item.quantity = Math.max(0, newQuantity)
      if (item.quantity === 0) {
        cartState.value.items = cartState.value.items.filter(item => item.id !== itemId)
      }
      await saveCartToStorage()
      if (process.client) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    }
  }

  const removeFromCart = async (itemId) => {
    cartState.value.items = cartState.value.items.filter(item => item.id !== itemId)
    await saveCartToStorage()
    if (process.client) {
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }
  }

  const applyPromoCode = async (code) => {
    if (code.toUpperCase() === 'SALE10') {
      cartState.value.promo = code
      cartState.value.error = ''
      await saveCartToStorage()
      if (process.client) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
      return true
    } else {
      cartState.value.error = 'Неверный промокод'
      throw new Error('Неверный промокод')
    }
  }

  const removePromoCode = async () => {
    cartState.value.promo = ''
    await saveCartToStorage()
    if (process.client) {
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }
  }

  const fetchCart = async () => {
    try {
      if (process.client) {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const parsed = JSON.parse(savedCart)
          cartState.value.items = Array.isArray(parsed.items) ? parsed.items : []
          cartState.value.promo = parsed.promo || ''
          console.log('📥 Корзина загружена из localStorage:', cartState.value.items.length, 'товаров')
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      cartState.value.items = []
      cartState.value.promo = ''
    }
  }

  const saveCartToStorage = async () => {
    try {
      if (process.client) {
        localStorage.setItem('cart', JSON.stringify({
          items: cartState.value.items,
          promo: cartState.value.promo
        }))
        console.log('💾 Корзина сохранена в localStorage')
      }
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  const proceedToCheckout = async () => {
    cartState.value.processing = true
    try {
      await router.push('/cart/checkout')
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    } finally {
      cartState.value.processing = false
    }
  }

  // Получение максимального количества для товара
  const getMaxQuantity = (productId) => {
    const item = cartState.value.items.find(item => item.id === productId)
    return item?.stockQuantity || 999
  }

  // Проверка, есть ли товары с недостаточным количеством
  const hasOutOfStockItems = computed(() => {
    return cartState.value.items.some(item => {
      const currentQuantity = item.quantity || 0
      const maxQuantity = item.stockQuantity || 999
      return currentQuantity > maxQuantity
    })
  })

  // Инициализация
  onMounted(() => {
    fetchCart()
  })

  // Возвращаем computed свойства как есть - они будут автоматически обновляться
  return {
    // Data
    cartItems,
    appliedPromo,
    isProcessing,
    promoError,
    
    // Computed
    subtotal,
    discount,
    total,
    totalItems,
    deliveryPrice,
    discountPercent,
    hasOutOfStockItems,
    
    // Methods
    addToCart,
    clearCart,
    updateItemQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
    fetchCart,
    proceedToCheckout,
    getMaxQuantity
  }
}