// server/api/products/index.post.js
import { readProducts, writeProducts } from '../../lib/productHelpers.js'
import { optimizeImage, getOptimalFormat, calculateQuality } from '../../lib/imageOptimizer.js'
import fs from 'fs/promises'
import path from 'path'

// Функция для сохранения оригинала в случае ошибки оптимизации
async function saveOriginalImage(base64String, productId, imageType = 'main') {
  try {
    const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return base64String
    }

    const imageFormat = matches[1]
    const base64Data = matches[2]
    
    const fileName = `product-${productId}-${imageType}-${Date.now()}.${imageFormat === 'jpeg' ? 'jpg' : imageFormat}`
    const filePath = path.resolve(process.cwd(), 'public', 'images', 'products', fileName)
    
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'))
    
    return `/images/products/${fileName}`
  } catch (error) {
    console.error('❌ Ошибка сохранения оригинала:', error)
    return base64String
  }
}

async function saveBase64Image(base64String, productId, imageType = 'main') {
  try {
    if (!base64String || !base64String.startsWith('data:image/')) {
      return base64String
    }

    const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return base64String
    }

    const originalFormat = matches[1]
    const base64Data = matches[2]
    
    // Декодируем base64
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    console.log(`🖼️ Оптимизация изображения ${imageType}, исходный размер: ${(imageBuffer.length / 1024).toFixed(2)} KB`)
    
    // Определяем настройки оптимизации в зависимости от типа изображения
    const optimizationOptions = {
      maxWidth: imageType === 'main' ? 1200 : 800,
      maxHeight: imageType === 'main' ? 1200 : 800,
      format: 'webp', // Используем современный формат WebP
      quality: calculateQuality(imageBuffer.length)
    }
    
    // Оптимизируем изображение
    const optimizedBuffer = await optimizeImage(imageBuffer, optimizationOptions)
    
    console.log(`✅ Изображение оптимизировано, размер после: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`📊 Экономия: ${((1 - optimizedBuffer.length / imageBuffer.length) * 100).toFixed(1)}%`)
    
    const fileName = `product-${productId}-${imageType}-${Date.now()}.webp`
    const filePath = path.resolve(process.cwd(), 'public', 'images', 'products', fileName)
    
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, optimizedBuffer)
    
    return `/images/products/${fileName}`
    
  } catch (error) {
    console.error('❌ Ошибка оптимизации изображения:', error)
    // В случае ошибки оптимизации сохраняем оригинал
    return await saveOriginalImage(base64String, productId, imageType)
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
      console.log(`🖼️ Обнаружено base64 изображение галереи ${i + 1}, сохраняем как файл...`)
      const savedUrl = await saveBase64Image(image, productId, `gallery-${i}`)
      processedGallery.push(savedUrl)
      console.log(`✅ Изображение галереи ${i + 1} сохранено как:`, savedUrl)
    } else {
      processedGallery.push(image)
    }
  }
  
  return processedGallery
}

console.log('📍 Текущая рабочая директория:', process.cwd())

export default defineEventHandler(async (event) => {
  try {
    let body
    
    try {
      body = await readBody(event)
      console.log('➕ POST /api/products - получены данные через readBody:', body)
    } catch (readError) {
      console.log('❌ Ошибка readBody:', readError.message)
      
      try {
        const rawBody = await readRawBody(event, 'utf-8')
        console.log('📦 Raw body получен, длина:', rawBody?.length)
        
        if (rawBody) {
          body = JSON.parse(rawBody)
          console.log('➕ POST /api/products - получены данные через raw body:', body)
        }
      } catch (rawError) {
        console.error('❌ Ошибка получения raw body:', rawError.message)
      }
    }
    
    if (!body) {
      console.error('❌ Не удалось получить тело запроса')
      throw new Error('Не удалось получить данные товара')
    }
    
    console.log('📖 Чтение файла products.json...')
    const products = await readProducts()
    console.log('📦 Текущее количество товаров в файле:', products.length)
    
    const productId = Date.now().toString()
    
    // Обрабатываем основное изображение если оно есть
    let imageUrl = (body.image || '').toString()
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      console.log('🖼️ Обнаружено base64 основное изображение, сохраняем как файл...')
      imageUrl = await saveBase64Image(imageUrl, productId, 'main')
      console.log('✅ Основное изображение сохранено как:', imageUrl)
    }
    
    // Обрабатываем галерею изображений
    let gallery = []
    if (Array.isArray(body.gallery) && body.gallery.length > 0) {
      console.log('🖼️ Обнаружена галерея изображений, обрабатываем...')
      gallery = await processGalleryImages(body.gallery, productId)
      console.log('✅ Галерея обработана, сохранено изображений:', gallery.length)
    }
    
    // Автоматически определяем inStock на основе stockQuantity
    const stockQuantity = parseInt(body.stockQuantity) || 0
    const inStock = stockQuantity > 0
    
    // Создаем новый товар с безопасными значениями по умолчанию
    const newProduct = {
      id: productId,
      name: (body.name || '').toString().trim() || 'Новый товар',
      description: (body.description || '').toString(),
      price: parseFloat(body.price) || 0,
      image: imageUrl,
      categories: Array.isArray(body.categories) && body.categories.length > 0 
        ? body.categories 
        : (body.categoriesInput 
            ? body.categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat)
            : ['Другое']),
      gallery: gallery,
      inStock: inStock, // Автоматически синхронизировано с stockQuantity
      stockQuantity: stockQuantity,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('🆕 Создан новый товар:', newProduct)
    
    // Добавляем в массив
    products.push(newProduct)
    console.log('📥 Товар добавлен в массив, теперь товаров:', products.length)
    
    // Сохраняем в файл
    console.log('💾 Сохраняем в файл products.json...')
    await writeProducts(products)
    console.log('✅ Файл успешно сохранен')
    
    // Возвращаем объект с новым товаром
    return { 
      success: true, 
      product: newProduct,
      message: 'Товар успешно добавлен'
    }
    
  } catch (error) {
    console.error('❌ Ошибка добавления товара:', error)
    console.error('❌ Stack trace:', error.stack)
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось добавить товар: ' + error.message
    })
  }
})