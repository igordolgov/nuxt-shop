<!-- pages/admin/users.vue -->
<template lang="pug">
.admin-users-page
  .container.mx-auto.p-6
    .card.bg-base-100.shadow-xl
      .card-body
        .flex.justify-between.items-center.mb-6
          h1.card-title Управление пользователями
          .flex.items-center.gap-4
            .badge.badge-primary.badge-lg Администратор
            NuxtLink.btn.btn-outline(to="/admin") ← Назад к дашборду

        //- Сообщение о загрузке
        .text-center.py-8(v-if="loading")
          .loading.loading-spinner.loading-lg
          p.mt-4 Загрузка пользователей...

        //- Сообщение об ошибке
        .alert.alert-error.mb-6(v-if="error")
          svg.w-6.h-6(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
            path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z")
          span {{ error }}
          button.btn.btn-sm.btn-ghost.ml-auto(@click="loadUsers") Повторить

        //- Таблица пользователей
        .overflow-x-auto(v-else-if="users.length > 0")
          table.table.table-zebra
            thead
              tr
                th ID
                th Имя
                th Email
                th Роль
                th Телефон
                th Зарегистрирован
                th Действия
            tbody
              tr(v-for="user in users" :key="user.id")
                td.font-mono.text-xs {{ user.id.slice(-6) }}
                td {{ user.name }}
                td {{ user.email }}
                td
                  select.select.select-xs(
                    :value="user.role" 
                    @change="updateUserRole(user.id, $event.target.value)"
                    :disabled="user.id === currentUserId"
                  )
                    option(value="user") Пользователь
                    option(value="manager") Менеджер
                    option(value="admin") Администратор
                  .text-xs.text-gray-500.mt-1(v-if="user.id === currentUserId") (это вы)
                td {{ user.phone || '—' }}
                td.text-xs {{ formatDate(user.createdAt) }}
                td
                  .flex.gap-1
                    button.btn.btn-ghost.btn-xs(
                      @click="editUser(user)"
                      title="Редактировать профиль"
                    )
                      svg.w-4.h-4(fill="none" stroke="currentColor" viewBox="0 0 24 24")
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z")
                    button.btn.btn-error.btn-xs(
                      @click="deleteUser(user)"
                      :disabled="user.id === currentUserId"
                      title="Удалить пользователя"
                    )
                      svg.w-4.h-4(fill="none" stroke="currentColor" viewBox="0 0 24 24")
                        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16")

        //- Пустое состояние
        .text-center.py-12(v-else-if="!loading")
          .text-6xl.mb-4 👥
          h3.text-xl.font-semibold.mb-2 Пользователи не найдены
          p.text-base-content.opacity-70.mb-4 Зарегистрируйте первого пользователя
          button.btn.btn-primary(@click="loadUsers") Обновить

        //- Статистика
        .flex.justify-between.items-center.mt-6.text-sm(v-if="users.length > 0")
          .stats.shadow
            .stat
              .stat-title Всего пользователей
              .stat-value {{ users.length }}
            .stat
              .stat-title Администраторов
              .stat-value {{ adminCount }}
            .stat
              .stat-title Менеджеров
              .stat-value {{ managerCount }}
            .stat
              .stat-title Пользователей
              .stat-value {{ userCount }}
</template>

<script setup>
definePageMeta({
  middleware: 'admin-auth'
})

const { $notify } = useNuxtApp()
const appState = useAppState()

const users = ref([])
const loading = ref(true)
const error = ref('')

// Текущий пользователь (админ)
const currentUserId = computed(() => appState.user?.value?.id || '')

// Статистика
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const managerCount = computed(() => users.value.filter(u => u.role === 'manager').length)
const userCount = computed(() => users.value.filter(u => u.role === 'user').length)

// Загрузка пользователей
const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('👥 Загрузка списка пользователей...')
    
    // Используем $fetch вместо useFetch чтобы избежать предупреждения
    const data = await $fetch('/api/admin/users')
    
    console.log('📊 Ответ от сервера:', data)
    
    if (data?.success) {
      users.value = data.users
      console.log('✅ Пользователи загружены:', users.value.length)
    } else {
      throw new Error(data?.error || 'Ошибка загрузки пользователей')
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки пользователей:', err)
    error.value = err.message || 'Не удалось загрузить пользователей'
    $notify.error('Ошибка загрузки пользователей')
  } finally {
    loading.value = false
  }
}

// Обновление роли пользователя
const updateUserRole = async (userId, newRole) => {
  try {
    console.log('🔄 Обновление роли:', { userId, newRole })
    
    // Проверяем что роль изменилась
    const currentUser = users.value.find(u => u.id === userId)
    if (currentUser.role === newRole) {
      console.log('ℹ️ Роль не изменилась')
      return
    }
    
    const data = await $fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: { role: newRole }
    })
    
    console.log('📊 Ответ от сервера:', data)
    
    if (data?.success) {
      // Обновляем локальный список
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex] = data.user
      }
      
      $notify.success(`Роль пользователя изменена на "${newRole}"`)
      console.log('✅ Роль обновлена')
    } else {
      throw new Error(data?.message || 'Ошибка обновления роли')
    }
  } catch (err) {
    console.error('❌ Ошибка обновления роли:', err)
    
    let errorMessage = 'Ошибка обновления роли'
    if (err.status === 404) {
      errorMessage = 'Endpoint для изменения роли не найден. Проверьте сервер.'
    } else if (err.data?.statusMessage) {
      errorMessage = err.data.statusMessage
    }
    
    $notify.error(errorMessage)
    
    // Перезагружаем список чтобы откатить изменения в UI
    await loadUsers()
  }
}

// Редактирование пользователя
const editUser = (user) => {
  console.log('✏️ Редактирование пользователя:', user)
  $notify.info(`Редактирование пользователя ${user.name}`, 'В разработке')
}

// Удаление пользователя
const deleteUser = async (user) => {
  if (!confirm(`Удалить пользователя "${user.name}" (${user.email})?`)) return
  
  try {
    console.log('🗑️ Удаление пользователя:', user.id)
    
    const data = await $fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE'
    })
    
    if (data?.success) {
      $notify.success(`Пользователь ${user.name} удален`)
      await loadUsers() // Перезагружаем список
    } else {
      throw new Error(data?.message || 'Ошибка удаления')
    }
  } catch (err) {
    console.error('❌ Ошибка удаления пользователя:', err)
    $notify.error(err.message || 'Ошибка удаления пользователя')
  }
}

// Форматирование даты
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Загружаем пользователей при монтировании
onMounted(() => {
  loadUsers()
})
</script>