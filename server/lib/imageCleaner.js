// server/lib/imageCleaner.js
import fs from 'fs/promises'
import path from 'path'

/**
 * Очищает неиспользуемые изображения продуктов
 */
export async function cleanupUnusedProductImages() {
  try {
    const imagesDir = path.resolve(process.cwd(), 'public', 'images', 'products')
    const products = await readProducts()
    
    // Собираем все используемые изображения
    const usedImages = new Set()
    
    products.forEach(product => {
      if (product.image && product.image.startsWith('/images/products/')) {
        usedImages.add(path.basename(product.image))
      }
      
      if (Array.isArray(product.gallery)) {
        product.gallery.forEach(image => {
          if (image.startsWith('/images/products/')) {
            usedImages.add(path.basename(image))
          }
        })
      }
    })
    
    // Получаем все файлы в директории
    const files = await fs.readdir(imagesDir)
    
    // Удаляем неиспользуемые файлы
    let deletedCount = 0
    for (const file of files) {
      if (!usedImages.has(file)) {
        await fs.unlink(path.join(imagesDir, file))
        deletedCount++
        console.log(`🗑️ Удален неиспользуемый файл: ${file}`)
      }
    }
    
    console.log(`✅ Очистка завершена. Удалено файлов: ${deletedCount}`)
    
  } catch (error) {
    console.error('❌ Ошибка очистки изображений:', error)
  }
}