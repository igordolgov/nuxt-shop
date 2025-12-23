// server/api/auth/logout.post.js
export default defineEventHandler(async (event) => {
  try {
    console.log('🚪 Выход из системы')
    
    // Очищаем все возможные куки сессии
    const cookies = [
      'user_session',
      'auth_token',
      'session_id',
      'user'
    ]
    
    cookies.forEach(cookieName => {
      deleteCookie(event, cookieName, {
        path: '/',
        domain: '',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      })
    })

    // Также очищаем серверную сессию если используете h3 сессии
    try {
      const { clearUserSession } = await import('../../utils/session.js')
      await clearUserSession(event)
    } catch (error) {
      console.log('ℹ️ Серверные сессии не используются или уже очищены')
    }
    
    console.log('✅ Все куки и сессии очищены')
    
    return {
      success: true,
      message: 'Выход выполнен успешно'
    }
  } catch (error) {
    console.error('❌ Ошибка выхода:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при выходе'
    })
  }
})