// lib/messaging.ts
import type {
  Conversation,
  ConversationWithDetails,
  CreateConversationData,
  Message,
  SendMessageData,
} from "../types/messaging";
import { supabase } from "./supabase";

export class MessagingService {
  // Get all conversations for a user (organizer or traveler)
  static async getConversationsForUser(
    userId: string
  ): Promise<ConversationWithDetails[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        event:events(*),
        organizer:profiles!conversations_organizer_id_fkey(*),
        traveler:profiles!conversations_traveler_id_fkey(*)
      `
      )
      .or(`organizer_id.eq.${userId},traveler_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }

    // Get last message and unread count for each conversation
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conversation) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.getLastMessage(conversation.id),
          this.getUnreadCount(conversation.id, userId),
        ]);

        return {
          ...conversation,
          last_message: lastMessage,
          unread_count: unreadCount,
        } as ConversationWithDetails;
      })
    );

    return conversationsWithDetails;
  }

  // Get messages for a specific conversation
  static async getMessagesForConversation(
    conversationId: string
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(*)
      `
      )
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }

    return data || [];
  }

  // Get last message for a conversation
  static async getLastMessage(conversationId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(*)
      `
      )
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching last message:", error);
      throw error;
    }

    return data || null;
  }

  // Get unread count for a conversation
  static async getUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<number> {
    // This is a simplified version. You might want to implement a read_status table
    // For now, we'll return 0 as a placeholder
    return 0;
  }

  // Create a new conversation
  static async createConversation(
    data: CreateConversationData
  ): Promise<Conversation> {
    // First check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("event_id", data.event_id)
      .eq("organizer_id", data.organizer_id)
      .eq("traveler_id", data.traveler_id)
      .single();

    if (existing) {
      return existing;
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }

    return conversation;
  }

  // Send a message
  static async sendMessage(data: SendMessageData): Promise<Message> {
    const { data: message, error } = await supabase
      .from("messages")
      .insert(data)
      .select(
        `
        *,
        sender:profiles(*)
      `
      )
      .single();

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }

    return message;
  }

  // Get conversation by ID with details
  static async getConversationById(
    conversationId: string
  ): Promise<ConversationWithDetails | null> {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        event:events(*),
        organizer:profiles!conversations_organizer_id_fkey(*),
        traveler:profiles!conversations_traveler_id_fkey(*)
      `
      )
      .eq("id", conversationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching conversation:", error);
      throw error;
    }

    return data as ConversationWithDetails;
  }

  // Start a conversation between traveler and organizer for an event
  static async startConversation(
    eventId: string,
    organizerId: string,
    travelerId: string
  ): Promise<Conversation> {
    return this.createConversation({
      event_id: eventId,
      organizer_id: organizerId,
      traveler_id: travelerId,
    });
  }

  // Subscribe to new messages in a conversation
  static subscribeToMessages(
    conversationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to conversation updates
  static subscribeToConversations(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `or(organizer_id.eq.${userId},traveler_id.eq.${userId})`,
        },
        callback
      )
      .subscribe();
  }
}
