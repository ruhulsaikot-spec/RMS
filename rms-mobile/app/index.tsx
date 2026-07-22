import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/auth-context";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(app)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#030B1F" }}>
      <ActivityIndicator size="large" color="#0891b2" />
    </View>
  );
}