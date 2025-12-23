// server/api/products/[id]/index.delete.js
import { readProducts, writeProducts } from '../../../lib/productHelpers.js'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    const products = await readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Товар не найден'
      })
    }
    
    products.splice(index, 1)
    await writeProducts(products)
    
    return { 
      success: true, 
      message: 'Товар успешно удален'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось удалить товар'
    })
  }
})