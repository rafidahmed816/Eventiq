// lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: "eventiq-auth",
  },
});

// Monitor app state for token refresh
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Types based on your schema
export interface Profile {
  id: string;
  user_id: string;
  role: "organizer" | "traveler";
  full_name?: string;
  phone?: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
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
  created_at: string;
  updated_at: string;
  organizer?: Profile;
  event_images?: EventImage[];
  event_spots?: EventSpot[];
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  sort_order: number;
}

export interface EventSpot {
  id: string;
  event_id: string;
  spot_name: string;
  description?: string;
  sort_order: number;
}

export interface Booking {
  id: string;
  event_id: string;
  traveler_id: string;
  status: "reserved" | "waitlist" | "cancelled" | "confirmed";
  seats_requested: number;
  amount_paid?: number;
  created_at: string;
  updated_at: string;
  event?: Event;
  traveler?: Profile;
}

export interface Conversation {
  id: string;
  event_id?: string;
  organizer_id: string;
  traveler_id: string;
  created_at: string;
  organizer?: Profile;
  traveler?: Profile;
  event?: Event;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  sender?: Profile;
}

export interface Review {
  id: string;
  event_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  event?: Event;
  reviewer?: Profile;
}
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
