// lib/traveler/bookings.ts
import { supabase } from "../supabase";
import { Event, EventImage } from "../organizer/events";

export interface Booking {
  id: string;
  event_id: string;
  traveler_id: string;
  status: 'reserved' | 'waitlist' | 'cancelled' | 'confirmed';
  seats_requested: number;
  amount_paid?: number;
  created_at: string;
  updated_at: string;
}

export interface BookingWithEvent extends Booking {
  events: Event & {
    event_images: EventImage[];
    profiles: {
      id: string;
      full_name: string | null;
      profile_image_url: string | null;
    };
  };
}

export interface CreateBookingData {
  event_id: string;
  traveler_id: string;
  seats_requested: number;
}

// Create a new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  // First check if event has enough spots
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('spots_remaining, total_seats')
    .eq('id', bookingData.event_id)
    .single();

  if (eventError) throw eventError;
  
  if (!event) {
    throw new Error('Event not found');
  }

  // Determine booking status
  const status = event.spots_remaining >= bookingData.seats_requested ? 'confirmed' : 'waitlist';

  // Create the booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      ...bookingData,
      status,
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  // Update spots remaining if confirmed
  if (status === 'confirmed') {
    const { error: updateError } = await supabase
      .from('events')
      .update({
        spots_remaining: event.spots_remaining - bookingData.seats_requested
      })
      .eq('id', bookingData.event_id);

    if (updateError) {
      // Rollback booking if update fails
      await supabase.from('bookings').delete().eq('id', booking.id);
      throw updateError;
    }
  }

  return booking;
};

// Fetch user's bookings
export const fetchUserBookings = async (userId: string): Promise<BookingWithEvent[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      events (
        *,
        event_images (
          id,
          image_url,
          sort_order
        ),
        profiles!events_organizer_id_fkey (
          id,
          full_name,
          profile_image_url
        )
      )
    `)
    .eq('traveler_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(booking => ({
    ...booking,
    events: {
      ...booking.events,
      event_images: booking.events.event_images?.sort(
        (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
      ) || [],
    }
  })) || [];
};

// Cancel a booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  // Get booking details first
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, events(spots_remaining)')
    .eq('id', bookingId)
    .single();

  if (fetchError) throw fetchError;
  
  if (!booking || booking.status === 'cancelled') {
    throw new Error('Booking not found or already cancelled');
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (updateError) throw updateError;

  // If booking was confirmed, restore spots
  if (booking.status === 'confirmed') {
    const { error: spotsError } = await supabase
      .from('events')
      .update({
        spots_remaining: booking.events.spots_remaining + booking.seats_requested
      })
      .eq('id', booking.event_id);

    if (spotsError) throw spotsError;
  }
};

// Get booking by ID
export const fetchBookingById = async (bookingId: string): Promise<BookingWithEvent | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      events (
        *,
        event_images (
          id,
          image_url,
          sort_order
        ),
        profiles!events_organizer_id_fkey (
          id,
          full_name,
          profile_image_url
        )
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;

  if (!data) return null;

  return {
    ...data,
    events: {
      ...data.events,
      event_images: data.events.event_images?.sort(
        (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
      ) || [],
    }
  };
};

// Check if user has already booked an event
export const checkExistingBooking = async (
  eventId: string, 
  userId: string
): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('event_id', eventId)
    .eq('traveler_id', userId)
    .neq('status', 'cancelled')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  return data || null;
};