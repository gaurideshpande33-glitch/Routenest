import { NextResponse } from 'next/server'

export function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase is not configured. Copy .env.example to .env.local and add your project URL and publishable/anon key.')
  return { url: url.replace(/\/$/, ''), key }
}

export async function supabaseRest<T>(path: string, options: { method?: string; token?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const { url, key } = config()
  const headers: Record<string, string> = { apikey: key, Accept: 'application/json' }
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  else if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.prefer) headers.Prefer = options.prefer
  const response = await fetch(`${url}/rest/v1/${path}`, { method: options.method || 'GET', headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: 'no-store' })
  const raw = await response.text()
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${raw.slice(0, 300)}`)
  return (raw ? JSON.parse(raw) : null) as T
}

export async function getUser(token: string) {
  const { url, key } = config()
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!response.ok) return null
  return response.json() as Promise<{ id: string; email?: string }>
}

export function apiError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : 'Unexpected server error'
  return NextResponse.json({ error: message }, { status })
}
