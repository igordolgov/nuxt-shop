// server/api/auth/debug-session.get.js
export default defineEventHandler(async (event) => {
  try {
    const session = await useSession(event, {
      password: process.env.SESSION_SECRET || 'default-secret-key-at-least-32-chars',
      name: 'auth-session'
    })
    
    const cookies = parseCookies(event)
    
    return {
      success: true,
      sessionData: session.data,
      cookies: cookies,
      sessionConfig: {
        name: 'auth-session'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

const parseCookies = (event) => {
  const cookieHeader = getHeader(event, 'cookie')
  if (!cookieHeader) return {}
  
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=')
    cookies[name] = value
    return cookies
  }, {})
}