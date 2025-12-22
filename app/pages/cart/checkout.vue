<!-- pages/cart/checkout.vue -->
<template lang="pug">
.checkout-page
  Header
  .container.mx-auto(class="sm:ml-17")
    //- Фиксированные хлебные крошки
    .fixed.top-13.left-1.right-0.z-50.bg-base-100.border-b.border-base-300.shadow-sm(class="sm:ml-17")
      .container.mx-auto.p-1(class="lg:p-4")
        nav.breadcrumbs.text-sm.overflow-x-auto.whitespace-nowrap(class="lg:text-sm text-base-content/70" aria-label="Хлебные крошки")
          ul.flex
            li
              NuxtLink.link.link-hover(to="/" aria-label="Перейти на главную страницу") Главная
            li(aria-current="page")
              span Корзина покупок

    .grid.grid-cols-1.gap-0(class="lg:grid-cols-2")
      //- Левая колонка - Форма оформления
      .checkout-form
        .card.bg-base-100.shadow-xl
          .card-body.p-2.pt-10
            h1.card-title.text-2xl Оформление заказа

            //- Шаги оформления
            .steps.steps-horizontal.mb-2.text-xs
              .step.step-primary Контакты
              .step(:class="currentStep >= 2 ? 'step-primary' : ''") Доставка
              .step(:class="currentStep >= 3 ? 'step-primary' : ''") Оплата
              .step(:class="currentStep >= 4 ? 'step-primary' : ''") Подтвержд.

            //- Шаг 1: Контактная информация
            .step-content(v-if="currentStep === 1")
              h2.text-xl.font-bold.mb-4 Контактная информация
              
              .grid.grid-cols-1.gap-2(class="sm:grid-cols-2")
                .form-control
                  label.label.block.text-base-content.font-bold
                    span.label-text Имя *
                  input.input.input-bordered(
                    type="text"
                    v-model="orderForm.firstName"
                    placeholder="Введите имя"
                    :class="{ 'input-error': errors.firstName }"
                  )
                  .label(v-if="errors.firstName")
                    span.label-text-alt.text-error {{ errors.firstName }}

                .form-control
                  label.label.block.text-base-content.font-bold
                    span.label-text Фамилия *
                  input.input.input-bordered(
                    type="text"
                    v-model="orderForm.lastName"
                    placeholder="Введите фамилию"
                    :class="{ 'input-error': errors.lastName }"
                  )
                  .label(v-if="errors.lastName")
                    span.label-text-alt.text-error {{ errors.lastName }}

                .form-control(class="md:col-span-2")
                  label.label.block.text-base-content.font-bold
                    span.label-text Email *
                  input.input.input-bordered(
                    type="email"
                    v-model="orderForm.email"
                    placeholder="your@email.com"
                    :class="{ 'input-error': errors.email }"
                  )
                  .label(v-if="errors.email")
                    span.label-text-alt.text-error {{ errors.email }}

                .form-control(class="md:col-span-2")
                  label.label.block.text-base-content.font-bold
                    span.label-text Телефон *
                  input.input.input-bordered(
                    type="tel"
                    v-model="orderForm.phone"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    :class="{ 'input-error': errors.phone }"
                  )
                  .label(v-if="errors.phone")
                    span.label-text-alt.text-error {{ errors.phone }}

            //- Шаг 2: Доставка
            .step-content(v-if="currentStep === 2")
              h2.text-xl.font-bold.mb-4 Способ доставки
              
              .form-control
                label.label.cursor-pointer.justify-start.gap-4.mb-3(
                  v-for="method in deliveryMethods"
                  :key="method.id"
                )
                  input.radio(
                    type="radio"
                    name="delivery"
                    :value="method.id"
                    v-model="orderForm.deliveryMethod"
                  )
                  .label-text
                    .text-md.text-base-content.font-bold {{ method.name }}
                    .text-md {{ method.description }}
                    .text-sm.font-bold {{ method.price === 0 ? 'Бесплатно' : `+${formatPrice(method.price)}` }}

              //- Адрес доставки
              .mt-6(v-if="orderForm.deliveryMethod === 'courier'")
                h3.text-lg.font-bold.mb-4 Адрес доставки
                
                .grid.grid-cols-1.gap-4(class="md:grid-cols-2")
                  .form-control(class="md:col-span-2")
                    label.label
                      span.label-text Адрес *
                    input.input.input-bordered(
                      type="text"
                      v-model="orderForm.address"
                      placeholder="Улица, дом, квартира"
                      :class="{ 'input-error': errors.address }"
                    )
                    .label(v-if="errors.address")
                      span.label-text-alt.text-error {{ errors.address }}

                  .form-control
                    label.label
                      span.label-text Город *
                    input.input.input-bordered(
                      type="text"
                      v-model="orderForm.city"
                      placeholder="Город"
                      :class="{ 'input-error': errors.city }"
                    )
                    .label(v-if="errors.city")
                      span.label-text-alt.text-error {{ errors.city }}

                  .form-control
                    label.label
                      span.label-text Индекс
                    input.input.input-bordered(
                      type="text"
                      v-model="orderForm.postalCode"
                      placeholder="Почтовый индекс"
                    )

            //- Шаг 3: Оплата
            .step-content(v-if="currentStep === 3")
              h2.text-xl.font-bold.mb-4 Способ оплаты
              
              .form-control.mb-4
                label.label.text-base-content.cursor-pointer.justify-start.gap-4.mb-4(
                  v-for="method in paymentMethods"
                  :key="method.id"
                )
                  input.radio(
                    type="radio"
                    name="payment"
                    :value="method.id"
                    v-model="orderForm.paymentMethod"
                  )
                  .label-text
                    .font-bold {{ method.name }}
                    .text-sm.text-base-content.opacity-70 {{ method.description }}

              //- Данные карты (если выбран онлайн-платеж)
              .card.bg-base-200.p-4(v-if="orderForm.paymentMethod === 'card'")
                h3.text-lg.font-bold.mb-4 Данные банковской карты
                
                .grid.grid-cols-1.gap-4(class="md:grid-cols-2")
                  .form-control(class="md:col-span-2")
                    label.label
                      span.label-text Номер карты
                    input.input.input-bordered(
                      type="text"
                      v-model="paymentData.cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxlength="19"
                    )

                  .form-control
                    label.label
                      span.label-text Срок действия
                    input.input.input-bordered(
                      type="text"
                      v-model="paymentData.expiryDate"
                      placeholder="MM/YY"
                      maxlength="5"
                    )

                  .form-control
                    label.label
                      span.label-text CVV/CVC
                    input.input.input-bordered(
                      type="text"
                      v-model="paymentData.cvv"
                      placeholder="123"
                      maxlength="3"
                    )

            //- Шаг 4: Подтверждение
            .step-content(v-if="currentStep === 4")
              h2.text-xl.font-bold.mb-2 Подтверждение заказа
              
              .card.bg-base-200.p-4.mb-0
                h3.text-lg.font-bold.mb-2 Контактная информация:
                p {{ orderForm.firstName }} {{ orderForm.lastName }}
                p {{ orderForm.email }}
                p {{ orderForm.phone }}

              .card.bg-base-200.p-4.mb-4(v-if="orderForm.deliveryMethod === 'courier'")
                h3.text-lg.font-bold.mb-2 Адрес доставки:
                p {{ orderForm.city }}, {{ orderForm.address }}
                p(v-if="orderForm.postalCode") Индекс: {{ orderForm.postalCode }}

              .card.bg-base-200.p-4
                h3.text-lg.font-bold.mb-2 Способ оплаты:
                p {{ paymentMethods.find(m => m.id === orderForm.paymentMethod)?.name }}

            //- Кнопки навигации
            .flex.justify-between.mt-2
              button.btn.btn-outline.rounded-lg(
                v-if="currentStep > 1"
                @click="previousStep"
              ) Назад
              
              button.btn.btn-primary.rounded-lg(
                v-if="currentStep < 4"
                @click="nextStep"
                :disabled="!isStepValid"
              ) Продолжить
              
              button.btn.btn-success.rounded-lg(
                v-if="currentStep === 4"
                @click="placeOrder"
                :disabled="isProcessing"
              )
                span(v-if="!isProcessing") Подтвердить заказ
                span.loading.loading-spinner(v-else)

      //- Правая колонка - Итоги заказа
      .checkout-summary
        .card.bg-base-100.shadow-xl
          .card-body.p-2.pt-0
            h2.card-title Ваш заказ:
            
            //- Список товаров
            .max-h-96.overflow-y-auto.mb-4
              .flex.items-center.gap-3.p-1.border-b(
                v-for="item in cartItems"
                :key="item.id"
                class="border-base-300"
              )
                .avatar
                  .w-12.h-12.rounded
                    img(:src="getSafeImage(item.image)" :alt="item.name")
                .flex-1
                  .font-medium {{ item.name }}
                  .text-sm.text-base-content.opacity-70 {{ formatPrice(item.currentPrice) }} ₽ × {{ item.quantity }}
                .font-bold {{ formatPrice(item.currentPrice * item.quantity) }} ₽
            
            //- Итоговая сумма
            .space-y-2.mb-4
              .flex.justify-between
                span Товары ({{ totalItems }})
                span {{ formatPrice(subtotal) }} ₽
              
              .flex.justify-between(v-if="discount > 0")
                span Скидка
                span.text-error -{{ formatPrice(discount) }}
              
              .flex.justify-between
                span Доставка
                span {{ selectedDeliveryPrice === 0 ? 'Бесплатно' : formatPrice(selectedDeliveryPrice) }} ₽
              
              .divider
              
              .flex.justify-between.text-lg.font-bold.text-sky-600
                span Итого
                span {{ formatPrice(finalTotal) }} ₽

            //- Промокод
            .form-control.mb-14(v-if="!appliedPromo")
              label.label
                span.label-text Промокод
              .join.w-full
                input.input.input-bordered.join-item.flex-grow(
                  type="text"
                  placeholder="Введите промокод"
                  v-model="promoCode"
                )
                button.btn.btn-primary.join-item(
                  @click="applyPromo"
                  :disabled="!promoCode"
                ) Применить

            .alert.alert-success.mb-4(v-if="appliedPromo")
              .flex.items-center.justify-between
                span Промокод "{{ appliedPromo }}" применен
                button.btn.btn-ghost.btn-sm(@click="removePromo") ✕

    //- Модальное окно успешного заказа
    dialog.modal(:class="{ 'modal-open': showSuccessModal }")
      .modal-box.text-center.rounded-xl
        h3.text-2xl.font-bold.text-success.mb-4 Заказ успешно оформлен!
        .text-6xl.mb-4 🎉
        p Ваш заказ №{{ orderNumber }}
        p.mb-2 принят в обработку.
        p.mb-4 На указанную почту отправлено письмо с деталями заказа.
        .modal-action.justify-center
          NuxtLink.btn.btn-primary.rounded-xl(to="/") Вернуться на главную

  MobileNavFooter
