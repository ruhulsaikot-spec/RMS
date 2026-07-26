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
    console.log("Registering push notifications...");
    console.log("Is physical device:", Device.isDevice);
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return null;
    }

    console.log("Checking permissions...");
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("Existing permission status:", existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      console.log("Requesting permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("New permission status:", finalStatus);
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token - permission not granted");
      return null;
    }

    console.log("Getting device push token...");
    try {
      if (Platform.OS === "android") {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        console.log("FCM token:", deviceToken.data);
        await apiClient.post("/device-tokens/register", {
          token: deviceToken.data,
          platform: "android",
        });
        console.log("Device token registered successfully");
        return deviceToken.data;
      }
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "6b726946-d3d1-4ffe-95bd-d64e22629224",
      });
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