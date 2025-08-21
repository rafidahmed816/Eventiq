// hooks/useChat.ts
import { useEffect, useRef, useState } from "react";
import { MessagingService } from "../lib/messaging";
import type { ConversationWithDetails, Message } from "../types/messaging";

export const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] =
    useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  const loadConversation = async () => {
    try {
      const conversationData = await MessagingService.getConversationById(
        conversationId
      );
      setConversation(conversationData);
    } catch (err) {
      console.error("Error loading conversation:", err);
      setError("Failed to load conversation");
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await MessagingService.getMessagesForConversation(
        conversationId
      );
      setMessages(messagesData);
      setError(null);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, senderId: string) => {
    if (!content.trim()) return null;

    try {
      const message = await MessagingService.sendMessage({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      });

      // Add message to local state if not already present
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      return message;
    } catch (err) {
      console.error("Error sending message:", err);
      throw new Error("Failed to send message");
    }
  };

  const subscribeToMessages = () => {
    subscriptionRef.current = MessagingService.subscribeToMessages(
      conversationId,
      (payload) => {
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      }
    );
  };

  const unsubscribeFromMessages = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadConversation();
      loadMessages();
      subscribeToMessages();

      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [conversationId]);

  return {
    messages,
    conversation,
    loading,
    error,
    sendMessage,
    refreshMessages: loadMessages,
    refreshConversation: loadConversation,
  };
};
