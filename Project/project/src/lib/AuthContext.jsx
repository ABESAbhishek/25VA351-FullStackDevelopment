import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { isSupabaseConfigured, loadProfile, supabase } from './supabase'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return undefined
    let alive = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!alive) return
      setUser(session?.user ?? null)
      if (session?.user) {
        try { setProfile(await loadProfile(session.user)) } catch (error) { console.error('Could not load account profile', error) }
      }
      if (alive) setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase is not configured. Add the two VITE_SUPABASE values to .env.local.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const nextProfile = await loadProfile(data.user)
    setUser(data.user); setProfile(nextProfile)
    return nextProfile
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  return <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, configured: isSupabaseConfigured }}>{children}</AuthContext.Provider>
}
