// components/ConversationList.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MessagingService } from "../lib/messaging";
import type { ConversationWithDetails, Profile } from "../types/messaging";
import {CONSTANTS} from "../constants/constants";
interface ConversationListProps {
  currentUser: Profile;
  onConversationSelect?: (conversation: ConversationWithDetails) => void;
}

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  currentUser: Profile;
  onPress: (conversation: ConversationWithDetails) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUser,
  onPress,
}) => {
  const isOrganizer = currentUser.role === "organizer";
  const otherUser = isOrganizer
    ? conversation.traveler
    : conversation.organizer;
  const lastMessage = conversation.last_message;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        conversation.unread_count > 0 && styles.unreadConversation,
      ]}
      onPress={() => onPress(conversation)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(otherUser?.full_name || "U")[0].toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {otherUser?.full_name || "Unknown User"}
          </Text>
          {lastMessage && (
            <Text style={styles.timestamp}>
              {formatTime(lastMessage.sent_at)}
            </Text>
          )}
        </View>

        <Text style={styles.eventTitle} numberOfLines={1}>
          {conversation.event?.title || "Unknown Event"}
        </Text>

        <View style={styles.messagePreview}>
          {lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.sender_id === currentUser.id ? "You: " : ""}
              {lastMessage.content}
            </Text>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ConversationList: React.FC<ConversationListProps> = ({
  currentUser,
  onConversationSelect,
}) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await MessagingService.getConversationsForUser(
        currentUser.id
      );
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
      Alert.alert("Error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: ConversationWithDetails) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    } else {
      // Navigate to chat screen with conversation ID
      if (currentUser.role === "organizer") {
        router.push({
          pathname: "/(app)/organizer/chat",
          params: { conversationId: conversation.id },
        });
      } else {
        router.push({
          pathname: "/(app)/traveler/chat",
          params: { conversationId: conversation.id },
        });
      }
    }
  };

  useEffect(() => {
    loadConversations();

    // Subscribe to conversation updates
    const subscription = MessagingService.subscribeToConversations(
      currentUser.id,
      () => {
        loadConversations(); // Refresh conversations when there's an update
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser.id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={CONSTANTS.PRIMARY_COLOR} />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>
          {currentUser.role === "organizer"
            ? "Travelers will appear here when they message you about your events"
            : 'Start a conversation with event organizers by visiting events and tapping "Message Organizer"'}
        </Text>
        {currentUser.role === "traveler" && (
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(app)/traveler/events")}
          >
            <Text style={styles.browseButtonText}>Browse Events</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          currentUser={currentUser}
          onPress={handleConversationPress}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={CONSTANTS.PRIMARY_COLOR}
        />
      }
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 1,
    borderRadius: 12,
  },
  unreadConversation: {
    backgroundColor: "#f8f9ff",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  noMessages: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ConversationList;
