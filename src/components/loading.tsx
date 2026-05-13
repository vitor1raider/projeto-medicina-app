import { View, Text, StyleSheet } from "react-native"

export function Loading() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carregando...</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
})