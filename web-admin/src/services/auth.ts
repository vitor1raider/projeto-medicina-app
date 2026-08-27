import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.session) throw new Error('Login não retornou sessão')
  return data.session
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

export interface AdminProfile {
  id: string
  is_admin: boolean
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (error) throw error
  return data
}
