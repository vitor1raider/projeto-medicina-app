import { router } from 'expo-router'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { signOut } from '../../../services/auth'
import { Ionicons } from '@expo/vector-icons'

export default function Profile() {
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      throw new Error('Erro ao sair')
    }
    router.replace('/login')
  }
  return (
    <View style={styles.container}>
      <Text>Tela de perfil</Text>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Ionicons name='log-out-outline' size={20} color='white' />
        <Text style={styles.label}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    width: '40%',
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  label: {
    color: 'white',
  }
})
