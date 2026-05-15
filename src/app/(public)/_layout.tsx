import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function PublicLayout() {
  const { loading, session } = useAuth()

  useEffect(() => {
    if (!loading && session) {
      router.replace('/home')
    }
  }, [loading, session])

  if (loading) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}