<!-- app\pages\force-reset.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body text-center">
        <div class="text-6xl mb-4">🔄</div>
        <h1 class="card-title text-2xl justify-center flex">Принудительный сброс</h1>
        <p class="text-base-content opacity-70 mt-2 mb-6">
          Эта страница полностью сбросит все данные приложения.
        </p>
        
        <div class="space-y-4">
          <button class="btn btn-error w-full" @click="forceReset">
            <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Полный сброс
          </button>
          
          <button class="btn btn-warning w-full" @click="clearAuthOnly">
            <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Сбросить только аутентификацию
          </button>
          
          <button class="btn btn-ghost w-full" @click="$router.push('/auth/login')">
            На страницу входа
          </button>
        </div>
        
        <div class="mt-6 p-4 bg-base-300 rounded-lg">
          <h3 class="font-bold mb-2">Текущее состояние:</h3>
          <div class="text-left text-sm">
            <div>Аутентифицирован: {{ isAuthenticated ? 'Да' : 'Нет' }}</div>
            <div>Пользователь: {{ user?.name || 'Нет' }}</div>
            <div>Email: {{ user?.email || 'Нет' }}</div>
            <div>Роль: {{ user?.role || 'Нет' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, isAuthenticated, logout } = useAuth()

const forceReset = async () => {
  try {
    // Очищаем все хранилища
    if (process.client) {
      localStorage.clear()
      sessionStorage.clear()
      
      // Очищаем все куки
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      })
    }
    
    // Выходим из системы
    await logout()
    
    // Редирект
    window.location.href = '/auth/login'
    
  } catch (error) {
    console.error('Ошибка сброса:', error)
    window.location.href = '/auth/login'
  }
}

const clearAuthOnly = async () => {
  try {
    await logout()
    window.location.href = '/auth/login'
  } catch (error) {
    console.error('Ошибка сброса аутентификации:', error)
    window.location.href = '/auth/login'
  }
}
</script>