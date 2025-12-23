// server/api/auth/debug-users.get.js
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 DEBUG: Чтение users.json...')
    
    // Путь к файлу users.json
    const usersPath = path.join(process.cwd(), 'server', 'api', 'data', 'users.json')
    console.log('📁 DEBUG: Путь к файлу:', usersPath)
    
    // Чтение файла
    const usersData = fs.readFileSync(usersPath, 'utf8')
    const users = JSON.parse(usersData)
    
    console.log('📁 DEBUG: Данные из users.json:', users)
    
    return {
      success: true,
      users: users,
      count: users.length,
      filePath: usersPath
    }
  } catch (error) {
    console.error('❌ DEBUG: Ошибка чтения users.json:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})