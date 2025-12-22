<!-- app/pages/cart/index.vue -->
<template lang="pug">
.cart-page.bg-base-100.flex.flex-col
  //- ОСНОВНОЙ ХЕДЕР САЙТА
  ClientOnly
    Header

  //- ГЛАВНЫЙ КОНТЕЙНЕР
  .content-wrapper.flex-1.flex.overflow-hidden
    //- ПУСТАЯ КОРЗИНА - ПОЛНОЭКРАННЫЙ ЦЕНТР НА ДЕСКТОПЕ
    .empty-cart-desktop(
      v-if="!cartItems || cartItems.length === 0" 
      class="hidden lg:flex w-full h-full items-center justify-center"
    )
      .empty-cart-content.text-center.max-w-md.mx-auto.p-8
        .text-6xl.mb-6.text-primary.opacity-70 🛒
        h2.text-3xl.font-bold.mb-4 Ваша корзина пуста
        p.text-lg.text-base-content.opacity-70.mb-8 Начните покупки, чтобы добавить товары в&nbsp;корзину
        button.btn.btn-primary.btn-lg.rounded-lg(@click="$router.push('/')")
          svg.w-6.h-6.mr-2(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6")
          span Перейти в каталог

    //- ПУСТАЯ КОРЗИНА - ТОЛЬКО НА МОБИЛЬНЫХ
    .empty-cart-mobile(
      v-if="(!cartItems || cartItems.length === 0) && isMobile"
      class="lg:hidden w-full h-full flex items-center justify-center"
    )
      .empty-cart-content.text-center.max-w-md.mx-auto.p-4
        //- .text-6xl.mb-4.text-primary.opacity-70 🛒
        h2.text-2xl.font-bold.mb-3 Ваша корзина пуста
        p.text-base-content.opacity-70.mb-6 Начните покупки, чтобы добавить товары в&nbsp;корзину
        button.btn.btn-primary.btn-lg.rounded-lg(@click="$router.push('/')")
          svg.w-5.h-5.mr-2(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6")
          span Перейти в каталог

    //- КОРЗИНА С ТОВАРАМИ - ТОЛЬКО ЕСЛИ ЕСТЬ ТОВАРЫ
    .main-content.bg-base-100.flex-1.flex.flex-col.max-w-full(
      v-if="cartItems && cartItems.length > 0"
      :class="{ 'horizontal-orientation': isHorizontal }"
      class="sm:pl-2 lg:pl-0"
    )
      .container.mx-auto.p-0.pr-2.flex-1.max-w-full(class="lg:px-6 py-0 lg:pt-4")
        //- ОСНОВНОЙ GRID: 2 КОЛОНКИ НА ДЕСКТОПЕ, 1 НА МОБИЛЬНЫХ
        .cart-grid.grid.gap-4(class="lg:grid-cols-4 lg:gap-6")
          //- ЛЕВАЯ КОЛОНКА - ТОВАРЫ И ПОХОЖИЕ (1/2 ШИРИНЫ НА ДЕСКТОПЕ)
          .cart-left.col-span-2.max-w-full(class="lg:max-w-full")
            //- ЗАГОЛОВОК И УПРАВЛЕНИЕ ТОВАРАМИ
            .cart-header.flex.items-center.justify-between.mb-3.px-2.py-1.bg-base-100.w-full(
              class="sm:px-0 sm:w-[calc(100dvw-180px)] fixed z-40 lg:static lg:bg-transparent lg:z-auto lg:w-auto lg:mb-4 lg:px-0"
            )
              h1.text-2xl.font-bold.text-base-content 
                | Корзина покупок
              .flex.items-center.gap-8
                span(v-if="totalItems > 0").text-base.text-base-content.opacity-70.w-auto.mr-3 
                  | товаров: {{ totalItems }} шт.
                button.btn.btn-xs.btn-ghost.border.border-gray-400(
                  class="hover:bg-primary/10 hover:border-primary"
                  @click="clearCart" 
                  v-if="cartItems && cartItems.length > 0"
                )
                  svg.w-4.h-4.mr-1(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="grey")
                    path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16")
                  span.text-gray-500 Очистить

            //- ОСНОВНОЙ КОНТЕНТ С ТОВАРАМИ
            .cart-content.max-w-full.mt-18(
              v-if="cartItems && cartItems.length > 0" 
              class="sm:mt-11 lg:mt-0"
            )
              //- ПРЕДУПРЕЖДЕНИЕ О НЕДОСТАТОЧНОМ КОЛИЧЕСТВЕ
              .alert.alert-warning.mb-4.mx-2(
                class="sm:mx-0 lg:mx-0" 
                v-if="hasOutOfStockItems"
              )
                svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z")
                span Некоторые товары в корзине недоступны в запрошенном количестве
              
              //- СПИСОК ТОВАРОВ В КОРЗИНЕ
              .cart-items-container(
                v-if="cartItems.length > 0"
                class="lg:overflow-y-auto lg:max-h-[calc(100dvh-140px)]"
              )
                //- ЗАГОЛОВКИ ТАБЛИЦЫ ДЛЯ ДЕСКТОПА (GRID)
                .hidden(class="lg:block lg:mb-2")
                  .cart-list-header.grid.grid-cols-12.gap-4.px-4.py-1.bg-base-200.rounded-lg.font-semibold.text-sm
                    .col-span-5 Товар
                    .col-span-2.text-center Кол-во
                    .col-span-2.text-right Цена
                    .col-span-2.text-right Итого
                    .col-span-1
                
                //- МОБИЛЬНАЯ ВЕРСИЯ (ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА)
                .cart-items-scroll-wrapper.overflow-x-auto.pl-2.pb-2.mb-1(
                  class="sm:pb-1 sm:mb-0 lg:hidden"
                )
                  .cart-items.flex.flex-nowrap.gap-3.pb-1(style="width: max-content;")
                    .card.bg-base-100.transition-shadow.flex-shrink-0.border.border-gray-400.rounded-lg(
                      v-for="item in cartItems" 
                      :key="item.id"
                      :class="{ 'border-2 border-warning': item.quantity > getMaxQuantity(item) }"
                      style="width: 320px;"
                    )
                      .card-body.p-2.pr-0.border.border-base-100.rounded-lg
                        .flex.items-center.gap-1
                          .flex-shrink-0.mr-1
                            .w-20.h-20.rounded-xl.bg-base-200.flex.items-center.justify-center.overflow-hidden
                              img.w-full.h-full.object-cover(
                                :src="item.image || '/images/placeholder.jpg'" 
                                :alt="item.name"
                                @error="handleImageError"
                              )
                            .price-info.mt-2
                              .text-lg.font-bold.text-sky-600 {{ formatPrice(item.currentPrice * item.quantity) }}
                              .text-sm.text-base-content.opacity-70 {{ formatPrice(item.currentPrice) }}/шт.
                          .flex-grow.min-w-0
                            .flex.items-start.justify-between
                              .flex-grow.overflow-hidden
                                h3.font-semibold.text-lg.mb-2.hover_text-primary.transition-colors.cursor-pointer.truncate(
                                  @click="$router.push(`/product/${item.id}`)"
                                ) {{ item.name }}
                                .badge.badge-secondary.text-xs.text-white.opacity-70.truncate.rounded-sm {{ item.category }}
                                .flex.items-center.justify-between.mt-2
                                  .quantity-controls.flex.items-center.gap-0
                                    span.text-xs.font-medium Количество:
                                    .flex.items-center.gap-0
                                      button.btn.btn-ghost.btn-sm.btn-square(
                                        @click="updateQuantity(item.id, item.quantity - 1)"
                                        :disabled="item.quantity <= 1"
                                      ) 
                                        span.text-lg.text-gray-500 -
                                      span.px-2.text-sm.font-bold(
                                        :class="{ 'text-error': item.quantity > getMaxQuantity(item) }"
                                      ) {{ item.quantity }}
                                      button.btn.btn-ghost.btn-sm.btn-square(
                                        @click="updateQuantity(item.id, item.quantity + 1)"
                                        :disabled="item.quantity >= getMaxQuantity(item)"
                                      ) 
                                        span.text-lg.text-gray-500 +
                          .absolute.top-2.right-2
                            button.btn.btn-circle.btn-error(
                              @click="removeFromCart(item.id)"
                              title="Удалить из корзины"
                              class="w-5 h-5 min-h-0 hover:bg-error/10"
                            )
                              svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                                path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12")
                        .flex.items-center.justify-between.mt-2
                          .text-right
                            .text-xs(
                              v-if="getMaxQuantity(item) < 999"
                              :class="getMaxQuantity(item) <= 3 ? 'text-error font-semibold' : 'text-base-content opacity-70'"
                            )
                              | Доступно: {{ getMaxQuantity(item) }} шт.
                              span.text-error.ml-2(v-if="item.quantity > getMaxQuantity(item)") ⚠️ Превышено

                //- ДЕСКТОПНАЯ ВЕРСИЯ (GRID СПИСОК)
                .hidden(class="lg:block")
                  .cart-items-list.space-y-3
                    .cart-item-row.grid.grid-cols-12.gap-4.px-4.py-2.bg-base-100.border.border-base-300.rounded-lg.items-center(
                      v-for="item in cartItems" 
                      :key="item.id"
                      :class="{ 'border-2 border-warning': item.quantity > getMaxQuantity(item) }"
                    )
                      .col-span-5.flex.items-center.gap-3
                        .flex-shrink-0
                          .w-12.h-12.rounded-lg.bg-base-200.flex.items-center.justify-center.overflow-hidden
                            img.w-full.h-full.object-cover(
                              :src="item.image || '/images/placeholder.jpg'" 
                              :alt="item.name"
                              @error="handleImageError"
                            )
                        .flex-grow.min-w-0
                          .flex.flex-col
                            h3.font-semibold.text-base.hover_text-primary.transition-colors.cursor-pointer.truncate(
                              @click="$router.push(`/product/${item.id}`)"
                            ) {{ item.name }}
                            .badge.badge-secondary.badge-sm.text-white.opacity-70.rounded-sm.mt-1 {{ item.category }}
                            .text-xs.text-error.mt-1(v-if="item.quantity > getMaxQuantity(item)") ⚠️ Превышено количество
                            .text-xs.text-base-content.opacity-70.mt-1(
                              v-if="getMaxQuantity(item) < 999"
                              :class="getMaxQuantity(item) <= 3 ? 'text-error font-semibold' : ''"
                            ) Доступно: {{ getMaxQuantity(item) }} шт.
                      
                      .col-span-2
                        .flex.flex-col.items-center
                          .quantity-controls.flex.items-center.gap-0
                            button.btn.btn-ghost.btn-sm.btn-square(
                              @click="updateQuantity(item.id, item.quantity - 1)"
                              :disabled="item.quantity <= 1"
                              class="w-8 h-8"
                            ) 
                              span.text-lg.text-gray-500 -
                            span.px-2.text-base.font-bold(
                              :class="{ 'text-error': item.quantity > getMaxQuantity(item) }"
                            ) {{ item.quantity }}
                            button.btn.btn-ghost.btn-sm.btn-square(
                              @click="updateQuantity(item.id, item.quantity + 1)"
                              :disabled="item.quantity >= getMaxQuantity(item)"
                              class="w-8 h-8"
                            ) 
                              span.text-lg.text-gray-500 +
                      
                      .col-span-2.text-right
                        .text-sm.text-base-content.opacity-70 {{ formatPrice(item.currentPrice) }}/шт.
                      
                      .col-span-2.text-right
                        .text-md.font-bold.text-sky-600 {{ formatPrice(item.currentPrice * item.quantity) }}
                      
                      .col-span-1.text-center
                        button.btn.btn-ghost.btn-sm.btn-circle.text-error(
                          @click="removeFromCart(item.id)"
                          title="Удалить из корзины"
                          class="hover:bg-error/10"
                        )
                          svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12")

          //- ПРАВАЯ КОЛОНКА - ОФОРМЛЕНИЕ ЗАКАЗА (1/2 ШИРИНЫ НА ДЕСКТОПЕ)
          .cart-right.col-span-2.max-w-full(
            v-if="totalItems" 
            class="lg:mt-0"
          )
            .checkout-card.w-full(class="lg:sticky lg:top-4 lg:h-[calc(100dvh-80px)]")
              .card.bg-base-100.shadow-xl.rounded-xl.h-full.flex.flex-col
                .card-body.px-4.py-0.flex.flex-col.flex-1.overflow-y-auto
                  h2.text-2xl.font-bold.mb- Оформление заказа
                  
                  .space-y-3.mb-2
                    .grid.grid-cols-2.gap-2
                      .text-base.text-base-content.opacity-70 Товары ({{ totalItems }})
                      .text-base.font-semibold.text-right {{ formatPrice(subtotal) }}
                    
                    .grid.grid-cols-2.gap-2
                      .text-base.text-base-content.opacity-70 Доставка
                      .text-base.font-semibold.text-right {{ deliveryPrice === 0 ? 'Бесплатно' : formatPrice(deliveryPrice) }}
                    
                    .grid.grid-cols-2.gap-2(v-if="discount > 0")
                      .text-base.text-base-content.opacity-70 Скидка
                      .text-base.font-semibold.text-error.text-right -{{ formatPrice(discount) }}

                    .grid.grid-cols-2.gap-2.pt-2.border-t.border-base-300.text-xl.font-bold
                      span Итого:
                      span.text-sky-600.text-right {{ formatPrice(total) }}

                  .form-control.mb-2
                    .join.w-full
                      input.input.input-bordered.join-item.flex-grow(
                        type="text" 
                        placeholder="Введите промокод"
                        v-model="promoCode"
                        @keyup.enter="applyPromo"
                      )
                      button.btn.btn-primary.join-item(
                        @click="applyPromo"
                        :disabled="!promoCode.trim() || isProcessing"
                        class="px-4"
                      )
                        span(v-if="!isProcessing") Применить
                        span.loading.loading-spinner.loading-sm(v-else)

                  .form-control
                    label.label.p-0.mb-2
                      span.label-text.font-semibold.text-base Способ доставки:
                    .grid.grid-cols-1.gap-2(class="lg:grid-cols-2")
                      label.cursor-pointer.flex.items-center.gap-3.px-3.py-2.rounded-xl.border-2.transition-all(
                        :class="selectedDelivery === 'courier' ? 'border-secondary bg-secondary/10' : 'border-base-200 hover:border-base-300'"
                      )
                        input.radio.radio-sm(
                          type="radio" 
                          name="delivery" 
                          value="courier"
                          v-model="selectedDelivery"
                        )
                        .flex-grow
                          .font-semibold.text-sm Курьерская доставка
                          .text-sm.text-base-content.opacity-70 1-3 рабочих дня · {{ deliveryPrice === 0 ? 'Бесплатно' : formatPrice(deliveryPrice) }}
                      
                      label.cursor-pointer.flex.items-center.gap-3.px-3.py-2.rounded-xl.border-2.transition-all(
                        :class="selectedDelivery === 'pickup' ? 'border-secondary bg-secondary/10' : 'border-base-200 hover:border-base-300'"
                      )
                        input.radio.radio-sm(
                          type="radio" 
                          name="delivery" 
                          value="pickup"
                          v-model="selectedDelivery"
                        )
                        .flex-grow
                          .font-semibold.text-sm Самовывоз
                          .text-sm.text-base-content.opacity-70 Сегодня · Бесплатно

                  .form-control.mb-10
                    label.label.p-0.mb-2
                      span.label-text.font-semibold.text-base Способ оплаты:
                    .grid.grid-cols-1.gap-2(class="lg:grid-cols-2")
                      label.cursor-pointer.flex.items-center.gap-3.px-3.py-2.rounded-xl.border-2.transition-all(
                        :class="selectedPayment === 'card' ? 'border-secondary bg-secondary/10' : 'border-base-200 hover:border-base-300'"
                      )
                        input.radio.radio-sm(
                          type="radio" 
                          name="payment" 
                          value="card"
                          v-model="selectedPayment"
                        )
                        .flex-grow
                          .font-semibold.text-sm Банковская карта
                          .text-sm.text-base-content.opacity-70 Онлайн-оплата
                      
                      label.cursor-pointer.flex.items-center.gap-3.px-3.py-2.rounded-xl.border-2.transition-all(
                        :class="selectedPayment === 'cash' ? 'border-secondary bg-secondary/10' : 'border-base-200 hover:border-base-300'"
                      )
                        input.radio.radio-sm(
                          type="radio" 
                          name="payment" 
                          value="cash"
                          v-model="selectedPayment"
                        )
                        .flex-grow
                          .font-semibold.text-sm Наличными
                          .text-sm.text-base-content.opacity-70 При получении
                
                .card-actions.p-4.mt-auto(v-if="!isMobile")
                  button.btn.btn-primary.btn-lg.w-full.rounded-lg(
                    @click="proceedToCheckout"
                    :disabled="isProcessing || hasOutOfStockItems"
                    :class="{ 'btn-error': hasOutOfStockItems }"
                  )
                    template(v-if="!isProcessing")
                      svg.w-5.h-5.mr-2(
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        v-if="!hasOutOfStockItems"
                      )
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7")
                      svg.w-5.h-5.mr-2(
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        v-else
                      )
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z")
                      span
                        template(v-if="hasOutOfStockItems") Есть проблемы с количеством
                        template(v-else) Оформить заказ
                    span.loading.loading-spinner(v-else)

      //- ПРИКРЕПЛЕННАЯ КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА ДЛЯ МОБИЛЬНЫХ
      .mobile-checkout-button.fixed.left-0.right-0.bg-base-100.px-2.shadow-lg.z-50(
        v-if="cartItems && cartItems.length > 0"
        class="bottom-14 lg:hidden"
        :class="{ 'with-horizontal-offset': isHorizontal && isMobile }"
      )
        button.btn.btn-primary.btn-lg.w-full.rounded-t-xl.rounded-b-none.shadow-lg(
          @click="proceedToCheckout"
          :disabled="isProcessing || hasOutOfStockItems"
          class="hover:shadow-xl transition-shadow text-lg py-4"
          :class="{ 'btn-error': hasOutOfStockItems }"
        )
          template(v-if="!isProcessing")
            svg.w-6.h-6.mr-3(
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              v-if="!hasOutOfStockItems"
            )
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7")
            svg.w-6.h-6.mr-3(
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              v-else
            )
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z")
            span.text-lg
              template(v-if="hasOutOfStockItems") Есть проблемы с количеством
              template(v-else) Оформить заказ · {{ formatPrice(total) }}
          span.loading.loading-spinner(v-else)

  //- ФУТЕР
  MobileNavFooter(v-if="isMobile")
</template>

<style scoped>
/* Центрирование пустой корзины на десктопе */
.empty-cart-desktop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-base-100);
  z-index: 40;
  display: none;
}

