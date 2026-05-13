import 'expo-sqlite/localStorage/install'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Supabase URL ou publishable key não configurada no .env')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)