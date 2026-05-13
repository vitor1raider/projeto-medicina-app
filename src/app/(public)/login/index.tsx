import { useEffect, useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../../../lib/supabase'
import { Redirect, router } from 'expo-router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log('Erro ao buscar sessão:', error.message)
      return
    }

    setUserEmail(data.session?.user.email ?? null)
  }

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      Alert.alert('Erro no cadastro', error.message)
      return
    }

    Alert.alert(
      'Cadastro realizado',
      'Usuário criado com sucesso. Verifique o painel Authentication > Users no Supabase.'
    )
  }

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      Alert.alert('Erro no login', error.message)
      return
    }

    Alert.alert('Sucesso', 'Login realizado com sucesso.')
    router.push('/profile')
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('Erro ao sair', error.message)
      return
    }

    Alert.alert('Sucesso', 'Usuário deslogado.')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Autenticação</Text>

      <Text style={styles.status}>
        {userEmail ? `Logado como: ${userEmail}` : 'Nenhum usuário logado'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Carregando...' : 'Criar conta'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  status: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#d94686',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#d94686',
    fontWeight: 'bold',
  },
})