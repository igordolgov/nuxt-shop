// server/api/admin/users/[id]/role.put.js
import { readUsers, writeUsers } from '../../../../lib/userHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔄 PUT /api/admin/users/[id]/role - обновление роли')
    
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    console.log('📝 Данные запроса:', { userId, body })
    
    if (!body.role || !['user', 'manager', 'admin'].includes(body.role)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Недопустимая роль'
      })
    }

    // Читаем пользователей
    const users = await readUsers()
    console.log('👥 Всего пользователей:', users.length)
    
    const userIndex = users.findIndex(u => u.id === userId)
    console.log('🔍 Индекс пользователя:', userIndex)
    
    if (userIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Пользователь не найден'
      })
    }

    // Сохраняем старую роль для логов
    const oldRole = users[userIndex].role
    
    // Обновляем роль
    users[userIndex] = {
      ...users[userIndex],
      role: body.role,
      updatedAt: new Date().toISOString()
    }

    // Сохраняем изменения
    await writeUsers(users)

    const { password, ...userWithoutPassword } = users[userIndex]

    console.log('✅ Роль пользователя обновлена:', {
      email: userWithoutPassword.email,
      from: oldRole,
      to: body.role
    })

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Роль пользователя обновлена'
    }

  } catch (error) {
    console.error('❌ Ошибка обновления роли:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Ошибка сервера'
    })
  }
})