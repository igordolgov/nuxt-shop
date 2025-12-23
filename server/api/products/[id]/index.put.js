// server/api/products/[id]/index.put.js
import { readProducts, writeProducts } from '../../../lib/productHelpers.js'
import { optimizeImage, calculateQuality } from '../../../lib/imageOptimizer.js'
import fs from 'fs/promises'
import path from 'path'

async function saveBase64Image(base64String, productId, imageType = 'main') {
  try {
    if (!base64String || !base64String.startsWith('data:image/')) {
      return base64String
    }

    const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return base64String
    }

    const base64Data = matches[2]
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    console.log(`🖼️ Оптимизация изображения ${imageType}, исходный размер: ${(imageBuffer.length / 1024).toFixed(2)} KB`)
    
    const optimizationOptions = {
      maxWidth: imageType === 'main' ? 1200 : 800,
      maxHeight: imageType === 'main' ? 1200 : 800,
      format: 'webp',
      quality: calculateQuality(imageBuffer.length)
    }
    
    const optimizedBuffer = await optimizeImage(imageBuffer, optimizationOptions)
    
    console.log(`✅ Изображение оптимизировано, размер после: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`)
    
    const fileName = `product-${productId}-${imageType}-${Date.now()}.webp`
    const filePath = path.resolve(process.cwd(), 'public', 'images', 'products', fileName)
    
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, optimizedBuffer)
    
    return `/images/products/${fileName}`
    
  } catch (error) {
    console.error('❌ Ошибка оптимизации изображения:', error)
    return base64String
  }
}

async function processGalleryImages(gallery, productId) {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return []
  }
  
  const processedGallery = []
  
  for (let i = 0; i < gallery.length; i++) {
    const image = gallery[i]
    if (image && image.startsWith('data:image/')) {
      const savedUrl = await saveBase64Image(image, productId, `gallery-${i}`)
      processedGallery.push(savedUrl)
    } else {
      processedGallery.push(image)
    }
  }
  
  return processedGallery
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const products = await readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Товар не найден'
      })
    }
    
    let imageUrl = body.image || products[index].image
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      imageUrl = await saveBase64Image(imageUrl, id, 'main')
    }
    
    let gallery = body.gallery || products[index].gallery
    if (Array.isArray(gallery)) {
      gallery = await processGalleryImages(gallery, id)
    }
    
    // Автоматически синхронизируем inStock с stockQuantity
    const stockQuantity = body.stockQuantity !== undefined 
      ? parseInt(body.stockQuantity) 
      : products[index].stockQuantity
    const inStock = stockQuantity > 0
    
    const updatedProduct = {
      ...products[index],
      ...body,
      image: imageUrl,
      gallery: gallery,
      inStock: inStock, // Автоматически синхронизировано
      stockQuantity: stockQuantity,
      updatedAt: new Date().toISOString()
    }
    
    products[index] = updatedProduct
    await writeProducts(products)
    
    return { 
      success: true, 
      product: updatedProduct
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось обновить товар'
    })
  }
})