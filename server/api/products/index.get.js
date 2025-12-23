// server/api/products/index.get.js
import { readProducts } from '../../lib/productHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 GET /api/products - запрос получен')
    
    // Принудительно отключаем кэширование для разработки
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')
    
    const products = await readProducts()
    console.log(`📦 GET /api/products - возвращаем ${products.length} товаров`)
    
    // Логируем последние 3 товара для проверки
    if (products.length > 0) {
      const recentProducts = products.slice(-3)
      console.log('📋 Последние 3 товара:', recentProducts.map(p => ({ id: p.id, name: p.name })))
    }
    
    return products
  } catch (error) {
    console.error('❌ GET /api/products - ошибка:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось загрузить продукты'
    })
  }
})