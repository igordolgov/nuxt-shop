// server/api/auth/test-profile.put.js
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    console.log('🧪 Тестовый endpoint - полученные данные:', body)
    
    return {
      success: true,
      message: 'Тестовый endpoint работает',
      receivedData: body
    }
  } catch (error) {
    console.error('❌ Ошибка в тестовом endpoint:', error)
    return {
      success: false,
      error: error.message
    }
  }
})