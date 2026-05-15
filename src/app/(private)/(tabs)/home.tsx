import { View, Text, StyleSheet } from "react-native"

export default function Home() {
  return (
    <View style={styles.container}>
      <Text>Tela inicial</Text>
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
  }
})
