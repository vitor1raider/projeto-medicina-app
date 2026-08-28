import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text, TextInput } from 'react-native'
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins'

type ComponentWithDefaultStyle = {
  defaultProps?: { style?: unknown }
}

function setDefaultFont(component: ComponentWithDefaultStyle) {
  component.defaultProps ??= {}
  component.defaultProps.style = [
    { fontFamily: 'Poppins_400Regular' },
    component.defaultProps.style,
  ]
}

setDefaultFont(Text as unknown as ComponentWithDefaultStyle)
setDefaultFont(TextInput as unknown as ComponentWithDefaultStyle)

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  if (fontError) throw fontError
  if (!fontsLoaded) return null

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(public)' />
        <Stack.Screen name='(private)' />
      </Stack>
    </>
  )
}
