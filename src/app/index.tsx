import { Redirect } from 'expo-router'
import { useAuth } from '../hooks/useAuth'
import { Loading } from '../components/loading'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <Loading />

  if (session) {
    return <Redirect href="/(private)/profile" />
  }

  return <Redirect href="/(public)/login" />
}