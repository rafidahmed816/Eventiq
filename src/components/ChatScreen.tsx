// components/ChatScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CONSTANTS } from "../constants/constants";
import { MessagingService } from "../lib/messaging";
import type {
  ConversationWithDetails,
  Message,
  Profile,
} from "../types/messaging";
export { ChatScreen };

interface ChatScreenProps {
  conversationId: string;
  currentUser: Profile;
  onBack?: () => void;
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isLastMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  isLastMessage,
}) => {
  const isOwn = message.sender_id === currentUserId;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
        isLastMessage && styles.lastMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isOwn ? styles.ownMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatTime(message.sent_at)}
        </Text>
      </View>
    </View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId,
  currentUser,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] =
    useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const loadConversation = async () => {
    try {
      const conversationData = await MessagingService.getConversationById(
        conversationId
      );
      if (conversationData) {
        setConversation(conversationData);
      } else {
        Alert.alert("Error", "Conversation not found");
        onBack?.();
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      Alert.alert("Error", "Failed to load conversation");
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await MessagingService.getMessagesForConversation(
        conversationId
      );
      setMessages(messagesData);
    } catch (error) {
      console.error("Error loading messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const messageContent = messageText.trim();
    setMessageText("");
    setSending(true);

    try {
      const newMessage = await MessagingService.sendMessage({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: messageContent,
      });

      // Add message to state (the subscription will handle this too, but we add it here for immediate UI feedback)
      setMessages((prev) => {
        // Avoid duplicates by checking if message already exists
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setMessageText(messageContent); // Restore the message text on error
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConversation();
    loadMessages();

    // Subscribe to new messages
    const subscription = MessagingService.subscribeToMessages(
      conversationId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates by checking both ID and content+timestamp
            const isDuplicate = prev.some(
              (msg) =>
                msg.id === newMessage.id ||
                (msg.content === newMessage.content &&
                  msg.sender_id === newMessage.sender_id &&
                  Math.abs(
                    new Date(msg.sent_at).getTime() -
                      new Date(newMessage.sent_at).getTime()
                  ) < 1000)
            );

            if (isDuplicate) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const getOtherUser = () => {
    if (!conversation) return null;
    return currentUser.role === "organizer"
      ? conversation.traveler
      : conversation.organizer;
  };

  const renderHeader = () => {
    const otherUser = getOtherUser();

    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={CONSTANTS.PRIMARY_COLOR}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {otherUser?.full_name || "Unknown User"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {conversation?.event?.title || "Unknown Event"}
          </Text>
        </View>
      </View>
    );
  };

  const renderInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
        multiline
        maxLength={1000}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!messageText.trim() || sending) && styles.sendButtonDisabled,
        ]}
        onPress={sendMessage}
        disabled={!messageText.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={CONSTANTS.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MessageItem
            message={item}
            currentUserId={currentUser.id}
            isLastMessage={index === messages.length - 1}
          />
        )}
        style={styles.messagesList}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      {renderInput()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
  messageContainer: {
    marginVertical: 4,
  },
  lastMessage: {
    marginBottom: 16,
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  ownMessageBubble: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherMessageTime: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    height: 40,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
