// components/MessageButton.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { MessagingService } from "../lib/messaging";
import type { Profile } from "../types/messaging";
import { CONSTANTS } from "../constants/constants";
interface MessageButtonProps {
  eventId: string;
  organizerId: string;
  currentUser: Profile;
  style?: any;
}

const MessageButton: React.FC<MessageButtonProps> = ({
  eventId,
  organizerId,
  currentUser,
  style,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMessagePress = async () => {
    if (currentUser.id === organizerId) {
      Alert.alert("Info", "You can't message yourself");
      return;
    }

    if (currentUser.role !== "traveler") {
      Alert.alert(
        "Info",
        "Only travelers can start conversations with organizers"
      );
      return;
    }

    setLoading(true);

    try {
      // Create or get existing conversation
      const conversation = await MessagingService.startConversation(
        eventId,
        organizerId,
        currentUser.id
      );

      // Navigate to chat screen
      router.push(`/(app)/traveler/chat?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      Alert.alert("Error", "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.id === organizerId) {
    return null; // Don't show message button for own events
  }

  return (
    <TouchableOpacity
      style={[styles.messageButton, style]}
      onPress={handleMessagePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.messageButtonText}>Message Organizer</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MessageButton;
