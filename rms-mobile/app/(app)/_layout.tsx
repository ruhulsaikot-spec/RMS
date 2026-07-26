import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#f0f4ff",
          borderTopColor: "rgba(37,99,235,0.15)",
          borderTopWidth: 1,
          shadowColor: "#2563eb",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: "Claims",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📄</Text>,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text>,
        }}
      />
      <Tabs.Screen
        name="claims/new"
        options={{ tabBarButton: () => <></>, tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="claims/[id]"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="claims/details"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="approvals/[id]"
        options={{ tabBarButton: () => <></>, tabBarItemStyle: { display: "none" } }}
      />
    </Tabs>
  );
}