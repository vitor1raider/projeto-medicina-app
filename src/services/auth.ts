import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

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

export async function forgotPassword(email: string) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'projeto-medicina-app://new-password',
    })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}