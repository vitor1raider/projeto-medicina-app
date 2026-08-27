import { supabase } from '../lib/supabase'

export interface Article {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export async function listArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export interface ArticleInput {
  title: string
  content: string
  cover_image_url: string | null
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('artigos')
    .insert({
      ...input,
      published: false,
      created_by: userData.user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export type ArticlePatch = Partial<Pick<Article, 'title' | 'content' | 'cover_image_url' | 'published'>>

export async function updateArticle(id: string, patch: ArticlePatch): Promise<Article> {
  const { data, error } = await supabase
    .from('artigos')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase.from('artigos').delete().eq('id', id)
  if (error) throw error
}

export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('article-media').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('article-media').getPublicUrl(path)
  return data.publicUrl
}