@media (min-width: 1024px) {
  .empty-cart-desktop {
    display: flex;
  }
}

/* Центрирование пустой корзины на мобильных */
.empty-cart-mobile {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  background: var(--color-base-100);
  z-index: 30;
  display: none;
}

@media (max-width: 1023px) {
  .empty-cart-mobile {
    display: flex;
  }
}

.empty-cart-content {
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

.content-wrapper {
  height: calc(100dvh - 64px);
}

.cart-grid {
  height: 100%;
  max-height: 100%;
}

@media (min-width: 1024px) {
  .checkout-card .card {
    position: sticky;
    top: 1rem;
    max-height: calc(100dvh - 2rem);
    overflow-y: auto;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mobile-checkout-button {
  z-index: 50;
}

.main-content.horizontal-orientation {
  margin-left: 64px;
}

@media (max-width: 768px) {
  .main-content.horizontal-orientation {
    margin-left: 60px;
  }
}

@media (max-width: 740px) and (orientation: landscape) {
  .main-content.horizontal-orientation {
    margin-left: 60px;
  }
}

.cart-items-scroll-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  max-width: 100dvw;
  box-sizing: border-box;
}

.cart-items-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.cart-items-scroll-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.cart-items-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.cart-items-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.similar-products-scroll-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  max-width: 100vw;
  box-sizing: border-box;
}

.similar-products-scroll-wrapper::-webkit-scrollbar {
  height: 4px;
}

.similar-products-scroll-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.similar-products-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

.similar-products-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.mobile-checkout-button.with-horizontal-offset {
  left: 70px;
  bottom: 0
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .product-image {
    height: 140px;
  }
  
  .card-title {
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .checkout-card.card-title {
    font-size: 0.875rem;
  }
  
  .description {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  
  .price {
    font-size: 1.1rem;
  }
  
  .product-card .absolute.top-2 {
    top: 0.5rem;
  }
  
  .product-card .absolute.top-2.left-2 {
    left: 0.5rem;
  }
  
  .product-card .btn-circle.btn-xs {
    width: 1.5rem;
    height: 1.5rem;
    min-height: 0;
  }
  
  .product-card .btn-circle.btn-xs svg {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .product-footer .btn-circle.btn-xs {
    width: 1.5rem;
    height: 1.5rem;
    min-height: 0;
  }
  
  .product-footer .btn-circle.btn-xs svg {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .cart-items-scroll-wrapper .card {
    width: 300px !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 200px !important;
  }
  
  .product-card .product-image .h-32 {
    height: 120px;
  }
  
  .main-content {
    padding-bottom: 80px;
  }
}

@media (max-width: 768px) and (orientation: landscape) {
  .product-image {
    height: 100px;
  }
  
  .card-title {
    font-size: 0.75rem;
  }
  
  .description {
    font-size: 0.625rem;
  }
  
  .cart-items-scroll-wrapper .card {
    width: 280px !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 180px !important;
  }
  
  .main-content {
    padding-bottom: 60px;
  }
}

@media (max-width: 375px) {
  .product-image {
    height: 120px;
  }
  
  .card-title {
    font-size: 0.75rem;
  }
  
  .description {
    font-size: 0.625rem;
  }
  
  .cart-items-scroll-wrapper .card {
    width: 280px !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 180px !important;
  }
  
  .product-card .product-image .h-32 {
    height: 100px;
  }
}

@media (min-width: 769px) {
  .cart-items-scroll-wrapper .card {
    width: 380px !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 250px !important;
  }
  
  .product-card .product-image .h-32 {
    height: 160px;
  }
  
  .main-content {
    padding-bottom: 0;
  }
}

.max-w-full {
  max-width: 100%;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.min-w-0 {
  min-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}

.min-h-screen {
  min-height: 100dvh;
}

.min-h-0 {
  min-height: 0;
}

@media (max-width: 926px) and (orientation: landscape) {
  .main-content.horizontal-orientation {
    margin-left: 60px;
    width: calc(100vw - 60px) !important;
    max-width: calc(100vw - 60px) !important;
  }
  
  .cart-items-scroll-wrapper,
  .similar-products-scroll-wrapper {
    max-width: calc(100vw - 76px) !important;
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }
  
  .cart-items-scroll-wrapper .card {
    width: 300px !important;
    max-width: calc(50vw - 70px) !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 200px !important;
    max-width: calc(33vw - 70px) !important;
  }
  
  .horizontal-orientation-right {
    max-width: calc(100vw - 76px) !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    width: 100% !important;
  }
  
  .checkout-card {
    max-width: calc(100vw - 76px) !important;
    width: 100% !important;
  }
  
  .checkout-card .card {
    max-width: 100% !important;
    overflow-x: hidden;
  }
  
  .mobile-checkout-button.with-horizontal-offset {
    left: 60px;
    right: 0;
    width: calc(100vw - 60px) !important;
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .flex.items-center.justify-between.mb-3 {
    flex-wrap: wrap;
  }
  
  .flex.items-center.gap-8 {
    gap: 4px;
  }
  
  span.text-base.text-base-content.opacity-70.w-auto.mr-3 {
    font-size: 0.875rem;
    margin-right: 0.5rem;
  }
}

@media (max-width: 740px) and (orientation: landscape) {
  .main-content.horizontal-orientation {
    margin-left: 60px;
    width: calc(100vw - 60px) !important;
    max-width: calc(100vw - 60px) !important;
  }
  
  .cart-items-scroll-wrapper .card {
    width: 280px !important;
    max-width: calc(50vw - 65px) !important;
  }
  
  .similar-products-scroll-wrapper .product-card {
    width: 180px !important;
    max-width: calc(33vw - 65px) !important;
  }
  
  .card-body.p-2.pr-0 {
    padding: 0.5rem !important;
  }
  
  .w-20.h-20 {
    width: 16px !important;
    height: 16px !important;
  }
  
  .price-info.mt-2 {
    margin-top: 0.25rem !important;
  }
  
  .price-info .text-lg {
    font-size: 0.875rem !important;
  }
  
  .price-info .text-sm {
    font-size: 0.75rem !important;
  }
  
  .horizontal-orientation-right {
    max-width: calc(100vw - 76px) !important;
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
}

@media (min-width: 769px) and (max-width: 926px) and (orientation: landscape) {
  .main-content.horizontal-orientation {
    margin-left: 64px;
    width: calc(100vw - 64px) !important;
  }
  
  .cart-items-scroll-wrapper,
  .similar-products-scroll-wrapper {
    max-width: calc(100vw - 80px) !important;
  }
  
  .checkout-card {
    width: 100% !important;
    max-width: calc(100vw - 80px) !important;
  }
  
  .horizontal-orientation-right {
    max-width: calc(100vw - 80px) !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

.max-w-full {
  max-width: 100% !important;
  box-sizing: border-box;
}

.content-wrapper.overflow-x-hidden {
  overflow-x: hidden !important;
}

.container.mx-auto.p-0.pr-2 {
  max-width: 100% !important;
  padding-right: 0.5rem;
}

.flex.flex-col.max-w-full {
  max-width: 100% !important;
}

.cart-items .card {
  max-width: 100% !important;
  box-sizing: border-box;
}

.products-grid .product-card {
  max-width: 100% !important;
  box-sizing: border-box;
}

.checkout-card .card-body {
  overflow-wrap: break-word;
  word-break: break-word;
}

.card-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.space-y-1 .flex.justify-between.items-center span {
  min-width: 0;
  flex-shrink: 1;
}

.hover_text-primary.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<script setup>
import Header from '~/components/layout/Header.vue'
import MobileNavFooter from '~/components/layout/MobileNavFooter.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const { $notify } = useNuxtApp()

// Определяем горизонтальную ориентацию
const isHorizontal = ref(false)

const checkOrientation = () => {
  if (process.client) {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isSmallWidth = window.innerWidth <= 926;
    isHorizontal.value = isLandscape && isSmallWidth;
  }
}

// Определяем мобильное устройство
const isMobile = ref(false)

const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 1024
  }
}

// Инициализация ориентации и мобильности
onMounted(() => {
  if (process.client) {
    checkOrientation()
    checkMobile()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkOrientation)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkOrientation)
    window.removeEventListener('resize', checkMobile)
    window.removeEventListener('orientationchange', checkOrientation)
  }
})

// Используем композабл корзины
const {
  cartItems,
  subtotal,
  discount,
  total,
  totalItems,
  deliveryPrice,
  updateItemQuantity,
  removeFromCart,
  clearCart,
  applyPromoCode,
  proceedToCheckout: cartCheckout,
  addToCart: addToCartAction,
  getMaxQuantity,
  hasOutOfStockItems
} = useCart()

const isProcessing = ref(false)
const loadingSimilar = ref(false)
const promoCode = ref('')
const selectedDelivery = ref('courier')
const selectedPayment = ref('card')

// Похожие товары
const similarProducts = ref([])

// Функция для загрузки реальных товаров из products.json
const loadRealProducts = async () => {
  try {
    loadingSimilar.value = true
    const { data: products } = await useFetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return products.value || []
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
    $notify.error('Не удалось загрузить товары')
    return []
  } finally {
    loadingSimilar.value = false
  }
}

// Функция для получения случайных товаров
const getRandomProducts = async () => {
  const allProducts = await loadRealProducts()
  
  if (!allProducts || allProducts.length === 0) {
    return []
  }

  const cartProductIds = cartItems.value?.map(item => item.id) || []
  const availableProducts = allProducts.filter(product => 
    !cartProductIds.includes(product.id.toString())
  )

  const shuffled = [...availableProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

// Загружаем похожие товары
const loadSimilarProducts = async () => {
  similarProducts.value = await getRandomProducts()
}

// Обновление похожих товаров
const refreshSimilarProducts = async () => {
  await loadSimilarProducts()
  $notify.success('Рекомендации обновлены')
}

// Проверка, есть ли товар уже в корзине
const isInCart = (productId) => {
  return cartItems.value?.some(item => item.id === productId.toString()) || false
}

// Переключение избранного для похожих товаров
const toggleSimilarFavorite = (productId) => {
  console.log('Toggle favorite for product:', productId)
  $notify.info('Функция избранного для похожих товаров')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder.jpg'
}

const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) return
  
  try {
    await updateItemQuantity(itemId, newQuantity)
  } catch (error) {
    $notify.error(error.message || 'Ошибка при обновлении количества')
  }
}

const applyPromo = async () => {
  if (!promoCode.value.trim()) return
  
  try {
    isProcessing.value = true
    await applyPromoCode(promoCode.value)
    $notify.success('Промокод применен')
    promoCode.value = ''
  } catch (error) {
    $notify.error('Неверный промокод')
  } finally {
    isProcessing.value = false
  }
}

const addToCart = async (product) => {
  try {
    await addToCartAction(product)
    await loadSimilarProducts()
  } catch (error) {
    $notify.error(error.message || 'Ошибка при добавлении товара')
  }
}

const proceedToCheckout = async () => {
  try {
    isProcessing.value = true
    await cartCheckout()
    await navigateTo('/cart/checkout')
  } catch (error) {
    $notify.error('Ошибка при оформлении заказа')
  } finally {
    isProcessing.value = false
  }
}

// Загружаем похожие товары при монтировании
onMounted(() => {
  loadSimilarProducts()
})

// Обновляем похожие товары при изменении корзины
watch(cartItems, () => {
  loadSimilarProducts()
}, { deep: true })
</script>