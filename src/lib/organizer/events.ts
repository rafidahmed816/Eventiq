import { supabase } from '../supabase';

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
}

export interface EventSpot {
  id: string;
  event_id: string;
  spot_name: string;
  description?: string;
  sort_order: number;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  sort_order: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  category: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  budget_per_person: number;
  total_seats: number;
  cancellation_policy?: string;
  refund_rules?: string;
  spots?: Omit<EventSpot, 'id' | 'event_id'>[];
}

// Fetch all events for organizer
export const fetchOrganizerEvents = async (organizerId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create new event
export const createEvent = async (organizerId: string, eventData: CreateEventData): Promise<Event> => {
  const { spots, ...eventDetails } = eventData;
  
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      ...eventDetails,
      organizer_id: organizerId,
      spots_remaining: eventDetails.total_seats,
    })
    .select()
    .single();

  if (eventError) throw eventError;

  // Add spots if provided
  if (spots && spots.length > 0) {
    const spotsData = spots.map((spot, index) => ({
      ...spot,
      event_id: event.id,
      sort_order: spot.sort_order || index,
    }));

    const { error: spotsError } = await supabase
      .from('event_spots')
      .insert(spotsData);

    if (spotsError) throw spotsError;
  }

  return event;
};

// Update event
export const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>): Promise<Event> => {
  const { spots, ...eventDetails } = eventData;

  const { data, error } = await supabase
    .from('events')
    .update(eventDetails)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete event
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};

// Fetch event spots
export const fetchEventSpots = async (eventId: string): Promise<EventSpot[]> => {
  const { data, error } = await supabase
    .from('event_spots')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add event spots
export const addEventSpots = async (eventId: string, spots: Omit<EventSpot, 'id' | 'event_id'>[]): Promise<EventSpot[]> => {
  const spotsData = spots.map((spot, index) => ({
    ...spot,
    event_id: eventId,
    sort_order: spot.sort_order || index,
  }));

  const { data, error } = await supabase
    .from('event_spots')
    .insert(spotsData)
    .select();

  if (error) throw error;
  return data || [];
};

// Fetch event images
export const fetchEventImages = async (eventId: string): Promise<EventImage[]> => {
  const { data, error } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add event image
export const addEventImage = async (eventId: string, imageUrl: string, sortOrder: number = 0): Promise<EventImage> => {
  const { data, error } = await supabase
    .from('event_images')
    .insert({
      event_id: eventId,
      image_url: imageUrl,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Event categories
export const EVENT_CATEGORIES = [
  'Pilgrimage',
  'City Tour',
  'Adventure',
  'Cultural',
  'Religious',
  'Nature',
  'Historical',
  'Food & Dining',
  'Shopping',
  'Entertainment',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];