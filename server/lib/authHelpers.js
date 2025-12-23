// server\lib\authHelpers.js
import bcrypt from 'bcryptjs'

// Хэшируем пароль
export const hashPassword = async (password) => {
  try {
    const saltRounds = 12
    console.log('🔑 Хэширование пароля...')
    const hash = await bcrypt.hash(password, saltRounds)
    console.log('✅ Пароль хэширован')
    return hash
  } catch (error) {
    console.error('❌ Ошибка хэширования пароля:', error)
    throw error
  }
}

// Сравниваем пароль с хэшем
export const comparePassword = async (password, hash) => {
  try {
    console.log('🔑 Сравнение пароля с хэшем...')
    console.log('🔑 Длина пароля:', password?.length)
    console.log('🔑 Длина хэша:', hash?.length)
    
    if (!password || !hash) {
      console.log('❌ Отсутствует пароль или хэш')
      return false
    }
    
    const isValid = await bcrypt.compare(password, hash)
    console.log('🔑 Результат сравнения:', isValid)
    return isValid
  } catch (error) {
    console.error('❌ Ошибка сравнения пароля:', error)
    throw error
  }
}