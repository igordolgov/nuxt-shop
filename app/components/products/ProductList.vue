<template>
  <div class="product-list">
    <div class="grid grid-cols-1 gap-6" :class="viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'">
      <ProductCard
        v-for="product in safeDisplayedProducts" 
        :key="product.id"
        :product="product"
        :viewMode="viewMode"
        :searchQuery="safeSearchQuery"
        :highlightSearch="highlightSearch"
      />
    </div>

    <div class="text-center py-8" v-if="safeDisplayedProducts.length === 0">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-lg font-semibold text-base-content mb-2">Товары не найдены</h3>
      <p class="mb-4 text-base-content/70">Попробуйте изменить параметры поиска или фильтрации</p>
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'grid'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  highlightSearch: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  }
})

const appState = useAppState()

const safeDisplayedProducts = computed(() => {
  if (!props.products) return []
  return Array.isArray(props.products) ? props.products : []
})

const safeSearchQuery = computed(() => props.searchQuery || '')

const toggleFavoriteHandler = (productId) => {
  try {
    console.log('❤️ ProductList: Переключение избранного для ID:', productId)
    appState.favorites.toggleFavorite(productId)
  } catch (error) {
    console.error('❌ ProductList: Ошибка переключения избранного:', error)
    appState.addNotification('Ошибка при обновлении избранного', 'error')
  }
}

const addToCartHandler = (product) => {
  try {
    console.log('🛒 ProductList: Добавление в корзину:', product.name)
    appState.addToCart(product)
    appState.addNotification(`Товар "${product.name}" добавлен в корзину`, 'success')
  } catch (error) {
    console.error('❌ ProductList: Ошибка добавления в корзину:', error)
    appState.addNotification('Ошибка при добавлении в корзину', 'error')
  }
}
</script>

<style scoped>
.product-list {
  width: 100%;
}
</style>