// server/api/products/[id]/index.get.js
import { readProducts } from '../../../lib/productHelpers.js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  console.log(`🔍 GET /api/products/${id} вызван`)
  
  try {
    const products = await readProducts()
    const product = products.find(p => p.id === id)
    
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Товар не найден'
      })
    }
    
    console.log(`📦 GET /api/products/${id}: Найден товар:`, product.name)
    return product
  } catch (error) {
    console.error(`❌ GET /api/products/${id}: Ошибка:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось загрузить товар'
    })
  }
})