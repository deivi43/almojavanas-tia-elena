import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const SESSION_COOKIE = 'admin_session'

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const payload = token.slice(0, lastDot)
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${Buffer.from(sig).toString('base64url')}` === token
}

export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const path = `${Date.now()}.jpg`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
