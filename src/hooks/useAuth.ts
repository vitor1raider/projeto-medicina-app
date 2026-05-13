import { useEffect, useState } from 'react'
import { getSession, onAuthChange } from '../services/auth'

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const currentSession = await getSession()

        if (isMounted) {
          setSession(currentSession)
        }
      } catch (error) {
        if (isMounted) {
          setSession(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    const { data: listener } = onAuthChange(setSession)

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}