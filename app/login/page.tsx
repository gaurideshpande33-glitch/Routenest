'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib-supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage(''); setBusy(true)
    try {
      if (!supabase) throw new Error('Authentication is not configured yet. Add the public Supabase URL and anon/publishable key to .env.local.')
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account request created. Check your email if confirmation is enabled in Supabase.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('You are signed in successfully. You can now continue to booking.')
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not complete the request.') }
    finally { setBusy(false) }
  }
  return <main className="subpage"><header className="subnav"><Link className="brand" href="/"><span className="brand-icon">↗</span> RouteNest</Link><Link className="back-link" href="/">← Back to routes</Link></header><section className="form-panel"><span className="section-tag">YOUR ROUTENEST ACCOUNT</span><h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1><p>Sign in to continue to bookings and journey details.</p><div className="tab-switch"><button className={mode==='login'?'selected':''} onClick={()=>{setMode('login');setMessage('')}}>Sign in</button><button className={mode==='signup'?'selected':''} onClick={()=>{setMode('signup');setMessage('')}}>Create account</button></div><form onSubmit={submit} className="stack-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} /></label><button className="primary-wide" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in securely':'Create account'} ↗</button></form>{message&&<div className="feedback" role="status">{message}</div>}<p className="small-note">Uses Supabase Authentication when configured. Never share your password with anyone.</p></section></main>
}
