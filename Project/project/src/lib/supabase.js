import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

export async function loadProfile(user) {
  if (!supabase || !user) return null
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role').eq('id', user.id).single()
  if (error) throw error
  return data
}
