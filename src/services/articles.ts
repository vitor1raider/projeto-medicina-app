import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Article {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export function subscribeToArticles(callback: () => void): RealtimeChannel {
  return supabase
    .channel('artigos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'artigos' }, () => {
      callback()
    })
    .subscribe()
}
