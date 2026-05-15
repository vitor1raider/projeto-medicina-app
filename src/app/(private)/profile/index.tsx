import { router } from 'expo-router'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text>Tela de perfil</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/agenda/agenda')}>
        <Text style={styles.buttonText}>Ir para Agenda</Text>
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
    marginTop: 24,
    backgroundColor: '#E05C7A',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
})
