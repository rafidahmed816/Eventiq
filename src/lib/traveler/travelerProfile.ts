// lib/traveler/travelerProfile.ts
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TravelerProfile {
  id: string;
  user_id: string;
  role: 'traveler';
  full_name?: string;
  phone?: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface TravelerBooking {
  id: string;
  event_id: string;
  traveler_id: string;
  status: 'reserved' | 'waitlist' | 'cancelled' | 'confirmed';
  seats_requested: number;
  amount_paid?: number;
  created_at: string;
  updated_at: string;
  event: {
    title: string;
    description?: string;
    category: string;
    start_time: string;
    end_time: string;
    budget_per_person: number;
    organizer: {
      full_name?: string;
    };
  };
}

export interface TravelerReview {
  id: string;
  event_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  event: {
    title: string;
  };
}

export class TravelerProfileService {
  /**
   * Get current traveler's profile
   */
  static async getTravelerProfile(): Promise<TravelerProfile | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .single();

      if (error) {
        console.error('Error fetching traveler profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTravelerProfile:', error);
      return null;
    }
  }

  /**
   * Update traveler profile
   */
  static async updateTravelerProfile(updates: Partial<Pick<TravelerProfile, 'full_name' | 'phone'>>): Promise<TravelerProfile | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .select()
        .single();

      if (error) {
        console.error('Error updating traveler profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTravelerProfile:', error);
      return null;
    }
  }

  /**
   * Get traveler's bookings with event details
   */
  static async getTravelerBookings(): Promise<TravelerBooking[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      // First get the traveler's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .single();

      if (profileError || !profile) {
        console.error('Error fetching traveler profile:', profileError);
        return [];
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events (
            title,
            description,
            category,
            start_time,
            end_time,
            budget_per_person,
            organizer:profiles!organizer_id (
              full_name
            )
          )
        `)
        .eq('traveler_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching traveler bookings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTravelerBookings:', error);
      return [];
    }
  }

  /**
   * Get traveler's reviews
   */
  static async getTravelerReviews(): Promise<TravelerReview[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      // First get the traveler's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .single();

      if (profileError || !profile) {
        console.error('Error fetching traveler profile:', profileError);
        return [];
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          event:events (
            title
          )
        `)
        .eq('reviewer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching traveler reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTravelerReviews:', error);
      return [];
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      return false;
    }
  }

  /**
   * Create a new review
   */
  static async createReview(eventId: string, rating: number, comment?: string): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      // First get the traveler's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .single();

      if (profileError || !profile) {
        console.error('Error fetching traveler profile:', profileError);
        return false;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          event_id: eventId,
          reviewer_id: profile.id,
          rating,
          comment
        });

      if (error) {
        console.error('Error creating review:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createReview:', error);
      return false;
    }
  }

  /**
   * Logout user and clear local data
   */
  static async logout(): Promise<boolean> {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return false;
      }

      // Clear any local storage data
      await AsyncStorage.multiRemove([
        'onboarding_completed',
        'user_role',
        'traveler_profile_cache'
      ]);

      return true;
    } catch (error) {
      console.error('Error in logout:', error);
      return false;
    }
  }

  /**
   * Get traveler's conversation messages
   */
  static async getTravelerConversations(): Promise<any[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No authenticated user found');
      }

      // First get the traveler's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'traveler')
        .single();

      if (profileError || !profile) {
        console.error('Error fetching traveler profile:', profileError);
        return [];
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          event:events (
            title
          ),
          organizer:profiles!organizer_id (
            full_name
          ),
          messages (
            content,
            sent_at,
            sender:profiles!sender_id (
              full_name
            )
          )
        `)
        .eq('traveler_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTravelerConversations:', error);
      return [];
    }
  }
}