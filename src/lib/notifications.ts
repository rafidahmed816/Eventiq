import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export class NotificationService {
  static async initialize() {
    // Request permissions (required for iOS)
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true, // ✅ new
        shouldShowList: true,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("messages", {
        name: "Messages",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
      });
    }

    return true;
  }

  static async scheduleMessageNotification(message: {
    sender: { full_name: string };
    content: string;
    conversation_id: string;
    userRole: 'organizer' | 'traveler';
  }) {
    const lastNotificationTime = await AsyncStorage.getItem(
      `lastNotification_${message.conversation_id}`
    );

    // Prevent notification spam by setting a minimum interval (e.g., 30 seconds)
    if (lastNotificationTime) {
      const timeSinceLastNotification =
        Date.now() - parseInt(lastNotificationTime, 10);
      if (timeSinceLastNotification < 30000) {
        return;
      }
    }

    await AsyncStorage.setItem(
      `lastNotification_${message.conversation_id}`,
      Date.now().toString()
    );

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Message from ${message.sender.full_name}`,
        body: message.content,
        data: { 
            conversationId: message.conversation_id,
            userRole: message.userRole},
      },
      trigger: null, // Show immediately
    });
  }

  static async registerForPushNotifications() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // Replace with your Expo project ID
      });
      return token.data;
    } catch (error) {
      console.error("Failed to get push token:", error);
      return null;
    }
  }
}
