// app/(app)/organizer/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../../../lib/notifications';

import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChatScreen } from "../../../components/ChatScreen";
import ConversationList from "../../../components/ConversationList";
import { useAuth } from "../../../context/AuthContext";
import type { ConversationWithDetails } from "../../../types/messaging";

interface NotificationData {
  conversationId: string;
  userRole: 'organizer' | 'traveler';
}

const OrganizerChatScreen: React.FC = () => {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams();
  const { profile, loading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >((conversationId as string) || null);

useEffect(() => {
  // Initialize notifications
  NotificationService.initialize();

  // Set up notification handler
  const notificationListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const notificationData = response.notification.request.content.data as unknown;
      const data = notificationData as NotificationData;
      
      if (data && 
          typeof data.conversationId === 'string' && 
          data.userRole === 'organizer') {
        setSelectedConversation(data.conversationId);
        router.push(`/(app)/organizer/chat?conversationId=${data.conversationId}`);
      }
    }
  );

  return () => {
    notificationListener.remove();
  };
}, []);

  const handleConversationSelect = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation.id);
    router.push(`/(app)/organizer/chat?conversationId=${conversation.id}`);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    router.push("/(app)/organizer/chat");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
          <Text style={styles.errorTitle}>Access Required</Text>
          <Text style={styles.errorText}>Please log in to access chat</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {selectedConversation ? (
        <ChatScreen
          conversationId={selectedConversation}
          currentUser={profile}
          onBack={handleBackToList}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>Chat with travelers</Text>
          </View>
          <ConversationList
            currentUser={profile}
            onConversationSelect={handleConversationSelect}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
});

export default OrganizerChatScreen;
