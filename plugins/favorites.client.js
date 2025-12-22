// plugins/favorites.client.js
export default defineNuxtPlugin((nuxtApp) => {
  // Инициализируем композабл
  const favorites = useFavorites()
  
  // Возвращаем простой объект без вложенности
  return {
    provide: {
      favorites
    }
  }
})