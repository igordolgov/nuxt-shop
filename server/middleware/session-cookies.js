// server/middleware/session-cookies.js
export default defineEventHandler((event) => {
  // Добавляем заголовки для CORS и кук на мобильных
  setResponseHeaders(event, {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://ваш-домен.com' 
      : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  })
  
  // Для OPTIONS запросов (preflight)
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})