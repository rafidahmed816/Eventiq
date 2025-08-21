// hooks/useConversations.ts
import { useEffect, useRef, useState } from "react";
import { MessagingService } from "../lib/messaging";
import type { ConversationWithDetails } from "../types/messaging";

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  const loadConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await MessagingService.getConversationsForUser(userId);
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversations");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const refreshConversations = async () => {
    setRefreshing(true);
    await loadConversations(false);
    setRefreshing(false);
  };

  const subscribeToConversationUpdates = () => {
    subscriptionRef.current = MessagingService.subscribeToConversations(
      userId,
      () => {
        // Refresh conversations when there's an update
        loadConversations(false);
      }
    );
  };

  const unsubscribeFromUpdates = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  const getConversationById = (conversationId: string) => {
    return conversations.find((conv) => conv.id === conversationId);
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce(
      (total, conv) => total + (conv.unread_count || 0),
      0
    );
  };

  useEffect(() => {
    if (userId) {
      loadConversations();
      subscribeToConversationUpdates();

      return () => {
        unsubscribeFromUpdates();
      };
    }
  }, [userId]);

  return {
    conversations,
    loading,
    refreshing,
    error,
    refreshConversations,
    getConversationById,
    getTotalUnreadCount,
  };
};
