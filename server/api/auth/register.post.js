// server/api/auth/register.post.js
import { readUsers, writeUsers } from '../../lib/userHelpers.js'
import { hashPassword } from '../../lib/authHelpers.js'
import { setUserSession } from '../../utils/session.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('👤 POST /api/auth/register - получены данные:', { 
      email: body.email, 
      name: body.name 
    })

    // Валидация
    if (!body.email || !body.password || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Все поля обязательны для заполнения'
      })
    }

    if (body.password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Пароль должен содержать минимум 6 символов'
      })
    }

    // Читаем существующих пользователей
    console.log('📖 Чтение пользователей из файла...')
    const users = await readUsers()
    console.log('📝 Текущие пользователи в файле:', users.length)
    console.log('📧 Существующие emails:', users.map(u => u.email))
    
    // Проверяем, нет ли уже пользователя с таким email
    const searchEmail = body.email.toLowerCase().trim()
    const existingUser = users.find(u => u.email.toLowerCase() === searchEmail)
    
    if (existingUser) {
      console.log('❌ Пользователь уже существует:', {
        requested: searchEmail,
        existing: existingUser.email,
        existingId: existingUser.id
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Пользователь с таким email уже существует'
      })
    }

    // Хэшируем пароль
    console.log('🔑 Хэширование пароля...')
    const hashedPassword = await hashPassword(body.password)
    console.log('✅ Пароль хэширован')

    // Создаем нового пользователя
    const newUser = {
      id: Date.now().toString(),
      name: body.name.trim(),
      email: searchEmail,
      password: hashedPassword,
      role: 'user', // Роль по умолчанию
      phone: '',
      address: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('👤 Новый пользователь создан:', newUser)
    
    // Добавляем пользователя в массив
    users.push(newUser)
    console.log('📝 Всего пользователей после добавления:', users.length)
    
    // Сохраняем в файл
    console.log('💾 Сохранение пользователей в файл...')
    await writeUsers(users)
    console.log('✅ Пользователь сохранен в файл')

    // Создаем сессию
    await setUserSession(event, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address
      }
    })

    // Не возвращаем пароль
    const { password, ...userWithoutPassword } = newUser

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Регистрация успешна'
    }

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error)
    throw createError({
      statusCode: error.statusCode || 400, // Исправлено с 500 на 400
      statusMessage: error.statusMessage || 'Ошибка при регистрации'
    })
  }
})