<!-- pages/user/index.vue -->
<template lang="pug">
.user-account.min-h-screen.bg-base-200
  .container.mx-auto.p-4.max-w-7xl
    //- Состояние загрузки
    .flex.justify-center.items-center.min-h-96(v-if="loading")
      .loading.loading-spinner.loading-lg.text-primary
      span.ml-3 Загрузка...

    //- Состояние неавторизованного пользователя
    .flex.justify-center.items-center.min-h-96(v-else-if="!isAuthenticated")
      .text-center
        .text-4xl.mb-4 🔒
        h2.text-xl.font-bold.mb-3 Требуется авторизация
        button.btn.btn-primary.btn-sm(@click="navigateTo('/auth/login')") Войти

    //- Основной контент
    .space-y-4(v-else)
      //- Верхняя строка - информация о пользователе
      .card.bg-base-100.shadow-sm
        .card-body.p-4
          .flex.items-center.justify-between
            .flex.items-center.gap-4
              .avatar
                .w-12.rounded-full.bg-primary.text-primary-content.flex.items-center.justify-center
                  span.text-sm.font-bold {{ userInitials }}
              div
                h2.card-title.text-lg {{ userName }}
                p.text-sm.text-base-content.opacity-70 {{ userEmail }}
              .badge.badge-lg.rounded-sm(
                :class="userRole === 'admin' ? 'badge-primary' : userRole === 'manager' ? 'badge-secondary' : 'badge-accent'"
              ) {{ userRole }}
            
            .flex.items-center.gap-2
              .stats.stats-horizontal
                .stat.p-2
                  .stat-value.text-lg {{ orders.length }}
                  .stat-desc.text-xs Заказы
                .stat.p-2
                  .stat-value.text-lg {{ favoriteProducts.length }}
                  .stat-desc.text-xs Избранное
              button.btn.btn-outline.btn-error.btn-sm(@click="logout")
                svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1")

      //- Основной контент в 2 колонки
      .grid.grid-cols-1.gap-4(class="lg:grid-cols-2")
        //- Левая колонка - 2/3 ширины
        .space-y-4(class="lg:col-span-1")
          //- Редактирование профиля
          .card.bg-base-100.shadow-sm
            .card-body.p-4
              h3.card-title.text-md.mb-4 📝 Редактирование профиля
              form.grid.grid-cols-1.gap-3(@submit.prevent="updateProfile" class="md:grid-cols-2")
                .form-control
                  label.label.py-1
                    span.label-text.text-sm Имя
                  input.input.input-bordered.input-sm(type="text" v-model="profileForm.name")
                
                .form-control
                  label.label.py-1
                    span.label-text.text-sm Email
                  input.input.input-bordered.input-sm.text-sm(type="email" v-model="profileForm.email" disabled)
                
                .form-control
                  label.label.py-1
                    span.label-text.text-sm Телефон
                  input.input.input-bordered.input-sm(type="tel" v-model="profileForm.phone")
                
                .form-control(class="md:col-span-2")
                  label.label.py-1.mr-2
                    span.label-text.text-sm Адрес доставки
                  textarea.textarea.textarea-bordered.textarea-sm(v-model="profileForm.address" rows="2")
                
                div(class="md:col-span-2")
                  button.btn.btn-primary.btn-sm(:disabled="updatingProfile")
                    span(v-if="updatingProfile") Сохранение...
                    span(v-else) Сохранить изменения

          //- Статистика
          .card.bg-base-100.shadow-sm
            .card-body.p-4
              h3.card-title.text-md 📊 Детальная статистика
              .grid.grid-cols-2.gap-2(class="md:grid-cols-4")
                .stat.place-items-center.text-center.mr-4
                  .stat-figure.text-primary
                    svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                      path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2")
                  .stat-value.text-lg {{ orders.length }}
                  .stat-title.text-xs Всего заказов
                
                .stat.place-items-center.text-center
                  .stat-figure.text-info
                    svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                      path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z")
                  .stat-value.text-lg {{ activeOrdersCount }}
                  .stat-title.text-xs Активных
                
                .stat.place-items-center.text-center
                  .stat-figure.text-secondary
                    svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                      path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z")
                  .stat-value.text-lg {{ favoriteProducts.length }}
                  .stat-title.text-xs Избранное
                
                .stat.place-items-center.text-center
                  .stat-figure.text-success
                    svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                      path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z")
                  .stat-value.text-lg {{ completedOrdersCount }}
                  .stat-title.text-xs Завершено

        //- Правая колонка - 1/3 ширины
        .space-y-4
          //- Быстрые действия
          .card.bg-base-100.shadow-sm
            .card-body.p-4
              h3.card-title.text-md.mb-3 ⚡ Быстрые действия
              .space-y-2.flex.gap-4
                button.btn.btn-primary.btn-sm.justify-start(@click="navigateTo('/cart')")
                  svg.w-4.h-4.mr-2(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                    path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z")
                  span Корзина покупок
                
                button.btn.btn-secondary.btn-sm.justify-start(@click="navigateTo('/')")
                  svg.w-4.h-4.mr-2(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                    path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6")
                  span Вернуться в магазин
                
                button.btn.btn-accent.btn-sm.justify-start(@click="navigateTo('/favorites')")
                  svg.w-4.h-4.mr-2(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                    path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z")
                  span Мои избранные

          //- Последние заказы
          .card.bg-base-100.shadow-sm
            .card-body.p-4
              .flex.items-center.justify-between.mb-1
                h3.card-title.text-md 📦 Последние заказы
                .badge.badge-sm.badge-outline {{ orders.length }}

              .flex
                .text-center.py-4(v-if="orders.length === 0")
                  .text-2xl 📭
                  p.text-xs Нет заказов
                  button.btn.btn-primary.btn-xs.mt-2(@click="navigateTo('/')") Сделать заказ
                
                .flex.space-y-2.gap-2(v-else)
                  .flex.items-center.justify-between.p-2.gap-2.border.rounded-lg(
                    v-for="order in orders.slice(0, 2)" 
                    :key="order.id"
                  )
                    div
                      .font-semibold.text-sm Заказ №{{ order.id }}
                      .text-xs.text-base-content.opacity-70 {{ formatDate(order.createdAt) }}
                    .flex.items-center.gap-2
                      .text-sm.font-bold {{ formatPrice(order.total) }}
                      .badge.badge-xs(:class="getStatusBadgeClass(order.status)")

          //- Избранное
          .card.bg-base-100.shadow-sm
            .card-body.p-4
              .flex.items-center.justify-between.mb-3
                h3.card-title.text-md ❤️ Избранное
                .badge.badge-sm.badge-outline {{ favoriteProducts.length }}
              
              .text-center.py-4(v-if="favoriteProducts.length === 0")
                .text-2xl.mb-2 🤍
                p.text-xs Нет избранного
                button.btn.btn-primary.btn-xs.mt-2(@click="navigateTo('/')") Найти товары
              
              .flex.space-y-2.gap-2(v-else)
                .flex.items-center.justify-between.p-2.border.rounded-lg(
                  v-for="product in favoriteProducts.slice(0, 2)" 
                  :key="product.id"
                )
                  .flex.items-center.gap-2
                    img.w-8.h-8.rounded.object-cover(
                      :src="product.image || '/images/placeholder.jpg'" 
                      :alt="product.name"
                    )
                    .flex-1.min-w-0
                      .font-semibold.text-sm.truncate {{ product.name }}
                      .text-xs.text-primary {{ formatPrice(product.price) }}
                  .flex.gap-1
                    button.btn.btn-ghost.btn-xs(@click="addToCart(product)")
                      svg.w-3.h-3(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6")
                    button.btn.btn-ghost.btn-xs(@click="removeFavorite(product)")
                      svg.w-3.h-3.fill-current.text-error(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24")
                        path(d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")
</template>

<script setup>
definePageMeta({
  middleware: 'user-auth'
})

const { $notify } = useNuxtApp()
const appState = useAppState()
const router = useRouter()

// Состояние загрузки
const loading = ref(true)
const isAuthenticated = ref(false)
const updatingProfile = ref(false)

// Безопасная инициализация данных пользователя
const currentUser = ref(null)

// Загружаем данные пользователя
const loadUserData = async () => {
  try {
    loading.value = true
    
    // Проверяем аутентификацию
    isAuthenticated.value = appState.isAuthenticated?.value || false
    
    if (!isAuthenticated.value) {
      loading.value = false
      return
    }

    // Ждем пока user будет доступен
    await new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 30
      
      const checkUser = () => {
        attempts++
        if (appState.user?.value) {
          currentUser.value = appState.user.value
          resolve()
        } else if (attempts >= maxAttempts) {
          reject(new Error('Timeout waiting for user data'))
        } else {
          setTimeout(checkUser, 100)
        }
      }
      checkUser()
    })
  } catch (error) {
    console.error('Ошибка загрузки пользователя:', error)
    $notify.error('Ошибка загрузки данных пользователя')
  } finally {
    loading.value = false
  }
}

// Выход из системы
const logout = async () => {
  if (!confirm('Вы уверены, что хотите выйти?')) return
  
  try {
    const result = await appState.logout()
    
    if (result.success) {
      $notify.success('Вы успешно вышли из системы')
      currentUser.value = null
      isAuthenticated.value = false
      await navigateTo('/')
      
      if (process.client) {
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } else {
      $notify.error('Ошибка при выходе из системы')
    }
  } catch (error) {
    console.error('Ошибка выхода:', error)
    $notify.error('Ошибка при выходе из системы')
    await navigateTo('/auth/login')
  }
}

// Загружаем данные при монтировании
onMounted(async () => {
  await loadUserData()
})

// Данные пользователя
const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U'
  return currentUser.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const userName = computed(() => currentUser.value?.name || 'Пользователь')
const userEmail = computed(() => currentUser.value?.email || '')
const userRole = computed(() => currentUser.value?.role || 'user')

// Форма профиля
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Обновляем форму когда данные пользователя загружены
watchEffect(() => {
  if (currentUser.value) {
    profileForm.value = {
      name: currentUser.value.name || '',
      email: currentUser.value.email || '',
      phone: currentUser.value.phone || '',
      address: currentUser.value.address || ''
    }
  }
})

// История заказов
const orders = ref([
  {
    id: 'ORD-001',
    createdAt: new Date('2024-01-15'),
    total: 129990,
    status: 'completed',
    items: [
      { name: 'iPhone 15 Pro', price: 129990, quantity: 1 }
    ]
  },
  {
    id: 'ORD-002', 
    createdAt: new Date('2024-01-10'),
    total: 249990,
    status: 'processing',
    items: [
      { name: 'MacBook Pro 16"', price: 249990, quantity: 1 }
    ]
  }
])

const activeOrdersCount = computed(() => orders.value.filter(order => order.status === 'processing').length)
const completedOrdersCount = computed(() => orders.value.filter(order => order.status === 'completed').length)

// ИСПОЛЬЗУЕМ ИЗБРАННОЕ ИЗ APPSTATE
const favoriteProducts = computed(() => appState.favorites.value?.products || [])

// Функция обновления профиля
const updateProfile = async () => {
  try {
    updatingProfile.value = true
    
    const { data, error } = await useFetch('/api/auth/profile', {
      method: 'PUT',
      body: profileForm.value
    })

    if (error.value) {
      throw error.value
    }

    if (data.value?.success) {
      appState.updateUser(data.value.user)
      currentUser.value = { ...currentUser.value, ...data.value.user }
      await appState.checkAuth()
      $notify.success('Профиль обновлен')
    } else {
      throw new Error(data.value?.message || 'Неизвестная ошибка')
    }
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    $notify.error('Ошибка при обновлении профиля')
  } finally {
    updatingProfile.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    processing: 'badge-info', 
    completed: 'badge-success',
    cancelled: 'badge-error'
  }
  return classes[status] || 'badge-neutral'
}

// const addToCart = (product) => {
//   $notify.success('Товар добавлен в корзину')
// }

// Используем функцию из appState
const removeFavorite = async (product) => {
  await appState.removeFromFavorites(product.id)
}
</script>

<style scoped>
.user-account {
  background: #1f2937;
}

.container {
  background: transparent;
}
</style>