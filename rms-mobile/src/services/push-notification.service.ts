import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiClient } from "../lib/api-client";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token - permission not granted");
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "6b726946-d3d1-4ffe-95bd-d64e22629224",
      });
      
      // Get FCM token for Android
      if (Platform.OS === "android") {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        await apiClient.post("/device-tokens/register", {
          token: deviceToken.data,
          platform: "android",
        });
        return deviceToken.data;
      }
      
      return token.data;
    } catch (e) {
      console.log("Push token error:", e);
      return null;
    }
  },

  async unregisterToken(token: string) {
    try {
      await apiClient.post("/device-tokens/unregister", {
        token,
        platform: "android",
      });
    } catch (e) {}
  },
};