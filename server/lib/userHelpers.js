// server/lib/userHelpers.js
import fs from 'fs/promises'
import path from 'path'

// server/lib/userHelpers.js - добавляем функцию
import { getCookie } from 'h3'

export const getUserFromSession = async (event) => {
  try {
    // Пробуем получить сессию через h3
    try {
      const { getUserSession } = await import('../utils/session.js')
      const sessionData = await getUserSession(event)
      if (sessionData?.user) {
        return sessionData.user
      }
    } catch (sessionError) {
      console.log('ℹ️ h3 сессии не доступны, пробуем куки')
    }

    // Пробуем получить из кук
    const userSession = getCookie(event, 'user_session')
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession)
        return sessionData.user
      } catch (parseError) {
        console.error('❌ Ошибка парсинга сессии из куки:', parseError)
        return null
      }
    }

    return null
  } catch (error) {
    console.error('❌ Ошибка получения пользователя из сессии:', error)
    return null
  }
}

const usersFilePath = path.join(process.cwd(), 'server', 'api', 'data', 'users.json')

// Инициализация файла если его нет
const initializeUsersFile = async () => {
  try {
    await fs.access(usersFilePath)
    console.log('✅ Файл users.json существует')
  } catch (error) {
    // Файл не существует, создаем с начальными данными
    const initialUsers = [
      {
        "id": "1",
        "name": "Администратор Системы",
        "email": "admin@test.com",
        "password": "$2b$12$Z84j/WAfqi1lrVfTUg6qfO/o/NtHLP1QtolFrtcM7ulqg3jbeRQM.", // test123
        "role": "admin",
        "phone": "+79991234567",
        "address": "Москва, ул. Примерная, д. 1",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
    
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true })
    await fs.writeFile(usersFilePath, JSON.stringify(initialUsers, null, 2))
    console.log('✅ Файл users.json создан с начальными данными')
  }
}

export const readUsers = async () => {
  try {
    await initializeUsersFile()
    const data = await fs.readFile(usersFilePath, 'utf8')
    const users = JSON.parse(data)
    console.log('📖 Прочитано пользователей из файла:', users.length)
    console.log('👤 Пользователи:', users.map(u => ({ email: u.email, name: u.name })))
    return users
  } catch (error) {
    console.error('❌ Ошибка чтения users.json:', error)
    return []
  }
}

export const writeUsers = async (users) => {
  try {
    console.log('💾 Сохранение пользователей в файл...')
    console.log('📝 Количество пользователей для сохранения:', users.length)
    console.log('📝 Последний пользователь:', users[users.length - 1]?.email)
    
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2))
    console.log('✅ Пользователи успешно сохранены в файл')
    
    // Проверим что записалось
    const verifyData = await fs.readFile(usersFilePath, 'utf8')
    const verifyUsers = JSON.parse(verifyData)
    console.log('🔍 Проверка после записи:', verifyUsers.length, 'пользователей')
    
    return true
  } catch (error) {
    console.error('❌ Ошибка записи users.json:', error)
    throw error
  }
}

// Функция для получения пользователя по ID
export const getUserById = async (id) => {
  const users = await readUsers()
  return users.find(u => u.id === id)
}

// Функция для обновления роли пользователя
export const updateUserRole = async (userId, newRole) => {
  const users = await readUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    throw new Error('Пользователь не найден')
  }
  
  users[userIndex] = {
    ...users[userIndex],
    role: newRole,
    updatedAt: new Date().toISOString()
  }
  
  await writeUsers(users)
  return users[userIndex]
}