// server/api/admin/stats.get.js
import { readUsers } from '../../lib/userHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('📊 GET /api/admin/stats - запрос статистики')

    // Проверяем права доступа (админ)
    const userSession = getCookie(event, 'user_session')
    if (!userSession) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Неавторизованный доступ'
      })
    }

    const sessionData = JSON.parse(userSession)
    if (sessionData.user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Недостаточно прав'
      })
    }

    // Получаем пользователей
    const users = await readUsers()
    
    // Убираем пароли из ответа
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    // Считаем статистику
    const adminCount = users.filter(u => u.role === 'admin').length
    const managerCount = users.filter(u => u.role === 'manager').length
    const userCount = users.filter(u => u.role === 'user').length
    
    // Новые пользователи за последние 7 дней
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const newUsersCount = users.filter(u => new Date(u.createdAt) > weekAgo).length

    // Получаем продукты (если у вас есть доступ к данным продуктов)
    // Если нет, можно получить через другой endpoint или использовать фиксированное значение
    const productsCount = 31 // Замените на реальное количество из вашей базы

    return {
      success: true,
      stats: {
        totalUsers: users.length,
        totalProducts: productsCount,
        adminCount,
        managerCount,
        userCount,
        newUsersCount,
        users: usersWithoutPasswords.slice(0, 5) // Последние 5 пользователей
      }
    }

  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Ошибка при получении статистики'
    })
  }
})