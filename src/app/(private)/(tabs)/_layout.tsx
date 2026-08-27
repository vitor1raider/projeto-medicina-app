import { Tabs } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons'
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const unstable_settings = {
  initialRouteName: "home",
};

const TAB_BAR_HEIGHT = verticalScale(110);

const TAB_BAR_BASE_STYLE = {
  height: TAB_BAR_HEIGHT,
  paddingBottom: verticalScale(8),
  paddingTop: verticalScale(12),
  paddingHorizontal: scale(8),
  backgroundColor: "#f2f2f2",
  borderTopWidth: 0,
  elevation: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: verticalScale(-2) },
  shadowOpacity: 0.1,
  shadowRadius: 8,
} as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "transparent" }}
      edges={["top"]}
    >
      <Tabs
        initialRouteName="home"
        screenOptions={{
          sceneStyle: {
            paddingBottom: 0,
          },
          headerShown: false,
          tabBarActiveTintColor: "#E05C7A",
          tabBarInactiveTintColor: "#999",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: moderateScale(12),
            marginTop: verticalScale(4),
          },
          tabBarStyle: TAB_BAR_BASE_STYLE,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Início",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" color={color} size={26} />
            ),
          }}
        />

        <Tabs.Screen
          name="articles"
          options={{
            title: "Artigos",
            tabBarIcon: ({ color }) => (
              <Ionicons name="newspaper-outline" color={color} size={24} />
            ),
          }}
        />

        <Tabs.Screen
          name="agenda"
          options={{
            title: "Agenda",
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar" color={color} size={24} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" color={color} size={26} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