</template>

<style scoped>
.breadcrumbs > ul > li + li:before {
  opacity: 1;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
import Header from '~/components/layout/Header.vue'
import MobileNavFooter from '~/components/layout/MobileNavFooter.vue'
import { useCart } from '@/composables/useCart'
import { useProductUtils } from '@/composables/useProductUtils'

const { $notify } = useNuxtApp()
const { 
  cartItems,
  subtotal,
  discount,
  total,
  totalItems,
  deliveryPrice,
  appliedPromo,
  applyPromoCode,
  removePromoCode,
  clearCart
} = useCart()

const { getSafeImage, formatPrice } = useProductUtils()

// Состояние оформления заказа
const currentStep = ref(1)
const isProcessing = ref(false)
const showSuccessModal = ref(false)
const orderNumber = ref('')
const promoCode = ref('')

// Форма заказа
const orderForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  deliveryMethod: 'courier',
  address: '',
  city: '',
  postalCode: '',
  paymentMethod: 'card'
})

// Данные оплаты
const paymentData = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

// Ошибки валидации
const errors = ref({})

// Методы доставки
const deliveryMethods = [
  { id: 'courier', name: 'Курьерская доставка', description: 'Доставка до двери', price: 300 },
  { id: 'pickup', name: 'Самовывоз', description: 'Из пункта выдачи', price: 0 },
  { id: 'post', name: 'Почта России', description: 'Доставка почтой', price: 200 }
]

