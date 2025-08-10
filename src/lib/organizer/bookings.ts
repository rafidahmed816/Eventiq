import { supabase } from '../supabase';

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

export interface BookingWithDetails extends Booking {
  traveler: {
    id: string;
    full_name?: string;
    phone?: string;
    user_id: string;
  };
  event: {
    id: string;
    title: string;
    start_time: string;
    budget_per_person: number;
  };
}

export interface Payment {
  id: string;
  booking_id: string;
  stripe_payment_intent: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  created_at: string;
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  waitlist_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  total_seats_booked: number;
}

// Fetch bookings for organizer's events
export const fetchOrganizerBookings = async (organizerId: string): Promise<BookingWithDetails[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      traveler:profiles!bookings_traveler_id_fkey(
        id,
        full_name,
        phone,
        user_id
      ),
      event:events!bookings_event_id_fkey(
        id,
        title,
        start_time,
        budget_per_person
      )
    `)
    .eq('event.organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch bookings for specific event
export const fetchEventBookings = async (eventId: string): Promise<BookingWithDetails[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      traveler:profiles!bookings_traveler_id_fkey(
        id,
        full_name,
        phone,
        user_id
      ),
      event:events!bookings_event_id_fkey(
        id,
        title,
        start_time,
        budget_per_person
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status']
): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get booking statistics for organizer
export const getOrganizerBookingStats = async (organizerId: string): Promise<BookingStats> => {
  // Get all bookings for organizer's events
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events!bookings_event_id_fkey(
        organizer_id,
        budget_per_person
      )
    `)
    .eq('event.organizer_id', organizerId);

  if (error) throw error;

  const stats: BookingStats = {
    total_bookings: bookings.length,
    confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
    waitlist_bookings: bookings.filter(b => b.status === 'waitlist').length,
    cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
    total_revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.amount_paid || 0), 0),
    total_seats_booked: bookings
      .filter(b => ['confirmed', 'reserved'].includes(b.status))
      .reduce((sum, b) => sum + b.seats_requested, 0),
  };

  return stats;
};

// Get booking statistics for specific event
export const getEventBookingStats = async (eventId: string): Promise<BookingStats> => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;

  const stats: BookingStats = {
    total_bookings: bookings.length,
    confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
    waitlist_bookings: bookings.filter(b => b.status === 'waitlist').length,
    cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
    total_revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.amount_paid || 0), 0),
    total_seats_booked: bookings
      .filter(b => ['confirmed', 'reserved'].includes(b.status))
      .reduce((sum, b) => sum + b.seats_requested, 0),
  };

  return stats;
};

// Fetch payments for organizer
export const fetchOrganizerPayments = async (organizerId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      booking:bookings!payments_booking_id_fkey(
        event:events!bookings_event_id_fkey(
          organizer_id
        )
      )
    `)
    .eq('booking.event.organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;
};

// Confirm booking (move from waitlist to confirmed)
export const confirmBooking = async (bookingId: string): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) throw error;
};