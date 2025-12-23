// server/api/admin/users/[id].delete.js
import { readUsers, writeUsers } from '../../../lib/userHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    // Проверяем права администратора
    const userSession = getCookie(event, 'user_session')
    if (!userSession) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Неавторизованный доступ'
      })
    }

    const sessionData = JSON.parse(userSession)
    if (sessionData.user?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Доступ запрещен. Требуются права администратора'
      })
    }

    const userId = getRouterParam(event, 'id')
    const users = await readUsers()
    
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Пользователь не найден'
      })
    }
    
    // Не позволяем удалить самого себя
    if (users[userIndex].id === sessionData.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Нельзя удалить свою собственную учетную запись'
      })
    }
    
    const deletedUser = users.splice(userIndex, 1)[0]
    await writeUsers(users)
    
    console.log('✅ Пользователь удален:', deletedUser.email)
    
    return {
      success: true,
      message: `Пользователь ${deletedUser.email} удален`
    }
    
  } catch (error) {
    console.error('❌ Ошибка удаления пользователя:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Ошибка сервера'
    })
  }
})