// Методы оплаты
const paymentMethods = [
  { id: 'card', name: 'Банковская карта', description: 'Онлайн оплата картой' },
  { id: 'cash', name: 'Наличными', description: 'При получении заказа' },
  { id: 'online', name: 'Электронные деньги', description: 'ЮMoney, Qiwi и др.' }
]

// Вычисляемые свойства
const selectedDeliveryPrice = computed(() => {
  const method = deliveryMethods.find(m => m.id === orderForm.value.deliveryMethod)
  return method ? method.price : 0
})

const finalTotal = computed(() => {
  return subtotal.value - discount.value + selectedDeliveryPrice.value
})

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return orderForm.value.firstName && 
            orderForm.value.lastName && 
            orderForm.value.email && 
            orderForm.value.phone
    case 2:
      if (orderForm.value.deliveryMethod === 'courier') {
        return orderForm.value.address && orderForm.value.city
      }
      return true
    case 3:
      return orderForm.value.paymentMethod
    case 4:
      return true
    default:
      return false
  }
})

// Методы
const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
}

const validateStep = (step) => {
  errors.value = {}
  
  switch (step) {
    case 1:
      if (!orderForm.value.firstName) errors.value.firstName = 'Введите имя'
      if (!orderForm.value.lastName) errors.value.lastName = 'Введите фамилию'
      if (!orderForm.value.email) errors.value.email = 'Введите email'
      else if (!/\S+@\S+\.\S+/.test(orderForm.value.email)) errors.value.email = 'Неверный формат email'
      if (!orderForm.value.phone) errors.value.phone = 'Введите телефон'
      break
    case 2:
      if (orderForm.value.deliveryMethod === 'courier') {
        if (!orderForm.value.address) errors.value.address = 'Введите адрес'
        if (!orderForm.value.city) errors.value.city = 'Введите город'
      }
      break
  }
  
  return Object.keys(errors.value).length === 0
}

