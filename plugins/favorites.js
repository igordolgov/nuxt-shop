// plugins/favorites.js
export default defineNuxtPlugin(() => {
  const favorites = useFavorites()
  
  return {
    provide: {
      favorites
    }
  }
})