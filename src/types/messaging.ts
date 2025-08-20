// types/messaging.ts
export interface Profile {
  id: string;
  user_id?: string;
  role: 'organizer' | 'traveler';
  full_name?: string;
  phone?: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id?: string;
  title: string;
  description?: string;
  category: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  budget_per_person: number;
  total_seats: number;
  spots_remaining: number;
  cancellation_policy?: string;
  refund_rules?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  event_id?: string;
  organizer_id?: string;
  traveler_id?: string;
  created_at: string;
  // Relations
  event?: Event;
  organizer?: Profile;
  traveler?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  content: string;
  sent_at: string;
  // Relations
  sender?: Profile;
}

export interface ConversationWithDetails extends Conversation {
  event: Event;
  organizer: Profile;
  traveler: Profile;
  last_message?: Message;
  unread_count: number;
}

export interface CreateConversationData {
  event_id: string;
  organizer_id: string;
  traveler_id: string;
}

export interface SendMessageData {
  conversation_id: string;
  sender_id: string;
  content: string;
}