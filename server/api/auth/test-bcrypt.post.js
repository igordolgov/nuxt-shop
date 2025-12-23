// server/api/auth/test-bcrypt.post.js
import { hashPassword, comparePassword } from '../../lib/authHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { password } = body
    
    console.log('🧪 Тестирование bcrypt...')
    
    // Хэшируем пароль
    const hash = await hashPassword(password)
    console.log('🔑 Хэш создан:', hash)
    
    // Проверяем пароль
    const isValid = await comparePassword(password, hash)
    console.log('🔑 Проверка прошла:', isValid)
    
    return {
      success: true,
      originalPassword: password,
      hash: hash,
      isValid: isValid
    }
  } catch (error) {
    console.error('❌ Ошибка тестирования bcrypt:', error)
    return {
      success: false,
      error: error.message
    }
  }
})