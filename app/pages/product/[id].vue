<!-- pages/product/[id].vue -->
<template lang="pug">
//- Страница товара
.min-h-screen.bg-base-100.text-base-content.flex.flex-col(
  :class="{ 'horizontal-orientation': isHorizontal }"
)
  Header
  //- Закрепленные хлебные крошки
  .sticky.top-0.z-10.bg-base-100.border-b.border-base-200.shadow-sm
    .container.min-h-10.mx-auto.px-2(class="sm:hidden lg:p-4")
      nav(aria-label="Хлебные крошки")
        .breadcrumbs.pt-2.pb-1.text-sm.overflow-x-auto.whitespace-nowrap(class="sm:pl-14 lg:text-sm text-base-content/70")
          ul.flex
            li
              NuxtLink.link.link-hover(to="/" aria-label="Перейти на главную страницу") Главная
            li(aria-current="page")
              span {{ product?.name || 'Товар не найден' }}

  //- Основной контент с прокруткой
  .flex-1.overflow-auto.flex.flex-col
    .container.mx-auto.px-2.flex-1(
      class="lg:p-4"
      :class="{ 'horizontal-layout': isHorizontal }"
    )
      //- Состояние загрузки
      .flex.flex-col.items-center.justify-center.min-h-96(v-if="isLoading")
        .loading.loading-spinner.loading-lg(aria-label="Загрузка товара")
        span.mt-4.text-center Загрузка товара...

      //- Ошибка
      .flex.flex-col.items-center.justify-center.min-h-96(v-else-if="error || !product")
        .text-center
          .text-5xl.mb-4.text-error(class="lg:text-6xl" role="img" aria-label="Грустный смайлик") 😔
          h1.text-xl.font-bold.mb-4(class="lg:text-2xl") Товар не найден
          p.mb-6.text-sm(class="lg:text-base text-base-content/70") {{ error || 'Запрошенный товар не существует' }}
          .flex.flex-col.gap-3.w-full.max-w-xs(class="sm:flex-row sm:max-w-none")
            button.btn.btn-primary.btn-sm(@click="$router.back()" class="sm:btn-md") Вернуться назад
            NuxtLink.btn.btn-secondary.btn-sm(to="/" class="sm:btn-md") В каталог

      //- Контент товара
      template(v-else)
        .flex.flex-col(
          class="lg:flex-row lg:gap-6"
          :class="{ 'horizontal-product-layout': isHorizontal }"
        )
          //- Изображение товара
          .product-image.flex-1(
            :class="{ 'horizontal-image-section': isHorizontal }"
          )
            //- Основное изображение с увеличением и навигацией
            .main-image-container.mb-3(
              class="lg:mb-4"
              :class="{ 'horizontal-main-image-container': isHorizontal, 'swiping': !isHorizontal && (isSwiping || isDragging) }"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseLeave"
            )
              .w-full.max-h-60.text-center.rounded-xl.bg-base-200.overflow-hidden.relative(
                class="lg:max-h-96"
                :class="{ 'horizontal-main-image': isHorizontal }"
                :style="isHorizontal ? horizontalImageStyle : {}"
                ref="imageContainer"
              )
                //- Кнопка "Назад" для навигации по изображениям
                button.image-nav-btn.prev-btn(
                  v-if="productGallery.length > 1"
                  @click.stop="prevImage"
                  @touchstart.stop.prevent="prevImage"
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 z-20"
                  :class="{ 'horizontal-nav-btn': isHorizontal, 'horizontal-nav-btn-active': isHorizontal && productGallery.length > 1 }"
                  aria-label="Предыдущее изображение"
                )
                  svg.w-6.h-6.text-white.opacity-80(
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  )
                    path(stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7")

                //- Skeleton для основного изображения
                .skeleton.w-full.h-60.rounded-xl(
                  v-if="!mainImageLoaded && currentImage"
                  :key="`skeleton-main-${product.id}-${currentImageIndex}`"
                  class="lg:h-96"
                  :class="{ 'horizontal-skeleton': isHorizontal }"
                  aria-hidden="true"
                )
                
                //- Контейнер для слайдов изображений
                .image-slides-container(
                  ref="slidesContainer"
                  :style="{ transform: `translateX(${slideOffset}px)` }"
                  class="flex transition-transform duration-300 ease-out w-full h-full"
                )
                  .image-slide(
                    v-for="(image, index) in productGallery"
                    :key="`slide-${product.id}-${index}`"
                    class="flex-shrink-0 w-full h-full relative"
                  )
                    //- Изображение для мобильных устройств
                    ClientOnly
                      template(v-if="isMobile")
                        .mobile-image-container(
                          v-show="mainImageLoaded && index === currentImageIndex"
                          class="w-full h-full"
                        )
                          img(
                            :src="image"
                            :alt="`Изображение товара: ${product.name}`"
                            class="w-full h-full object-contain cursor-zoom-in"
                            @load="handleMainImageLoad"
                            @error="handleMainImageError"
                            @click.stop="openMobileZoomModal(index)"
                          )
                      template(v-else)
                        ImageZoom(
                          v-show="mainImageLoaded && index === currentImageIndex"
                          :src="image"
                          :alt="`Изображение товара: ${product.name}`"
                          :max-height="isHorizontal ? '300' : '400'"
                          zoom-type="magnifier"
                          :zoom-level="2"
                          :show-zoom-button="false"
                          :magnifier-size="isHorizontal ? 600 : 800"
                          class="w-full h-full object-contain"
                          :class="{ 'horizontal-zoom-image': isHorizontal }"
                          @load="handleMainImageLoad"
                          @error="handleMainImageError"
                        )

                //- Кнопка "Вперед" для навигации по изображениям
                button.image-nav-btn.next-btn(
                  v-if="productGallery.length > 1"
                  @click.stop="nextImage"
                  @touchstart.stop.prevent="nextImage"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 z-20"
                  :class="{ 'horizontal-nav-btn': isHorizontal, 'horizontal-nav-btn-active': isHorizontal && productGallery.length > 1 }"
                  aria-label="Следующее изображение"
                )
                  svg.w-6.h-6.text-white.opacity-80(
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  )
                    path(stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7")

                //- Иконка лупы для увеличения изображения (только на мобильных)
                button.zoom-icon-btn(
                  v-if="isMobile"
                  @click.stop="openMobileZoomModal(currentImageIndex)"
                  @touchstart.stop="openMobileZoomModal(currentImageIndex)"
                  class="absolute bottom-4 right-4 z-30 w-12 h-12 rounded-full bg-black/30 bg-opacity-70 flex items-center justify-center transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                  :class="{ 'horizontal-zoom-icon-btn': isHorizontal }"
                  aria-label="Увеличить изображение"
                )
                  svg.w-6.h-6.text-white(
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  )
                    path(stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7")

                //- Индикатор текущего изображения (точки)
                .image-indicator(
                  v-if="productGallery.length > 1"
                  class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2"
                )
                  .indicator-dot(
                    v-for="(image, index) in productGallery"
                    :key="`indicator-${index}`"
                    @click.stop="goToImage(index)"
                    @touchstart.stop="goToImage(index)"
                    :class="{ 'active': index === currentImageIndex }"
                    class="w-2 h-2 rounded-full cursor-pointer transition-all duration-300"
                    :style="index === currentImageIndex ? 'background-color: white; transform: scale(1.2);' : 'background-color: rgba(255, 255, 255, 0.5);'"
                    :aria-label="`Перейти к изображению ${index + 1}`"
                  )

          //- Информация о товаре
          .product-info.flex-1(
            :class="{ 'horizontal-info-section': isHorizontal }"
          )
            .card.bg-base-100.shadow-lg(class="lg:shadow-xl")
              .card-body.p-2.mt-2(class="lg:p-6")
                //- Заголовок и избранное
                .flex.justify-between.items-center.mb-1(class="lg:mb-4")
                  h1.card-title.text-xl.text-base-content(
                    class="lg:text-2xl"
                    :class="{ 'horizontal-title': isHorizontal }"
                  ) {{ product.name }}
                  ClientOnly
                    button.btn.btn-circle.btn-xs(
                      :class="product.isFavorite ? '' : 'btn-ghost'"
                      @click="toggleFavorite"
                      @keydown.enter="toggleFavorite"
                      @keydown.space="toggleFavorite"
                      :title="product.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
                      :aria-label="product.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
                      class="lg:btn-sm focus:outline-none"
                    )
                      svg.w-4.h-4(
                        :class="product.isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-secondary'", 
                        xmlns="http://www.w3.org/2000/svg", 
                        viewBox="0 0 24 24", 
                        stroke-width="2"
                        aria-hidden="true"
                      )
                        path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")

                //- Категории
                .flex.flex-wrap.gap-1.mb-1(
                  class="lg:gap-2 lg:mb-4"
                  :class="{ 'horizontal-categories': isHorizontal }"
                )
                  .badge.badge-sm.border-gray-400.rounded-sm(
                    v-for="category in product.categories"
                    :key="category"
                    class="lg:badge-sm"
                  ) 
                    span.text-gray-400 {{ category }}

                //- Описание
                .text-base-content.mb-1(
                  class="lg:mb-4"
                  :class="{ 'horizontal-description': isHorizontal }"
                )
                  p.text-xs(class="lg:text-sm") {{ product.description }}

                //- Цена и наличие
                .flex.flex.items-center.gap-3(
                  class="lg:flex-row lg:items-center lg:justify-between lg:mb-6"
                  :class="{ 'horizontal-price-stock': isHorizontal }"
                )
                  .flex.items-center.justify-between
                    .price-section
                      .text-2xl.font-bold.text-sky-600 {{ formatPrice(product.price) }}
                      .text-xs(class="text-base-content/70") Включая НДС
                    
                    .stock-section.ml-8.mt-2
                      .badge.rounded-sm(
                        :class="product.inStock ? 'badge-success' : 'badge-error'"
                        class="lg:badge-lg"
                      ) 
                        span(v-if="product.inStock") ✓ В наличии
                        span(v-else) ✗ Нет в наличии
                      
                      .text-xs.mt-1(
                        class="text-base-content/70"
                        v-if="product.inStock && product.stockQuantity"
                      ) Осталось: {{ product.stockQuantity }} шт.

                //- Дополнительная информация
                .collapse.collapse-arrow.bg-base-200.mt-1(class="lg:mt-4")
                  input(type="checkbox" aria-label="Показать характеристики товара")
                  .collapse-title.text-base.font-medium.p-0(class="lg:text-lg lg:p-4") Характеристики
                  .collapse-content.p-0(class="lg:p-4")
                    .space-y-0(class="lg:space-y-2")
                      .flex.justify-between.py-1.border-b(class="lg:py-2 border-base-content/10")
                        span.text-xs(class="lg:text-sm text-base-content/70") Категории:
                        span.text-xs.font-medium.text-right(class="lg:text-sm") {{ product.categories?.join(', ') }}
                      .flex.justify-between.py-1.border-b(class="lg:py-2 border-base-content/10")
                        span.text-xs(class="lg:text-sm text-base-content/70") Код товара:
                        span.text-xs.font-medium(class="lg:text-sm") {{ '#' + product.id }}
                      .flex.justify-between.py-1.border-b(class="lg:py-2 border-base-content/10")
                        span.text-xs(class="lg:text-sm text-base-content/70") Статус:
                        span.text-xs.font-medium(
                          :class="product.inStock ? 'text-success' : 'text-error'"
                          class="lg:text-sm"
                        ) {{ product.inStock ? 'Доступен' : 'Недоступен' }}
                      .flex.justify-between.py-1.border-b(class="lg:py-2 border-base-content/10")
                        span.text-xs(class="lg:text-sm text-base-content/70") Дата добавления:
                        span.text-xs.font-medium(class="lg:text-sm") {{ formatDate(product.createdAt) }}

    //- Похожие товары
    section#similar-products-title(
      v-if="product && similarProducts.length > 0 && !isLoading && !error"
      ref="similarProductsSection"
      class="mb-8 lg:mt-12"
      :class="{ 'horizontal-similar-products': isHorizontal }"
      aria-labelledby="similar-products-title"
    )
      .container.mx-auto.px-2(class="lg:p-4")
        h2.text-xl.font-bold.mb-2(class="lg:text-2xl lg:mb-6") Похожие товары:
        .grid.grid-cols-2.gap-1(
          class="sm:grid-cols-3 lg:grid-cols-4 lg:gap-4"
          :class="{ 'horizontal-similar-grid': isHorizontal }"
        )
          .similar-product-card(
            v-for="similarProduct in similarProducts"
            :key="similarProduct.id"
          )
            .card.bg-base-100.shadow-md.transition-all.duration-300.h-full.flex.flex-col.group.hover-shadow-lg
              //- Кнопка избранного
              ClientOnly
                .absolute.top-1.left-2.z-10
                  button.btn.btn-circle.btn-xs(
                    :class="similarProduct.isFavorite ? 'btn-error' : 'btn-ghost bg-base-100/80'",
                    @click.stop="toggleSimilarFavorite(similarProduct.id)"
                    title="Добавить в избранное"
                  )
                    svg.w-4.h-4(
                      :class="similarProduct.isFavorite ? 'fill-current' : 'fill-none stroke-secondary'",
                      xmlns="http://www.w3.org/2000/svg",
                      viewBox="0 0 24 24",
                      stroke-width="2"
                    )
                      path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")
              
              //- Кнопка добавления в корзину
              ClientOnly
                .absolute.top-1.right-2.z-10
                  button.btn.btn-circle.btn-xs(
                    @click.stop="addSimilarToCart(similarProduct)"
                    :disabled="!similarProduct.inStock || isInCart(similarProduct.id)"
                    :title="isInCart(similarProduct.id) ? 'Уже в корзине' : 'Добавить в корзину'"
                    :class="isInCart(similarProduct.id) ? 'btn-success disabled:bg-green-700 disabled:text-white' : 'btn-primary'"
                  )
                    svg.w-6.h-6(
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    )
                      path(
                        v-if="!isInCart(similarProduct.id)"
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
              NuxtLink.flex-1.flex.flex-col(:to="`/product/${similarProduct.id}`")
                figure.p-1.pt-0.flex.justify-center.items-center(class="lg:h-40")
                  .w-full.flex.items-center.justify-center
                    img.rounded-lg.w-full.object-cover.max-w-full(
                      :src="similarProduct.image || '/images/placeholder.jpg'",
                      :alt="similarProduct.name",
                      @error="handleSimilarImageError"
                    )
                
                //- Информация о товаре
                .card-body.p-1.flex-1.flex.flex-col
                  //- Название и описание
                  .flex-1
                    h3.card-title.text-xs.font-semibold.text-base-content.line-clamp-2.mb-1(class="lg:text-sm") {{ similarProduct.name }}
                    p.text-xs.text-base-content.opacity-70.line-clamp-2.max-h-10(class="lg:text-xs") {{ similarProduct.description }}
                  
                  //- Цена и статус
                  .flex.items-center.justify-between.-mt-1.border-t.border-base-200
                    .text-md.font-bold.text-sky-600 {{ formatPrice(similarProduct.price) }}
                    .text-xs(
                      :class="similarProduct.inStock ? 'text-success' : 'text-error'"
                    ) {{ similarProduct.inStock ? 'В наличии' : 'Нет в наличии' }}

  //- Прикрепленная кнопка Добавить в корзину
  .fixed-bottom-cart-button(
    v-if="product && !isLoading && !error"
    class="lg:hidden"
    :class="{ 'horizontal-cart-button': isHorizontal }"
  )
    button.btn.btn-lg.w-full.rounded-t-lg.rounded-b-none.px-auto(
      :disabled="!product.inStock || isInCart(product.id)"
      @click="addToCartHandler"
      @keydown.enter="addToCartHandler"
      @keydown.space="addToCartHandler"
      class="h-16 text-lg font-semibold transition-all duration-300"
      :class="isInCart(product.id) ? 'disabled:bg-green-700 disabled:text-white' : product.inStock ? 'btn-primary hover:bg-primary-focus' : 'btn-error disabled:bg-error disabled:text-white'"
      :aria-label="isInCart(product.id) ? 'Товар уже в корзине' : product.inStock ? `Добавить ${product.name} в корзину` : 'Товар недоступен'"
    )
      .flex.items-center.justify-center.w-full
        span(role="img" aria-hidden="true" class="text-xl mr-2")
          span(v-if="isInCart(product.id)") ✅
          span(v-else) 🛒
        span.flex-1.text-center
          span.mr-1
            span(v-if="isInCart(product.id)") Товар уже в корзине
            span(v-else-if="product.inStock") Добавить в корзину ·
            span(v-else) Товар закончился
          span.text-md.font-normal(
            v-if="!isInCart(product.id) && product.inStock"
          ) {{ formatPrice(product.price) }}

  //- Модальное окно для увеличенного изображения на мобильных
  ClientOnly
    .modal-overlay(
      v-if="isMobileZoomModalOpen && modalImageUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
      @click.self="closeMobileZoomModal"
      @touchstart.self="handleModalOverlayTouchStart"
    )
      //- Кнопка закрытия - всегда видима в правом верхнем углу
      button.close-button(
        @click="closeMobileZoomModal"
        class="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/40 bg-opacity-70 flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:bg-opacity-90 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        aria-label="Закрыть увеличенное изображение"
      )
        svg.w-6.h-6.text-white(
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        )
          path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12")
      
      //- Изображение в модальном окне
      .image-container(
        class="relative w-full h-full flex items-center justify-center p-4 select-none"
        @touchstart="handleModalTouchStart"
        @touchmove="handleModalTouchMove"
        @touchend="handleModalTouchEnd"
        @touchcancel="handleModalTouchEnd"
        @mousedown="handleModalMouseDown"
        @mousemove="handleModalMouseMove"
        @mouseup="handleModalMouseUp"
        @mouseleave="handleModalMouseLeave"
      )
        img(
          :src="modalImageUrl" 
          :alt="`Увеличенное изображение товара: ${product?.name || ''}`"
          class="max-w-full max-h-full object-contain select-none cursor-grab active:cursor-grabbing"
          :style="modalZoomStyle"
          ref="modalImage"
          draggable="false"
        )

  MobileNavFooter(v-if="isMobile")
</template>

<style scoped>
/* Существующие стили остаются */
.breadcrumbs > ul > li + li:before {
  opacity: 1;
}

/* Основной контейнер занимает всю высоту */
.min-h-screen {
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Контейнер контента с прокруткой */
.flex-1.overflow-auto {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

/* Закрепленные хлебные крошки */
.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Прикрепленная кнопка корзины */
.fixed-bottom-cart-button {
  position: fixed;
  bottom: 57px;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 0 6px;
}

.fixed-bottom-cart-button .btn {
  margin: 0;
  height: 52px;
}

.main-image-container {
  width: 100%;
  position: relative;
  touch-action: pan-y pinch-zoom;
  user-select: none;
}

/* Стили для похожих товаров на мобильных */
#similar-products-title {
  padding-top: 14px;
}

.similar-product-item {
  transition: all 0.3s ease;
}

/* Плавные переходы */
.collapse {
  transition: all 0.3s ease;
}

/* Анимации для кнопок */
.btn {
  transition: all 0.3s ease;
}

btn-error {
  background: oklch(55% 0.2 40);
}

/* Стили для изображений */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Адаптивность */
@media (max-width: 768px) {
  .card-actions .flex {
    flex-direction: column;
  }
  
  .card-actions .btn {
    width: 100%;
  }

  /* Улучшенная читаемость на мобильных */
  .breadcrumbs ul {
    padding-bottom: 2px;
  }
  
  .product-info .card-body {
    padding: 2px;
  }
}

@media (min-width: 1024px) {
  .similar-product-item .flex {
    flex-direction: column;
  }

  /* На десктопе скрываем прикрепленную кнопку */
  .fixed-bottom-cart-button {
    display: none;
  }

  /* На десктопе убираем отступ снизу */
  .flex-1.overflow-auto {
    padding-bottom: 0;
  }
}

/* Стили как на главной странице */
.product-image {
  position: relative;
}

.card {
  transform: translateY(0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Стили для skeleton */
.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Обрезка текста */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Гарантия что контент не обрезается */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#__nuxt {
  height: 100dvh;
  overflow: hidden;
}

/* Улучшенные хлебные крошки - полное название */
.breadcrumbs {
  white-space: nowrap;
  overflow-x: auto;
}

.breadcrumbs ul {
  flex-wrap: nowrap;
}

.breadcrumbs span {
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
}

/* Улучшенная доступность для фокуса */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Плавные переходы для всех интерактивных элементов */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

/* Стили для унифицированных карточек похожих товаров */
.similar-product-card {
  height: 100%;
}

.similar-product-card .card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.similar-product-card img {
  object-fit: contain !important;
  max-width: 100%;
}

/* Убедимся, что изображения не обрезаются */
figure {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Гарантия одинаковой высоты карточек */
.similar-products-grid .card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Выравнивание контента по горизонтали */
.similar-products-grid .card-body > div {
  width: 100%;
}

/* Единообразные отступы */
.similar-products-grid .card-title {
  min-height: 2.5em;
}

.similar-products-grid .text-xs {
  line-height: 1.4;
}

.fixed-bottom-cart-button .btn:not(:disabled) {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Для товаров не в наличии */
.fixed-bottom-cart-button .btn:disabled {
  animation: none;
}

/* ===== СТИЛИ ДЛЯ ГОРИЗОНТАЛЬНОЙ ОРИЕНТАЦИИ ===== */

/* Основной контейнер для горизонтальной ориентации */
.min-h-screen.horizontal-orientation {
  height: 100dvh;
  overflow: hidden;
}

/* Контейнер контента в горизонтальной ориентации */
.flex-1.overflow-auto {
  flex: 1;
  padding-top: 1px;
}

/* Контейнер с классом horizontal-layout - ВОССТАНАВЛИВАЕМ ПЕРВОНАЧАЛЬНЫЕ ОТСТУПЫ */
.container.mx-auto.px-2.horizontal-layout {
  padding-left: 62px !important;
  padding-right: 8px;
  max-width: 100%;
}

/* Основной контент товара в горизонтальной ориентации - ВОССТАНАВЛИВАЕМ ПЕРВОНАЧАЛЬНЫЕ ОТСТУПЫ */
.flex-col.horizontal-product-layout {
  flex-direction: row !important;
  gap: 12px;
  overflow: hidden;
  margin-left: 10px !important;
}

/* Секция с изображением в горизонтальной ориентации */
.product-image.horizontal-image-section {
  flex: 1;
  max-width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 9px;
}

/* Контейнер основного изображения в горизонтальной ориентации */
.main-image-container.horizontal-main-image-container {
  height: 70%;
}

/* Основное изображение в горизонтальной ориентации */
.main-image-container .horizontal-main-image {
  max-height: 100% !important;
  height: 100%;
}

/* Skeleton для горизонтальной ориентации */
.skeleton.horizontal-skeleton {
  height: 100% !important;
}

/* Изображение с увеличением в горизонтальной ориентации */
.horizontal-zoom-image {
  max-height: 100% !important;
  height: 100%;
  object-fit: contain;
}

/* Кнопки навигации в горизонтальной ориентации */
.image-nav-btn.horizontal-nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.image-nav-btn.horizontal-nav-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}

.image-nav-btn.horizontal-nav-btn svg {
  width: 20px;
  height: 20px;
}

/* Активные кнопки навигации в горизонтальном режиме */
.image-nav-btn.horizontal-nav-btn-active {
  width: 40px !important;
  height: 40px !important;
  background: rgba(0, 0, 0, 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.image-nav-btn.horizontal-nav-btn-active svg {
  width: 24px !important;
  height: 24px !important;
}

/* Индикатор в горизонтальной ориентации */
.image-indicator.horizontal-indicator {
  bottom: 8px;
}

.image-indicator.horizontal-indicator .indicator-dot {
  width: 6px;
  height: 6px;
}

/* Секция с информацией в горизонтальной ориентации */
.product-info.horizontal-info-section {
  flex: 1;
  max-width: 50%;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
  margin-top: -14px;
}

/* Заголовок в горизонтальной ориентации */
.card-title.horizontal-title {
  font-size: 1.1rem !important;
  line-height: 1.3;
}

/* Категории в горизонтальной ориентации */
.flex-wrap.horizontal-categories {
  max-height: 40px;
  overflow-y: auto;
}

/* Описание в горизонтальной ориентации */
.text-base-content.horizontal-description {
  max-height: 80px;
  overflow-y: auto;
  font-size: 0.75rem !important;
  line-height: 1.2;
}

/* Цена и наличие в горизонтальной ориентации */
.flex.horizontal-price-stock {
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 8px;
}

/* Похожие товары в горизонтальной ориентации - ВОССТАНАВЛИВАЕМ ПЕРВОНАЧАЛЬНЫЕ ОТСТУПЫ */
section.horizontal-similar-products {
  margin-left: 64px !important;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.grid.horizontal-similar-grid {
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 8px;
}

/* Кнопка корзины в горизонтальной ориентации - ВОССТАНАВЛИВАЕМ ПЕРВОНАЧАЛЬНУЮ ПОЗИЦИЮ */
.fixed-bottom-cart-button.horizontal-cart-button {
  bottom: 0;
  left: 54% !important;
  right: 0 !important;
  padding: 0 auto !important;
  max-width: none !important;
  transform: none !important;
}

.fixed-bottom-cart-button.horizontal-cart-button .btn {
  height: 48px;
  font-size: 1.1rem;
}

/* ===== СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА УВЕЛИЧЕНИЯ ===== */

/* Анимация появления модального окна */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

/* Стили для кнопки закрытия модального окна */
.close-button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.685);
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

/* Обеспечиваем видимость кнопки закрытия в горизонтальном режиме */
@media (max-width: 926px) and (orientation: landscape) {
  .close-button {
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
  }
  
  .close-button svg {
    width: 20px;
    height: 20px;
  }
}

/* ===== СТИЛИ ДЛЯ ИКОНКИ ЛУПЫ ===== */

.zoom-icon-btn {
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
}

.zoom-icon-btn:hover {
  transform: scale(1.1);
  background-color: rgba(0, 0, 0, 0.7);
}

.zoom-icon-btn:active {
  transform: scale(0.95);
}

/* УВЕЛИЧЕННАЯ КНОПКА ЛУПЫ В ГОРИЗОНТАЛЬНОМ РЕЖИМЕ */
.zoom-icon-btn.horizontal-zoom-icon-btn {
  width: 56px !important;
  height: 56px !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 40 !important;
  background-color: rgba(0, 0, 0, 0.384) !important;
}

.zoom-icon-btn.horizontal-zoom-icon-btn svg {
  width: 28px !important;
  height: 28px !important;
}

/* Дополнительные улучшения для горизонтального режима */
@media (max-width: 926px) and (orientation: landscape) {
  .zoom-icon-btn.horizontal-zoom-icon-btn {
    width: 52px !important;
    height: 52px !important;
    bottom: 16px !important;
    right: 16px !important;
  }
  
  .zoom-icon-btn.horizontal-zoom-icon-btn svg {
    width: 26px !important;
    height: 26px !important;
  }
}

/* Для очень маленьких экранов в горизонтальном режиме */
@media (max-height: 400px) and (orientation: landscape) {
  .zoom-icon-btn.horizontal-zoom-icon-btn {
    width: 48px !important;
    height: 48px !important;
    bottom: 12px !important;
    right: 12px !important;
  }
  
  .zoom-icon-btn.horizontal-zoom-icon-btn svg {
    width: 24px !important;
    height: 24px !important;
  }
}

/* Адаптация иконки лупы для горизонтального режима */
@media (max-height: 500px) and (orientation: landscape) {
  .zoom-icon-btn:not(.horizontal-zoom-icon-btn) {
    width: 40px;
    height: 40px;
    bottom: 12px;
    right: 12px;
  }
  
  .zoom-icon-btn:not(.horizontal-zoom-icon-btn) svg {
    width: 20px;
    height: 20px;
  }
}

/* Для темной темы */
@media (prefers-color-scheme: dark) {
  .zoom-icon-btn {
    background-color: rgba(0, 0, 0, 0.048);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .zoom-icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .zoom-icon-btn.horizontal-zoom-icon-btn {
    background-color: rgba(0, 0, 0, 0.438) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
  }
}

/* ===== СТИЛИ ДЛЯ НАВИГАЦИИ ИЗОБРАЖЕНИЙ ===== */

/* Кнопки навигации по изображениям */
.image-nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;
  z-index: 20;
}

.image-nav-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  opacity: 1;
  transform: scale(1.1);
}

.image-nav-btn.prev-btn {
  left: 12px;
}

.image-nav-btn.next-btn {
  right: 12px;
}

/* Контейнер для слайдов */
.image-slides-container {
  width: 100%;
  height: 100%;
}

.image-slide {
  width: 100%;
  height: 100%;
}

/* Индикатор текущего изображения */
.image-indicator {
  z-index: 20;
}

.indicator-dot {
  transition: all 0.3s ease;
  cursor: pointer;
}

.indicator-dot:hover {
  transform: scale(1.3);
  background-color: rgba(255, 255, 255, 0.8) !important;
}

.indicator-dot.active {
  background-color: white !important;
  transform: scale(1.4);
}

/* Адаптация для разных размеров экрана в горизонтальной ориентации */
@media (max-width: 740px) and (orientation: landscape) {
  .container.mx-auto.px-2.horizontal-layout {
    padding-left: 50px;
  }
  
  .flex-col.horizontal-product-layout {
    gap: 8px;
    height: calc(100dvh - 130px);
  }
  
  .product-image.horizontal-image-section {
    max-width: 45%;
  }
  
  .product-info.horizontal-info-section {
    max-width: 55%;
  }
  
  .fixed-bottom-cart-button.horizontal-cart-button {
    left: 50px;
  }
  
  .grid.horizontal-similar-grid {
    grid-template-columns: repeat(1, 1fr) !important;
  }
  
  /* Кнопки навигации на маленьких экранах */
  .image-nav-btn {
    width: 32px;
    height: 32px;
  }
  
  .image-nav-btn svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .main-image-container.horizontal-main-image-container {
    height: 60%;
  }
  
  .product-info.horizontal-info-section {
    padding-top: 4px;
  }
  
  .text-base-content.horizontal-description {
    max-height: 60px;
    font-size: 0.7rem !important;
  }
  
  /* Еще меньше кнопки на очень маленьких экранах */
  .image-nav-btn {
    width: 28px;
    height: 28px;
  }
  
  .image-nav-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .image-indicator.horizontal-indicator .indicator-dot {
    width: 4px;
    height: 4px;
  }
}

/* Анимация появления горизонтального режима */
@keyframes slideInHorizontal {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.horizontal-orientation .container.mx-auto.px-2.horizontal-layout,
.horizontal-orientation .flex-col.horizontal-product-layout {
  animation: slideInHorizontal 0.3s ease-out;
}

/* Прокрутка для длинных элементов */
.horizontal-info-section::-webkit-scrollbar {
  width: 4px;
}

.horizontal-info-section::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.horizontal-info-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.horizontal-info-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Анимация перехода слайдов */
.image-slides-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Стили для активного свайпа */
.main-image-container.swiping {
  cursor: grabbing;
}

/* Улучшенная видимость кнопок на светлых изображениях */
.image-nav-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.image-nav-btn svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Для темной темы */
@media (prefers-color-scheme: dark) {
  .image-nav-btn {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .image-nav-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .indicator-dot {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
  
  .indicator-dot.active {
    background-color: rgba(255, 255, 255, 0.9) !important;
  }
}

/* Запрет выделения текста и изображений */
img, div {
  -webkit-touch-callout: none;
  -webkit-user-drag: none;
  user-select: none;
}

/* Анимация появления */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Эффект нажатия для изображения */
img:active {
  cursor: grabbing;
}

/* Стили для курсора */
.cursor-zoom-in {
  cursor: zoom-in;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* Улучшенные стили для модального окна */
.modal-overlay {
  z-index: 9999;
}

.image-container {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Обеспечиваем что кнопка закрытия всегда сверху */
.close-button {
  z-index: 10000;
}

/* Улучшаем доступность для кнопки лупы */
.zoom-icon-btn:focus {
  outline: 2px solid white;
  outline-offset: 2px;
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.zoom-icon-btn.horizontal-zoom-icon-btn:focus {
  outline: 3px solid white;
  outline-offset: 3px;
}

/* Улучшаем видимость кнопки лупы в горизонтальном режиме */
.min-h-screen.horizontal-orientation .zoom-icon-btn.horizontal-zoom-icon-btn {
  background-color: rgba(0, 0, 0, 0.4) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.min-h-screen.horizontal-orientation .zoom-icon-btn.horizontal-zoom-icon-btn:hover {
  background-color: rgba(0, 0, 0, 1) !important;
  transform: scale(1.15) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
}

/* Дополнительная область нажатия для кнопки лупы */
.zoom-icon-btn::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  z-index: -1;
}

.zoom-icon-btn.horizontal-zoom-icon-btn::before {
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
}

/* Убираем точку индикатора в горизонтальном режиме */
.horizontal-orientation .image-indicator {
  display: none !important;
}

/* Увеличиваем кнопки навигации в горизонтальном режиме */
.horizontal-orientation .image-nav-btn.horizontal-nav-btn-active {
  width: 44px !important;
  height: 44px !important;
}

.horizontal-orientation .image-nav-btn.horizontal-nav-btn-active svg {
  width: 26px !important;
  height: 26px !important;
}
</style>

<script setup>
import Header from '~/components/layout/Header.vue'
import MobileNavFooter from '~/components/layout/MobileNavFooter.vue'
import ImageZoom from '~/components/ui/ImageZoom.vue'

// Импортируем композаблы для мобильного режима и ориентации
import { useMobileDetection } from '@/composables/useMobileDetection'

// Флаг для предотвращения гидратационных ошибок
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// Используем глобальный composable для состояния
const {
  products,
  loadProducts,
  toggleFavorite: toggleFavoriteGlobal
} = useAppState()

// Импортируем корзину
import { useCart } from '@/composables/useCart'

const route = useRoute()
const router = useRouter()
const { $notify } = useNuxtApp()
const { addToCart, cartItems } = useCart()

// Используем композабл для мобильного режима
const { isMobile } = useMobileDetection()

// Состояние для горизонтальной ориентации
const isHorizontal = ref(false)

// Функция проверки наличия товара в корзине
const isInCart = (productId) => {
  return cartItems.value?.some(item => item.id === productId.toString()) || false
}

// Добавляем вычисляемое свойство для стилей изображения в горизонтальном режиме
const horizontalImageStyle = computed(() => {
  if (!isHorizontal.value || !process.client) return {}
  
  const headerHeight = 64
  const breadcrumbsHeight = 40
  const margins = 32
  
  const availableHeight = window.innerHeight - headerHeight - breadcrumbsHeight - margins
  
  return {
    maxHeight: `${availableHeight}px`,
    height: '100%'
  }
})

const imageZoomHeight = computed(() => {
  return isHorizontal.value ? '300' : '400'
})

// ===== НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ УВЕЛИЧЕНИЯ НА МОБИЛЬНЫХ =====
const isMobileZoomModalOpen = ref(false)
const modalImage = ref(null)
const modalImageUrl = ref('')

// Переменные для жестов в модальном окне
const modalScale = ref(1)
const modalTranslate = ref({ x: 0, y: 0 })
const modalGestureType = ref(null) // 'pan', 'pinch' или 'tap'
const modalStartTouches = ref([])
const modalStartDistance = ref(0)
const modalStartTranslate = ref({ x: 0, y: 0 })
const modalStartScale = ref(1)
const lastTapTime = ref(0)
const tapCount = ref(0)
const isMouseDown = ref(false)

// Стили для модального окна
const modalZoomStyle = computed(() => {
  return {
    transform: `translate(${modalTranslate.value.x}px, ${modalTranslate.value.y}px) scale(${modalScale.value})`,
    transition: modalGestureType.value ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'center center',
    maxWidth: '100%',
    maxHeight: '100%',
    touchAction: 'none',
    willChange: modalGestureType.value ? 'transform' : 'auto',
  }
})

// Функция проверки ориентации
const checkOrientation = () => {
  if (process.client) {
    isHorizontal.value = window.innerWidth > window.innerHeight && window.innerWidth <= 926
  }
}

// Инициализация и очистка слушателей
const initOrientationListeners = () => {
  if (process.client) {
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
  }
}

const destroyOrientationListeners = () => {
  if (process.client) {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('orientationchange', checkOrientation)
  }
}

// ===== ПЕРЕМЕННЫЕ ДЛЯ СЛАЙДЕРА =====
const slidesContainer = ref(null)
const imageContainer = ref(null)
const slideOffset = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isSwiping = ref(false)
const isDragging = ref(false)
const dragStartX = ref(0)
const currentDragOffset = ref(0)

// ===== ФУНКЦИИ ДЛЯ УВЕЛИЧЕНИЯ НА МОБИЛЬНЫХ =====

// Открытие модального окна с увеличенным изображением
const openMobileZoomModal = (index = null) => {
  if (!isMobile.value || !product.value) return
  
  // Останавливаем всплытие событий
  event?.stopPropagation?.()
  event?.preventDefault?.()
  
  // Используем переданный индекс или текущий
  const imageIndex = index !== null ? index : currentImageIndex.value
  
  console.log('📱 Открытие модального окна увеличения')
  console.log('🖼 Используемый индекс:', imageIndex)
  console.log('🖼 Текущий индекс:', currentImageIndex.value)
  console.log('🖼 Всего изображений:', productGallery.value.length)
  
  // Проверяем, что индекс в пределах массива
  if (imageIndex < 0 || imageIndex >= productGallery.value.length) {
    console.error('❌ Некорректный индекс для модалки:', imageIndex)
    return
  }
  
  // Фиксируем текущее изображение для модального окна
  modalImageUrl.value = productGallery.value[imageIndex]
  console.log('🖼 URL для модалки:', modalImageUrl.value)
  
  isMobileZoomModalOpen.value = true
  modalScale.value = 1
  modalTranslate.value = { x: 0, y: 0 }
  modalGestureType.value = null
  modalStartTouches.value = []
  modalStartDistance.value = 0
  
  if (process.client) {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  }
}

// Закрытие модального окна
const closeMobileZoomModal = () => {
  console.log('📱 Закрытие модального окна увеличения')
  isMobileZoomModalOpen.value = false
  modalImageUrl.value = ''
  modalScale.value = 1
  modalTranslate.value = { x: 0, y: 0 }
  modalGestureType.value = null
  
  if (process.client) {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
}

// Обработчик касания по фону модального окна
const handleModalOverlayTouchStart = (event) => {
  // Проверяем, что касание было именно на фоне (не на изображении или кнопке закрытия)
  if (event.target === event.currentTarget) {
    event.preventDefault()
    closeMobileZoomModal()
  }
}

// Функция для ограничения перемещения изображения в пределах его границ
const clampModalTranslate = () => {
  if (!modalImage.value) return
  
  const image = modalImage.value
  const containerWidth = window.innerWidth - 32
  const containerHeight = window.innerHeight - 32
  
  const imageRect = image.getBoundingClientRect()
  const imageWidth = imageRect.width
  const imageHeight = imageRect.height
  
  const maxTranslateX = Math.max(0, (imageWidth * modalScale.value - containerWidth) / 2)
  const maxTranslateY = Math.max(0, (imageHeight * modalScale.value - containerHeight) / 2)
  
  modalTranslate.value = {
    x: Math.max(-maxTranslateX, Math.min(maxTranslateX, modalTranslate.value.x)),
    y: Math.max(-maxTranslateY, Math.min(maxTranslateY, modalTranslate.value.y))
  }
}

// Обработчики для жестов в модальном окне (общие для touch и mouse)
const handleModalTouchStart = (event) => {
  event.stopPropagation()
  
  let touches = []
  if (event.touches) {
    touches = Array.from(event.touches)
  } else {
    // Для мыши
    touches = [{
      clientX: event.clientX,
      clientY: event.clientY,
      identifier: 'mouse'
    }]
    isMouseDown.value = true
  }
  
  modalStartTouches.value = touches.map(t => ({ 
    x: t.clientX, 
    y: t.clientY,
    identifier: t.identifier
  }))
  modalStartTranslate.value = { ...modalTranslate.value }
  modalStartScale.value = modalScale.value
  
  if (touches.length === 2) {
    // Жест масштабирования (pinch)
    modalGestureType.value = 'pinch'
    const [touch1, touch2] = touches
    modalStartDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
  } else if (touches.length === 1) {
    // Одиночное касание - может быть tap или началом pan
    const currentTime = Date.now()
    const timeSinceLastTap = currentTime - lastTapTime.value
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Двойной тап - переключение масштаба
      modalGestureType.value = 'tap'
      tapCount.value++
      
      if (tapCount.value === 2) {
        if (modalScale.value === 1) {
          modalScale.value = 2
          // Центрируем изображение при увеличении
          modalTranslate.value = { x: 0, y: 0 }
        } else {
          modalScale.value = 1
          modalTranslate.value = { x: 0, y: 0 }
        }
        tapCount.value = 0
        lastTapTime.value = 0
      }
    } else {
      // Начало жеста перемещения или одиночного тапа
      modalGestureType.value = 'pan'
    }
  }
}

const handleModalTouchMove = (event) => {
  if (!modalGestureType.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  let touches = []
  if (event.touches) {
    touches = Array.from(event.touches)
  } else {
    // Для мыши
    if (!isMouseDown.value) return
    touches = [{
      clientX: event.clientX,
      clientY: event.clientY,
      identifier: 'mouse'
    }]
  }
  
  if (modalGestureType.value === 'pinch' && touches.length === 2) {
    // Масштабирование двумя пальцами
    const [touch1, touch2] = touches
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    if (modalStartDistance.value > 0) {
      const scale = modalStartScale.value * (currentDistance / modalStartDistance.value)
      modalScale.value = Math.max(1, Math.min(5, scale))
    }
  } else if (modalGestureType.value === 'pan' && touches.length === 1) {
    // Перемещение одним пальцем
    const touch = touches[0]
    const startTouch = modalStartTouches.value.find(t => t.identifier === touch.identifier)
    
    if (startTouch) {
      const deltaX = touch.clientX - startTouch.x
      const deltaY = touch.clientY - startTouch.y
      
      modalTranslate.value = {
        x: modalStartTranslate.value.x + deltaX,
        y: modalStartTranslate.value.y + deltaY
      }
      
      // Ограничиваем перемещение в пределах изображения
      clampModalTranslate()
    }
  }
}

const handleModalTouchEnd = (event) => {
  event.stopPropagation()
  
  const touches = Array.from(event.touches || [])
  
  if (touches.length === 0) {
    // Все касания завершены
    if (modalGestureType.value === 'tap') {
      const currentTime = Date.now()
      lastTapTime.value = currentTime
      
      // Если был одиночный тап, сбрасываем через время
      setTimeout(() => {
        if (tapCount.value === 1) {
          tapCount.value = 0
          lastTapTime.value = 0
        }
      }, 300)
    } else {
      // Для жестов pan и pinch плавно ограничиваем положение
      requestAnimationFrame(() => {
        clampModalTranslate()
        
        // Если масштаб близок к 1, сбрасываем к 1
        if (modalScale.value < 1.1) {
          modalScale.value = 1
          modalTranslate.value = { x: 0, y: 0 }
        }
      })
    }
    
    modalGestureType.value = null
    modalStartTouches.value = []
    isMouseDown.value = false
  }
}

// Обработчики для мыши (для десктопа)
const handleModalMouseDown = (event) => {
  handleModalTouchStart(event)
}

const handleModalMouseMove = (event) => {
  handleModalTouchMove(event)
}

const handleModalMouseUp = (event) => {
  handleModalTouchEnd(event)
}

const handleModalMouseLeave = (event) => {
  if (isMouseDown.value) {
    handleModalTouchEnd(event)
  }
}

// ===== ФУНКЦИИ ДЛЯ СЛАЙДЕРА =====

// Переход к конкретному изображению
const goToImage = (index) => {
  if (index >= 0 && index < productGallery.value.length) {
    currentImageIndex.value = index
    updateSlidePosition()
  }
}

// Следующее изображение
const nextImage = () => {
  if (productGallery.value.length > 0) {
    const nextIndex = (currentImageIndex.value + 1) % productGallery.value.length
    goToImage(nextIndex)
  }
}

// Предыдущее изображение
const prevImage = () => {
  if (productGallery.value.length > 0) {
    const prevIndex = (currentImageIndex.value - 1 + productGallery.value.length) % productGallery.value.length
    goToImage(prevIndex)
  }
}

// Обновление позиции слайда
const updateSlidePosition = () => {
  if (process.client && imageContainer.value) {
    const containerWidth = imageContainer.value.offsetWidth
    slideOffset.value = -currentImageIndex.value * containerWidth
  }
}

// Обработчик начала касания для слайдера
const handleTouchStart = (event) => {
  if (isMobileZoomModalOpen.value || isHorizontal.value) {
    return
  }
  
  if (productGallery.value.length <= 1) return
  
  touchStartX.value = event.touches[0].clientX
  isSwiping.value = true
}

// Обработчик движения при касании для слайдера
const handleTouchMove = (event) => {
  if (isMobileZoomModalOpen.value || isHorizontal.value || !isSwiping.value || productGallery.value.length <= 1) {
    return
  }
  
  touchEndX.value = event.touches[0].clientX
  const diff = touchEndX.value - touchStartX.value
  
  if (imageContainer.value) {
    const containerWidth = imageContainer.value.offsetWidth
    const maxOffset = (productGallery.value.length - 1) * containerWidth
    let newOffset = -currentImageIndex.value * containerWidth + diff
    
    newOffset = Math.max(-maxOffset, Math.min(0, newOffset))
    slideOffset.value = newOffset
  }
}

// Обработчик окончания касания для слайдера
const handleTouchEnd = () => {
  if (isMobileZoomModalOpen.value || isHorizontal.value || !isSwiping.value || productGallery.value.length <= 1) {
    return
  }
  
  const diff = touchEndX.value - touchStartX.value
  const threshold = 50
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      prevImage()
    } else {
      nextImage()
    }
  } else {
    updateSlidePosition()
  }
  
  isSwiping.value = false
  touchStartX.value = 0
  touchEndX.value = 0
}

// Обработчики для мыши (десктоп)
const handleMouseDown = (event) => {
  if (productGallery.value.length <= 1 || isHorizontal.value) return
  
  isDragging.value = true
  dragStartX.value = event.clientX
  currentDragOffset.value = slideOffset.value
}

const handleMouseMove = (event) => {
  if (!isDragging.value || productGallery.value.length <= 1 || isHorizontal.value) return
  
  const diff = event.clientX - dragStartX.value
  
  if (imageContainer.value) {
    const containerWidth = imageContainer.value.offsetWidth
    const maxOffset = (productGallery.value.length - 1) * containerWidth
    let newOffset = currentDragOffset.value + diff
    
    newOffset = Math.max(-maxOffset, Math.min(0, newOffset))
    slideOffset.value = newOffset
  }
}

const handleMouseUp = (event) => {
  if (!isDragging.value || productGallery.value.length <= 1 || isHorizontal.value) return
  
  const diff = event.clientX - dragStartX.value
  const threshold = 50
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      prevImage()
    } else {
      nextImage()
    }
  } else {
    updateSlidePosition()
  }
  
  isDragging.value = false
  dragStartX.value = 0
  currentDragOffset.value = 0
}

const handleMouseLeave = () => {
  if (isDragging.value && !isHorizontal.value) {
    isDragging.value = false
    updateSlidePosition()
  }
}

// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ КОМПОНЕНТА =====
const product = ref(null)
const currentImageIndex = ref(0)
const isLoading = ref(true)
const error = ref(null)
const imageLoaded = ref({})
const mainImageLoaded = ref(false)
const similarProductsSection = ref(null)

// Получение ID товара из параметров маршрута
const productId = computed(() => {
  const id = route.params.id
  return id
})

// Галерея изображений товара
const productGallery = computed(() => {
  if (!product.value) return []
  
  const images = []
  if (product.value.image) {
    images.push(product.value.image)
  }
  if (product.value.gallery && Array.isArray(product.value.gallery)) {
    images.push(...product.value.gallery)
  }
  if (images.length === 0) {
    images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K')
  }
  
  return images
})

// Текущее изображение
const currentImage = computed(() => {
  return productGallery.value[currentImageIndex.value] || ''
})

// Похожие товары
const similarProducts = computed(() => {
  if (!product.value || !products.value) return []
  
  return products.value
    .filter(p => 
      p.id !== product.value.id && 
      p.categories?.some(cat => 
        product.value.categories?.includes(cat)
      )
    )
    .slice(0, 4)
})

// ===== ОСНОВНЫЕ ФУНКЦИИ КОМПОНЕНТА =====

// Загрузка данных товара
const loadProductData = async () => {
  try {
    isLoading.value = true
    error.value = null
    product.value = null
    currentImageIndex.value = 0
    
    console.log('🔍 Поиск товара с ID:', productId.value)
    
    if (!products.value || products.value.length === 0) {
      console.log('⏳ Продукты не загружены, загружаем...')
      await loadProducts()
    }
    
    const foundProduct = products.value?.find(p => String(p.id) === String(productId.value))
    
    if (foundProduct) {
      product.value = { ...foundProduct }
      console.log('✅ Товар найден:', product.value.name)
      
      resetImageLoadingState()
      preloadMainImage()
      
      nextTick(() => {
        updateSlidePosition()
      })
    } else {
      error.value = `Товар с ID ${productId.value} не найден в каталоге`
      console.error('❌ Товар не найден. Доступные ID:', products.value?.map(p => p.id))
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки товара:', err)
    error.value = 'Произошла ошибка при загрузке товара'
  } finally {
    isLoading.value = false
  }
}

// Предзагрузка основного изображения
const preloadMainImage = () => {
  if (currentImage.value) {
    const img = new Image()
    img.src = currentImage.value
    img.onload = () => {
      mainImageLoaded.value = true
      console.log('✅ Основное изображение предзагружено')
    }
    img.onerror = () => {
      mainImageLoaded.value = false
      console.error('❌ Ошибка предзагрузки основного изображения')
    }
  }
}

// Сброс состояния загрузки изображений
const resetImageLoadingState = () => {
  imageLoaded.value = {}
  mainImageLoaded.value = false
}

// Обработчик загрузки основного изображения
const handleMainImageLoad = () => {
  mainImageLoaded.value = true
  console.log('✅ Основное изображение загружено')
}

// Обработчик ошибки загрузки основного изображения
const handleMainImageError = () => {
  mainImageLoaded.value = false
  console.error('❌ Ошибка загрузки основного изображения')
}

// Обработчик загрузки миниатюры
const handleThumbnailLoad = (productId, index) => {
  const key = `${productId}-${index}`
  imageLoaded.value[key] = true
  console.log(`✅ Миниатюра загружена: ${key}`)
}

// Обработчик ошибки загрузки миниатюры
const handleThumbnailError = (productId, index, event) => {
  const key = `${productId}-${index}`
  imageLoaded.value[key] = false
  console.error(`❌ Ошибка загрузки миниатюры: ${key}`)
  
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzRhNTU2OCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+RXJyb3I8L3RleHQ+Cjwvc3ZnPgo='
}

// Обработчик ошибки изображения для похожих товаров
const handleSimilarImageError = (event) => {
  event.target.src = '/images/placeholder.jpg'
}

// Выбор изображения из миниатюр
const selectImage = (index) => {
  goToImage(index)
}

// Надежная функция прокрутки к верху
const scrollToTop = () => {
  if (process.client) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}

// Прокрутка к похожим товарам
const scrollToSimilarProducts = () => {
  if (process.client && similarProductsSection.value) {
    similarProductsSection.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Автоматическая прокрутка к похожим товарам если товар не в наличии
const autoScrollToSimilarIfOutOfStock = () => {
  if (product.value && !product.value.inStock && similarProducts.value.length > 0) {
    setTimeout(() => {
      scrollToSimilarProducts()
    }, 3000)
  }
}

// Переход к похожему товару
const goToSimilarProduct = (similarProduct) => {
  scrollToTop()
  
  setTimeout(() => {
    router.push(`/product/${similarProduct.id}`)
  }, 10)
}

// Загрузка при монтировании
onMounted(async () => {
  isMounted.value = true
  await loadProductData()
  initOrientationListeners()
  nextTick(() => {
    scrollToTop()
    updateSlidePosition()
  })
})

// Очистка слушателей при размонтировании
onUnmounted(() => {
  destroyOrientationListeners()
  if (process.client) {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

// Отслеживание изменения ID в маршруте
watch(() => route.params.id, async (newId) => {
  console.log('🔄 ID товара изменился:', newId)
  await loadProductData()
  nextTick(() => {
    scrollToTop()
    updateSlidePosition()
  })
})

// Следим за изменением мобильного режима
watch(isMobile, (newVal) => {
  checkOrientation()
})

// Следим за изменением горизонтальной ориентации
watch(isHorizontal, (newVal) => {
  console.log(`🔄 Горизонтальная ориентация: ${newVal ? 'включена' : 'выключена'}`)
  
  nextTick(() => {
    if (newVal) {
      document.documentElement.style.height = '100dvh'
      document.body.style.height = '100dvh'
    } else {
      document.documentElement.style.height = ''
      document.body.style.height = ''
    }
    updateSlidePosition()
  })
})

// Следим за изменением текущего индекса изображения
watch(currentImageIndex, () => {
  updateSlidePosition()
})

// Следим за изменением размера окна для обновления позиции слайда
if (process.client) {
  window.addEventListener('resize', updateSlidePosition)
}

// Отслеживаем загрузку товара и запускаем авто-прокрутку если нужно
watch([product, similarProducts], ([newProduct, newSimilarProducts]) => {
  if (newProduct && newSimilarProducts && newSimilarProducts.length > 0) {
    setTimeout(() => {
      autoScrollToSimilarIfOutOfStock()
    }, 500)
  }
})

// Также отслеживаем загрузку продуктов
watch(products, (newProducts) => {
  if (newProducts && newProducts.length > 0 && !product.value) {
    console.log('🔄 Продукты загружены, повторная попытка найти товар')
    loadProductData()
  }
}, { immediate: true })

// Отслеживаем изменение текущего изображения
watch(currentImage, (newImage) => {
  if (newImage) {
    mainImageLoaded.value = false
    const img = new Image()
    img.src = newImage
    img.onload = () => {
      mainImageLoaded.value = true
    }
    img.onerror = () => {
      mainImageLoaded.value = false
    }
  }
})

// Функция форматирования цены
const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₽'
  return `${price.toLocaleString('ru-RU')} ₽`
}

// Функция форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return 'Неизвестно'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Обработчики событий товара
const addToCartHandler = async () => {
  if (product.value && !isInCart(product.value.id)) {
    try {
      await addToCart(product.value)
    } catch (error) {
      $notify.error('Не удалось добавить товар в корзину', 'Ошибка')
    }
  }
}

const toggleFavorite = () => {
  if (product.value) {
    toggleFavoriteGlobal(product.value.id)
    product.value.isFavorite = !product.value.isFavorite
  }
}

const goBack = () => {
  router.back()
}

// Исправленная функция поделиться
const shareProduct = async () => {
  if (!product.value) return
  
  const shareData = {
    title: product.value.name,
    text: product.value.description,
    url: window.location.href
  }
  
  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData)
      $notify.success('Товар успешно отправлен!', 'Поделиться')
    } else {
      await navigator.clipboard.writeText(window.location.href)
      $notify.success('Ссылка на товар скопирована в буфер обмена!', 'Поделиться')
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Ошибка при попытке поделиться:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        $notify.success('Ссылка на товар скопирована в буфер обмена!', 'Поделиться')
      } catch (clipboardError) {
        $notify.error('Не удалось поделиться товаром', 'Ошибка')
      }
    }
  }
}

// Обработчики для похожих товаров
const toggleSimilarFavorite = (productId) => {
  toggleFavoriteGlobal(productId)
}

const addSimilarToCart = async (similarProduct) => {
  if (!isInCart(similarProduct.id)) {
    try {
      await addToCart(similarProduct)
    } catch (error) {
      $notify.error('Не удалось добавить товар в корзину', 'Ошибка')
    }
  }
}
</script>