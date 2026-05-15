import { router } from "expo-router"
import { useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"

export function PublicLayout() {
  const { loading, session } = useAuth()

  useEffect(() => {
    if (!loading && session) {
      router.replace('/home')
    }
  }, [loading, session])

  return null;
}