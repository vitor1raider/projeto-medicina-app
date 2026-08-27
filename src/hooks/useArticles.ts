import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Article, getPublishedArticles, subscribeToArticles } from '../services/articles'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const data = await getPublishedArticles()
        if (isMounted) setArticles(data)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    const channel = subscribeToArticles(load)

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { articles, loading }
}
