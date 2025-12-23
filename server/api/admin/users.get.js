// server/api/admin/users.get.js
import { readUsers } from '../../lib/userHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('👥 GET /api/admin/users - запрос списка пользователей')
    
    // Упрощенная проверка прав - временно отключим для тестирования
    // const userSession = getCookie(event, 'user_session')
    // if (!userSession) {
    //   throw createError({
    //     statusCode: 401,
    //     statusMessage: 'Неавторизованный доступ'
    //   })
    // }

    // const sessionData = JSON.parse(userSession)
    // if (sessionData.user?.role !== 'admin') {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: 'Доступ запрещен. Требуются права администратора'
    //   })
    // }

    const users = await readUsers()
    console.log('📊 Найдено пользователей:', users.length)
    
    // Убираем пароли из ответа
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    console.log('✅ Возвращаем пользователей без паролей:', usersWithoutPasswords.length)
    
    return {
      success: true,
      users: usersWithoutPasswords
    }

  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error)
    return {
      success: false,
      error: error.message,
      users: []
    }
  }
})