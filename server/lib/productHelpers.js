// server/lib/productHelpers.js
import fs from 'fs/promises'
import path from 'path'

const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json')

// Функция для проверки и создания директории
async function ensureDirectoryExists() {
  const dir = path.dirname(filePath)
  try {
    await fs.access(dir)
    console.log('✅ Директория существует:', dir)
  } catch (error) {
    console.log('📁 Создаем директорию:', dir)
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function readProducts() {
  try {
    console.log(`📖 Чтение продуктов из: ${filePath}`)
    await ensureDirectoryExists()
    
    const data = await fs.readFile(filePath, 'utf-8')
    const products = JSON.parse(data)
    console.log(`✅ Успешно прочитано ${products.length} продуктов`)
    return products
  } catch (error) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, error.message)
    
    if (error.code === 'ENOENT') {
      console.log('📝 Файл не найден, создаем пустой массив')
      await ensureDirectoryExists()
      // Создаем файл с пустым массивом
      await fs.writeFile(filePath, '[]', 'utf-8')
      return []
    }
    return []
  }
}

export async function writeProducts(products) {
  try {
    console.log(`💾 Запись ${products.length} продуктов в: ${filePath}`)
    await ensureDirectoryExists()
    
    const data = JSON.stringify(products, null, 2)
    await fs.writeFile(filePath, data, 'utf-8')
    console.log('✅ Файл успешно записан')
    
    // Проверим, что файл действительно записался
    const stats = await fs.stat(filePath)
    console.log(`📊 Размер файла после записи: ${stats.size} bytes`)
    
    return true
  } catch (error) {
    console.error(`❌ Ошибка записи в файл ${filePath}:`, error)
    console.error('❌ Детали ошибки:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}