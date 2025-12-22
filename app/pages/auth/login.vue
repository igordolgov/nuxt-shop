<!-- pages/auth/login.vue -->
<template lang="pug">
.login-page
  .min-h-screen.flex.items-center.justify-center.bg-base-200
    .card.w-full.max-w-md.bg-base-100.shadow-xl
      .card-body
        .text-center.mb-8
          h1.card-title.text-3xl.justify-center Вход в систему
          p.text-base-content.opacity-70.mt-2 Введите свои учетные данные

        form(@submit.prevent="handleLogin")
          .form-control
            label.label
              span.label-text Email
            input.input.input-bordered(
              type="email" 
              v-model="form.email"
              placeholder="your@email.com"
              required
              autocomplete="email"
              @input="clearError('email')"
            )
            .label(v-if="errors.email")
              span.label-text-alt.text-error {{ errors.email }}

          .form-control.mt-4
            label.label
              span.label-text Пароль
            .relative
              input.input.input-bordered.w-full(
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                @input="clearError('password')"
              )
              button.absolute.right-1.top-1.btn.btn-ghost.btn-sm(
                type="button"
                @click="showPassword = !showPassword"
              )
                svg.w-4.h-4(
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                )
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83")
                svg.w-4.h-4(
                  v-else
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                )
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z")
            .label(v-if="errors.password")
              span.label-text-alt.text-error {{ errors.password }}

          .form-control.mt-6
            button.btn.btn-primary(
              type="submit"
              :disabled="loading"
              :class="{ 'loading': loading }"
            ) 
              span(v-if="!loading") Войти
              span(v-else) Вход...

          .divider.mt-6 ИЛИ

          .text-center.mt-4
            p.text-sm
              | Нет аккаунта? 
              a.link.link-primary(@click="$router.push('/auth/register')") Зарегистрируйтесь

        <!-- Тестовые данные для разработки -->
        <ClientOnly>
          .card.bg-base-200.mt-4(v-if="isDev")
            .card-body.p-4
              .text-sm.font-bold.mb-2 Тестовые данные:
              .space-y-1
                .flex.justify-between
                  span Email: 
                  code admin@test.com
                .flex.justify-between
                  span Пароль: 
                  code test123
              button.btn.btn-xs.btn-outline.mt-2(@click="fillTestData") Заполнить
        </ClientOnly>

        .alert.alert-error.mt-6(v-if="loginError")
          svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z")
          span {{ loginError }}
          
        .text-center.mt-6.pt-6.border-t
        p.text-xs.text-base-content.opacity-50
          | Проблемы с доступом? 
          a.link.link-error(@click="$router.push('/emergency-logout')") Аварийный выход
</template>

<script setup>
// ИСПРАВЛЕНО: Используем единый источник состояния
const appState = useAppState()
const { login, isAuthenticated, checkAuth } = appState

const router = useRouter()
const { $notify } = useNuxtApp()

// Реактивные данные формы
const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const loginError = ref('')
const errors = ref({})
const loading = ref(false)
const isDev = ref(false)

// Проверка аутентификации при загрузке компонента
onMounted(() => {
  // Устанавливаем isDev только на клиенте
  isDev.value = import.meta.env.DEV
  
  // Проверяем аутентификацию при загрузке страницы
  if (process.client) {
    setTimeout(() => {
      // Проверяем аутентификацию напрямую через auth.checkAuth()
      auth.checkAuth().then(() => {
        if (auth.isAuthenticated.value) {
          console.log('🔐 Пользователь уже авторизован, перенаправляем на главную')
          router.push('/')
        }
      })
    }, 100)
  }

  // Заполняем демо данные при разработке
  if (isDev.value) {
    setTimeout(() => {
      fillTestData()
    }, 500)
  }
})

// Очистка ошибок
const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = ''
  }
  if (loginError.value) {
    loginError.value = ''
  }
}

// Валидация формы
const validateForm = () => {
  errors.value = {}
  let isValid = true
  
  // Валидация email
  if (!form.value.email.trim()) {
    errors.value.email = 'Email обязателен для заполнения'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Некорректный формат email'
    isValid = false
  }
  
  // Валидация пароля
  if (!form.value.password) {
    errors.value.password = 'Пароль обязателен для заполнения'
    isValid = false
  } else if (form.value.password.length < 3) {
    errors.value.password = 'Пароль должен содержать минимум 3 символа'
    isValid = false
  }
  
  return isValid
}

// Обработчик входа - ИСПРАВЛЕННАЯ ВЕРСИЯ
const handleLogin = async () => {
  // Валидация формы
  if (!validateForm()) {
    return
  }

  loginError.value = ''
  loading.value = true
  
  try {
    console.log('🔐 Попытка входа:', { email: form.value.email })
    
    // Используем login из appState
    const result = await login({
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password
    })

    console.log('✅ Результат входа:', result)

    if (result && result.success) {
      console.log('✅ Вход успешен, обновляем состояние')
      
      // Обновляем состояние приложения
      await checkAuth()
      
      // Убеждаемся, что пользователь установлен
      if (appState.user.value) {
        $notify.success(`Рады видеть вас снова, ${appState.user.value.name || 'Пользователь'}!`, 'Добро пожаловать!')
        
        // Небольшая задержка перед переходом
        setTimeout(() => {
          router.push('/')
        }, 100)
      } else {
        throw new Error('Состояние пользователя не обновлено')
      }
    } else {
      loginError.value = result?.error || 'Ошибка входа. Проверьте правильность данных.'
    }
  } catch (error) {
    console.error('❌ Ошибка входа:', error)
    
    // Более детальная обработка ошибок
    if (error.data?.statusMessage) {
      loginError.value = error.data.statusMessage
    } else if (error.status === 401) {
      loginError.value = 'Неверный email или пароль'
    } else if (error.status === 500) {
      loginError.value = 'Ошибка сервера. Попробуйте позже.'
    } else if (error.message?.includes('network')) {
      loginError.value = 'Проблемы с сетью. Проверьте подключение.'
    } else {
      loginError.value = error.message || 'Произошла ошибка при входе. Попробуйте позже.'
    }
  } finally {
    loading.value = false
  }
}

// Заполнение тестовых данных
const fillTestData = () => {
  form.value.email = 'admin@test.com'
  form.value.password = 'test123'
}
</script>