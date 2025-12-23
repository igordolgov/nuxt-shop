// server/lib/imageOptimizer.js
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

/**
 * Оптимизирует и сжимает изображение
 * @param {Buffer} imageBuffer - Буфер изображения
 * @param {Object} options - Настройки оптимизации
 * @returns {Promise<Buffer>} - Оптимизированный буфер
 */
export async function optimizeImage(imageBuffer, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'jpeg'
  } = options

  try {
    let sharpInstance = sharp(imageBuffer)
    
    // Получаем метаданные изображения
    const metadata = await sharpInstance.metadata()
    
    // Определяем нужно ли изменять размер
    const needsResize = metadata.width > maxWidth || metadata.height > maxHeight
    
    if (needsResize) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    
    // Оптимизируем в зависимости от формата
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ 
          quality,
          mozjpeg: true,
          progressive: true
        })
        break
        
      case 'png':
        sharpInstance = sharpInstance.png({
          quality: Math.min(quality + 20, 100),
          compressionLevel: 9,
          progressive: true
        })
        break
        
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality,
          effort: 6
        })
        break
        
      default:
        // Для неизвестных форматов используем JPEG
        sharpInstance = sharpInstance.jpeg({ 
          quality,
          mozjpeg: true
        })
    }
    
    return await sharpInstance.toBuffer()
    
  } catch (error) {
    console.error('❌ Ошибка оптимизации изображения:', error)
    throw error
  }
}

/**
 * Определяет оптимальный формат для изображения
 */
export function getOptimalFormat(mimeType) {
  const formatMap = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'jpeg'
  }
  
  return formatMap[mimeType] || 'jpeg'
}

/**
 * Вычисляет качество на основе размера исходного изображения
 */
export function calculateQuality(originalSize, maxSize = 5000000) { // 5MB
  if (originalSize <= 1000000) return 85 // 1MB - высокое качество
  if (originalSize <= 3000000) return 75 // 3MB - среднее качество
  return 65 // >3MB - сильное сжатие
}