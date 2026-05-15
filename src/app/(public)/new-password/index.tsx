import { useState } from 'react'
import {
  Alert,
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
import { updatePassword } from '../../../services/auth'

export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (password: string) => {
    if (!password) {
      Alert.alert('Senha é obrigatória')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      Alert.alert('Senha atualizada com sucesso.')
      router.push('/home')
    } catch (error) {
      Alert.alert('Ocorreu um erro ao atualizar a senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Criação de senha</Text>
          <Text style={styles.subtitle}>
            Informe sua nova senha
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua nova senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonBack}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonTextBack}>
                Voltar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => handleSubmit(password)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Confirmando...' : 'Confirmar'}
              </Text>
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
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    height: 48,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonBack: {
    flex: 1,
    height: 48,
    backgroundColor: 'transparent',
    borderColor: "#e5e5e5",
    borderWidth: 1,
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
  buttonTextBack: {
    color: '#52525280',
    fontSize: 16,
    fontWeight: 'bold',
  },
})