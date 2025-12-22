<!-- pages/favorites.vue -->
<template lang="pug">
.favorites-page(class="max-h-auto bg-base-100 flex flex-col mb-18 sm:mb-0")
  Header
  
  .content-wrapper(class="flex")
    main.main-content(class="bg-base-100 flex-1 flex flex-col" :class="{ 'horizontal-orientation': isHorizontal }")
      .container(class="px-2 sm:pt-0 flex-1 lg:px-4 lg:py-2")
        //- Заголовок и управление
        div(class="fixed top-12 left-0 right-0 z-40 flex items-center justify-between min-h-12 px-2 lg:mb-6 bg-base-100 sm:pl-19 lg:px-4 sm:min-h-10")
          h1(class="text-2xl font-bold") Избранное
          div(class="flex items-center gap-3 mt-2")
            span(class="text-sm text-base-content/70")
              | Товаров: {{ favoriteProducts.length }}
            button(
              class="btn btn-secondary btn-xs border border-gray-400 hover:bg-error/10 hover:border-error hover:text-error opacity-70"
              v-if="favoriteProducts.length > 0"
              @click="clearAllFavorites"
            )
              svg(class="mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none")
                path(
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  stroke="currentColor"
                  stroke-width="2"
                )
              span(class="text-sm text-base-100") Очистить

        //- Сетка товаров
        .products-grid(
          v-if="favoriteProducts.length > 0 && !isLoading"
          class="gap-2 pt-12 sm:pt-2 lg:pt-8"
          :class="[isHorizontal ? 'horizontal-mode' : 'vertical-mode', 'grid']"
        )
          .product-card(
            class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col rounded-lg border border-secondary/60 p-2"
            v-for="product in favoriteProducts"
            :key="product.id"
          )
            //- Кнопка избранного
            div(class="absolute top-2 left-2 z-10")
              button.btn.btn-circle.btn-xs.btn-error(
                @click.stop="handleToggleFavorite(product)"
                title="Удалить из избранного"
              )
                svg(width="14" height="14" viewBox="0 0 24 24" fill="currentColor")
                  path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")

            //- Кнопка добавления в корзину
            div(class="absolute top-2 right-2 z-10")
              button.btn.btn-circle.btn-xs.btn-primary(
                class="disabled:bg-green-700"
                @click.stop="handleAddToCart(product)"
                :disabled="!product.inStock || isInCart(product.id)"
                :title="isInCart(product.id) ? 'Уже в корзине' : 'Добавить в корзину'"
              )
                svg(width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4")
                  path(
                    v-if="!isInCart(product.id)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  )
                  path(
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  )

            //- Изображение товара
            NuxtLink.flex-1.flex.flex-col(:to="`/product/${product.id}`")
              figure(class="product-image p-1 pb-0 flex justify-center items-center rounded-xl")
                div(class="w-full h-auto flex items-center justify-center")
                  img(
                    class="rounded-lg w-full h-full object-cover max-w-full max-h-full"
                    :src="product.image || '/images/placeholder.jpg'"
                    :alt="product.name"
                    @error="handleImageError"
                  )

              //- Информация о товаре
              div(class="product-info card-body p-1 pt-0 sm:pt-2 lg:pt-1 flex-1 flex flex-col")
                //- Название и описание
                div(class="flex-1 min-h-0")
                  h3(class="card-title text-sm font-semibold line-clamp-2 min-h-10 mb-0 lg:text-sm")
                    | {{ product.name }}
                  p(class="description text-xs text-base-content opacity-70 line-clamp-2 lg:text-xs")
                    | {{ product.description || product.category }}

                //- Цена и статус
                div(class="product-footer flex items-center justify-between mt-auto")
                  div(class="price text-md font-bold text-sky-700")
                    | {{ formatPrice(product.price) }}
                  div(
                    class="stock-status text-xs"
                    :class="product.inStock ? 'text-success' : 'text-red-600'"
                  )
                    | {{ product.inStock ? 'В наличии' : 'Закончился' }}

        //- Пустое состояние
        div.no-favorites(class="w-full h-full fixed top-70 sm:top-34 lg:top-70 left-0 right-0 text-center" v-else)
          //- div(class="text-6xl mb-4 text-primary opacity-70 lg:text-8xl") ❤️
          h2(class="text-2xl font-bold mb-3") Нет избранных товаров
          p(class="text-base-content opacity-70 mb-6 lg:text-base")
            | Добавляйте товары в избранное, чтобы они появились здесь
          NuxtLink.btn.btn-primary.btn-lg.rounded-lg(to="/")
            svg(class="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none")
              path(
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                stroke="currentColor"
                stroke-width="2"
              )
            | Перейти к товарам

  //- Мобильный футер
  MobileNavFooter(v-if="isMobile")
</template>

<style scoped>
.btn-error {
  background: oklch(55% 0.2 40);
}

.no-favorites {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ОСНОВНЫЕ СТИЛИ ДЛЯ ВЕРТИКАЛЬНОЙ ОРИЕНТАЦИИ */
.products-grid.vertical-mode {
  display: grid !important;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

/* Адаптивная сетка для вертикальной ориентации */
@media (min-width: 640px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

/* ГОРИЗОНТАЛЬНАЯ ОРИЕНТАЦИЯ - сетка с адаптивными колонками */
/* По умолчанию для горизонтального режима - 4 колонки */
.products-grid.horizontal-mode {
  display: grid !important;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 0.5rem !important;
  margin-top: 2rem !important;
}

/* Для узких экранов в ландшафте - 3 колонки */
@media (max-width: 700px) and (orientation: landscape) {
  .products-grid.horizontal-mode {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

/* Для очень узких экранов в ландшафте - 2 колонки */
@media (max-width: 500px) and (orientation: landscape) {
  .products-grid.horizontal-mode {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

/* Для планшетов в ландшафте - 5 колонок */
@media (min-width: 927px) and (max-width: 1024px) and (orientation: landscape) {
  .products-grid.horizontal-mode {
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  }
}

/* Уменьшаем высоту изображений для горизонтального режима */
.products-grid.horizontal-mode .product-image {
  height: 100px !important;
  min-height: 100px !important;
}

/* Уменьшаем размер шрифтов для горизонтального режима */
.products-grid.horizontal-mode .card-title {
  font-size: 0.8rem !important;
  margin-bottom: 0.125rem !important;
}

.products-grid.horizontal-mode .description {
  font-size: 0.7rem !important;
}

.products-grid.horizontal-mode .price {
  font-size: 1rem !important;
}

.products-grid.horizontal-mode .stock-status {
  font-size: 0.7rem !important;
}

/* Уменьшаем кнопки для горизонтального режима */
.products-grid.horizontal-mode .product-card .btn-circle.btn-xs {
  width: 1.25rem !important;
  height: 1.25rem !important;
}

.products-grid.horizontal-mode .product-card .btn-circle.btn-xs svg {
  width: 0.625rem !important;
  height: 0.625rem !important;
}

/* Стили для очень маленьких экранов */
@media (max-width: 320px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Исправления для десктопа - занимаем всю ширину */
.content-wrapper {
  width: 100%;
}

.main-content:not(.horizontal-orientation) .container {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
}

/* Убираем ограничения по максимальной ширине для десктопа */
@media (min-width: 768px) {
  .main-content:not(.horizontal-orientation) .container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .products-grid.vertical-mode {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1024px) {
  .main-content:not(.horizontal-orientation) .container {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  
  .products-grid.vertical-mode {
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
    gap: 0.75rem !important;
  }
  
  /* Фиксированный заголовок - учитываем сайдбар */
  div.fixed.top-12 {
    padding-left: 17rem !important;
  }
}

/* Улучшаем сетку для десктопных экранов */
@media (min-width: 1280px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1536px) {
  .main-content:not(.horizontal-orientation) .container {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }
  
  .products-grid.vertical-mode {
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
    gap: 1rem !important;
  }
}

@media (min-width: 1920px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
    gap: 1.25rem !important;
  }
  
  .main-content:not(.horizontal-orientation) .container {
    padding-left: 3rem !important;
    padding-right: 3rem !important;
  }
}

@media (min-width: 2560px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    gap: 1.5rem !important;
  }
}

/* Улучшения для планшетов в альбомной ориентации */
@media (min-width: 1024px) and (orientation: landscape) {
  .products-grid.horizontal-mode {
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1280px) and (orientation: landscape) {
  .products-grid.horizontal-mode {
    grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  }
}

/* Улучшаем отображение карточек на десктопе */
@media (min-width: 1024px) {
  .product-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .product-image {
    min-height: 150px;
    max-height: 180px;
  }
  
  .card-title {
    font-size: 0.95rem !important;
    line-height: 1.4;
  }
  
  .description {
    font-size: 0.85rem !important;
  }
  
  .price {
    font-size: 1.1rem !important;
  }
  
  /* Кнопки на десктопе */
  .product-card .btn-circle.btn-xs {
    width: 1.5rem !important;
    height: 1.5rem !important;
    opacity: 1;
  }
  
  .product-card .btn-circle.btn-xs:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  .product-card .btn-circle.btn-xs svg {
    width: .9rem !important;
    height: .9rem !important;
  }
}

/* Исправление для фиксированного заголовка на мобильных */
@media (min-width: 640px) {
  div.fixed.top-12 {
    top: 3rem !important;
    padding-left: 5rem !important;
    padding-right: 1rem !important;
  }
}

@media (min-width: 768px) {
  div.fixed.top-12 {
    padding-left: 5rem !important;
  }
}

/* Улучшаем отображение карточек на больших экранах */
@media (min-width: 1920px) {
  .product-card {
    border-radius: 0.75rem;
    padding: 1rem !important;
  }
  
  .product-image {
    min-height: 160px !important;
    max-height: 200px !important;
  }
  
  .card-title {
    font-size: 1rem !important;
    line-height: 1.4;
  }
  
  .description {
    font-size: 0.875rem !important;
  }
  
  .price {
    font-size: 1.25rem !important;
  }
}

/* Улучшаем адаптивность для узких десктопов */
@media (min-width: 1024px) and (max-width: 1366px) {
  .products-grid.vertical-mode {
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  }
}

/* Стили для горизонтальной ориентации (основной класс) */
.main-content.horizontal-orientation {
  margin-left: 64px;
}

/* Для очень маленьких экранов в горизонтальной ориентации */
@media (max-width: 740px) and (orientation: landscape) {
  .main-content.horizontal-orientation {
    margin-left: 60px;
  }
}

/* Очень маленькие экраны (вертикальная ориентация) */
@media (max-width: 375px) {
  .product-image {
    height: 130px;
  }
  
  .card-title {
    font-size: 0.9rem;
    margin-top: 6px;
  }
  
  .description {
    font-size: 0.7rem;
  }
}
</style>

<script setup>
import Header from '~/components/layout/Header.vue'
import MobileNavFooter from '~/components/layout/MobileNavFooter.vue'
import { useCart } from '@/composables/useCart'
import { useAppState } from '@/composables/useAppState'
import { useMobileDetection } from '@/composables/useMobileDetection'

const appState = useAppState()
const { addToCart, cartItems } = useCart()
const { $notify } = useNuxtApp()
const { isMobile } = useMobileDetection()

// Добавляем состояние загрузки
const isLoading = ref(true)
const isHorizontal = ref(false)

const checkOrientation = () => {
  if (process.client) {
    const width = window.innerWidth
    const height = window.innerHeight
    const isLandscape = width > height
    
    // Определяем десктоп
    const isDesktop = width > 1024
    
    // Для десктопа всегда используем вертикальный режим
    if (isDesktop) {
      isHorizontal.value = false
    } else {
      // Для мобильных: горизонтальный режим только в ландшафте
      const isMobileDevice = width <= 768
      if (isMobileDevice) {
        isHorizontal.value = isLandscape && width <= 926
      } else {
        // Для планшетов: более широкая проверка
        isHorizontal.value = isLandscape && width <= 1024
      }
    }
    
    console.log('Orientation check:', {
      width,
      height,
      isLandscape,
      isHorizontal: isHorizontal.value
    })
    
    // Завершаем загрузку
    isLoading.value = false
  }
}

// Получаем избранные товары из appState
const favoriteProducts = computed(() => {
  return appState.products.value.filter(product => product.isFavorite)
})

// Проверка, есть ли товар уже в корзине
const isInCart = (productId) => {
  return cartItems.value?.some(item => item.id === productId.toString()) || false
}

// Форматирование цены
const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₽'
  return `${price.toLocaleString('ru-RU')} ₽`
}

// Обработчик ошибки изображения
const handleImageError = (event) => {
  event.target.src = '/images/placeholder.jpg'
}

// Добавление в корзину
const handleAddToCart = async (product) => {
  try {
    await addToCart(product)
  } catch (error) {
    $notify.error('Не удалось добавить товар в корзину', 'Ошибка')
  }
}

// Переключение избранного
const handleToggleFavorite = (product) => {
  appState.toggleFavorite(product.id)
  // $notify.info('Товар удален из избранного')
}

// Очистка всех избранных
const clearAllFavorites = () => {
  favoriteProducts.value.forEach(product => {
    if (product.isFavorite) {
      appState.toggleFavorite(product.id)
    }
  })
  // $notify.success('Все товары удалены из избранного')
}

// Инициализация
onMounted(() => {
  if (process.client) {
    // Первоначальная проверка
    checkOrientation()
    
    // Добавляем небольшую задержку для стабилизации
    setTimeout(() => {
      checkOrientation()
    }, 50)
    
    // Подписываемся на события
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100)
    })
    
    // Прокрутка к верху
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
  }
})

// Устанавливаем заголовок страницы
useHead({
  title: 'Избранное'
})
</script>