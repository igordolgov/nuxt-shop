// server/lib/seedAdmin.js
import { readUsers, writeUsers } from './userHelpers.js'
import { hashPassword } from './authHelpers.js'

export const seedAdminUser = async () => {
  try {
    const users = await readUsers()
    
    // Проверяем, есть ли уже админ
    const adminExists = users.find(u => u.role === 'admin')
    
    if (!adminExists) {
      console.log('👨‍💼 Создаем тестового администратора...')
      
      const adminPassword = await hashPassword('admin123')
      const adminUser = {
        id: '1',
        name: 'Администратор',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      users.push(adminUser)
      await writeUsers(users)
      console.log('✅ Тестовый администратор создан: admin@example.com / admin123')
    } else {
      console.log('✅ Администратор уже существует')
    }
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error)
  }
}

// Автоматически создаем админа при импорте
seedAdminUser()