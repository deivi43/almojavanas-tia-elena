'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'admin_session'

async function signToken(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const b64 = Buffer.from(sig).toString('base64url')
  return `${payload}.${b64}`
}

async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const payload = token.slice(0, lastDot)
  const expected = await signToken(payload)
  return expected === token
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()

  const adminEmail = (process.env.ADMIN_EMAIL ?? '').trim()
  const adminPassword = (process.env.ADMIN_PASSWORD ?? '').trim()

  if (email !== adminEmail || password !== adminPassword) {
    return { error: 'Correo o contraseña incorrectos.' }
  }

  const payload = `admin:${Date.now()}`
  const token = await signToken(payload)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false
  return verifyToken(token)
}