const applyPromo = async () => {
  if (!promoCode.value.trim()) return
  
  try {
    await applyPromoCode(promoCode.value)
    $notify.success('Промокод применен!')
    promoCode.value = ''
  } catch (error) {
    $notify.error('Неверный промокод')
  }
}

const removePromo = async () => {
  await removePromoCode()
  $notify.info('Промокод удален')
}

const placeOrder = async () => {
  if (!validateStep(4)) return
  
  isProcessing.value = true
  
  try {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Генерируем номер заказа
    orderNumber.value = 'ORD-' + Date.now().toString().slice(-6)
    
    // Очищаем корзину
    await clearCart()
    
    // Показываем модальное окно успеха
    showSuccessModal.value = true
    
    // $notify.success('Заказ успешно оформлен!', 'Поздравляем')
    
  } catch (error) {
    $notify.error('Ошибка при оформлении заказа')
  } finally {
    isProcessing.value = false
  }
}

// Загрузка данных пользователя если авторизован
onMounted(() => {
  const { isAuthenticated, user } = useAppState()
  if (isAuthenticated.value && user.value) {
    orderForm.value.email = user.value.email || ''
    orderForm.value.firstName = user.value.name?.split(' ')[0] || ''
    orderForm.value.lastName = user.value.name?.split(' ')[1] || ''
  }
})
</script>