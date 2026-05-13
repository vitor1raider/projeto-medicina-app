import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { supabase } from './src/lib/supabase'

export default function App() {
  const [status, setStatus] = useState('Testando conexão com Supabase...')

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.log('Erro Supabase:', error)
        setStatus('Erro ao conectar com o Supabase')
        return
      }

      console.log('Sessão:', data)
      setStatus('Projeto conectado ao Supabase com sucesso!')
    }

    testConnection()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicina App</Text>
      <Text style={styles.text}>{status}</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
})