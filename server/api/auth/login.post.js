// server/api/auth/login.post.js
import { readUsers } from '../../lib/userHelpers.js'
import { comparePassword } from '../../lib/authHelpers.js'
import { setUserSession } from '../../utils/session.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('🔐 POST /api/auth/login - попытка входа:', { 
      email: body.email 
    })

    // Валидация
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email и пароль обязательны'
      })
    }

    // Читаем пользователей
    const users = await readUsers()
    console.log('📝 Всего пользователей в базе:', users.length)
    
    if (users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Пользователь не найден'
      })
    }
    
    // Ищем пользователя
    const searchEmail = body.email.toLowerCase().trim()
    const user = users.find(u => u.email.toLowerCase() === searchEmail)
    
    if (!user) {
      console.log('❌ Пользователь не найден:', searchEmail)
      throw createError({
        statusCode: 401,
        statusMessage: 'Неверный email или пароль'
      })
    }

    console.log('👤 Найден пользователь:', { 
      email: user.email, 
      name: user.name,
      role: user.role
    })

    // Проверяем пароль
    console.log('🔑 Начинаем проверку пароля...')
    const isPasswordValid = await comparePassword(body.password, user.password)
    console.log('🔑 Результат проверки пароля:', isPasswordValid)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Неверный email или пароль'
      })
    }

    console.log('✅ Успешный вход:', user.email)

    // СОЗДАЕМ СЕССИЮ
    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        phone: user.phone || '',
        address: user.address || ''
      }
    })

    // Не возвращаем пароль
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Вход выполнен успешно'
    }

  } catch (error) {
    console.error('❌ Ошибка входа:', error)
    
    // Возвращаем понятную ошибку
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Ошибка при входе в систему'
    })
  }
})