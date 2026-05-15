import { Redirect, Stack } from 'expo-router'
import { Loading } from '../../components/loading'
import { useAuth } from '../../hooks/useAuth'

export default function PrivateLayout() {
  const { session, loading } = useAuth()

  if (loading) return <Loading />

  if (!session) {
    return <Redirect href="/(public)/login" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}