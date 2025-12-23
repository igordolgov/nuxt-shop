// server/api/auth/user.get.js
import { getUserSession } from '../../utils/session.js'

export default defineEventHandler(async (event) => {
  try {
    // Используем ту же систему сессий, что и при логине
    const sessionData = await getUserSession(event)
    const user = sessionData?.user || null
    
    if (!user) {
      console.log('👤 Пользователь не аутентифицирован (сессия не найдена)')
      return {
        user: null,
        isAuthenticated: false
      }
    }

    console.log('👤 GET /api/auth/user - текущий пользователь из сессии:', user?.email)
    
    return {
      user,
      isAuthenticated: !!user
    }
  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error)
    return {
      user: null,
      isAuthenticated: false
    }
  }
})