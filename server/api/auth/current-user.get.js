// server/api/auth/current-user.get.js
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromSession(event)
    
    console.log('🔍 Текущий пользователь из сессии:', user)
    
    return {
      success: true,
      user: user
    }
  } catch (error) {
    console.error('❌ Ошибка получения текущего пользователя:', error)
    return {
      success: false,
      error: error.message
    }
  }
})