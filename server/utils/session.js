// server/utils/session.js
import { useSession } from 'h3'

export const setUserSession = async (event, sessionData) => {
  const session = await useSession(event, {
    password: process.env.SESSION_PASSWORD || 'default-session-password-at-least-32-chars',
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: ''
    }
  })
  
  await session.update(sessionData)
  return session
}

export const getUserSession = async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_PASSWORD || 'default-session-password-at-least-32-chars',
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: ''
    }
  })
  
  return session.data
}

export const clearUserSession = async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_PASSWORD || 'default-session-password-at-least-32-chars',
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: ''
    }
  })
  
  await session.clear()
}