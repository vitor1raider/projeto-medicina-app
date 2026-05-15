import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { session } = useAuth();

  function handleGoToForgotPassword() {
    router.push('/forgot-password')
  }

  useEffect(() => {
    if (session) {
      router.replace('/home')
    }
  }, [session])

  function handleGoToRegister() {
    router.push('/login/register')
  }

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        Alert.alert('Erro ao entrar', 'E-mail ou senha inválidos.')
        return
      }

      router.replace('/home')
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar o login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Acesse sua conta para continuar
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleGoToForgotPassword}>
            <Text style={styles.recoveryPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerArea}>
            <Text style={styles.registerText}>Ainda não tem uma conta?</Text>

            <TouchableOpacity onPress={handleGoToRegister}>
              <Text style={styles.registerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  button: {
    height: 48,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  registerText: {
    color: '#666',
  },
  recoveryPassword: {
    color: '#8b5cf6',
    textAlign: 'right',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  registerLink: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
})