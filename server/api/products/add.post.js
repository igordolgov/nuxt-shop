// server/api/products/add.post.js
import { readProducts, writeProducts } from '../../lib/productHelpers.js'
import fs from 'fs/promises'
import path from 'path'

// ... ваша функция saveBase64Image ...

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('➕ POST /api/products/add - получены данные:', body)
    
    // Читаем текущие товары
    console.log('📖 Чтение файла products.json...')
    const products = await readProducts()
    console.log('📦 Текущее количество товаров в файле:', products.length)
    
    // Создаем ID для нового товара
    const productId = Date.now().toString()
    
    // Обрабатываем изображение если оно есть
    let imageUrl = body.image || ''
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      console.log('🖼️ Обнаружено base64 изображение, сохраняем как файл...')
      imageUrl = await saveBase64Image(imageUrl, productId)
      console.log('✅ Изображение сохранено как:', imageUrl)
    }
    
    // Автоматически определяем inStock на основе stockQuantity
    const stockQuantity = parseInt(body.stockQuantity) || 0
    const inStock = stockQuantity > 0
    
    // Создаем новый товар
    const newProduct = {
      id: productId,
      name: body.name?.toString().trim() || 'Новый товар',
      description: (body.description || '').toString(),
      price: parseFloat(body.price) || 0,
      image: imageUrl,
      categories: Array.isArray(body.categories) ? body.categories : ['Другое'],
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
    const writeResult = await writeProducts(products)
    console.log('✅ Результат записи в файл:', writeResult)
    
    // Проверим, что файл обновился - прочитаем заново
    console.log('🔍 Проверяем обновление файла...')
    const checkProducts = await readProducts()
    console.log('🔍 Проверка: в файле теперь товаров:', checkProducts.length)
    
    // Логируем последний добавленный товар для проверки
    if (checkProducts.length > 0) {
      const lastProduct = checkProducts[checkProducts.length - 1]
      console.log('🔍 Последний товар в файле:', lastProduct.name, lastProduct.id)
    }
    
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
      statusMessage: 'Не удалось добавить товар'
    })
  }
})