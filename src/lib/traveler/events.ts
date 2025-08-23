// lib/traveler/events.ts
import {
  Event,
  EVENT_CATEGORIES,
  EventImage,
  EventSpot,
} from "../organizer/events";
import { supabase } from "../supabase";

export interface TravelerEvent extends Event {
  images: EventImage[];
  spots?: EventSpot[];
  organizer: {
    id: string;
    full_name: string | null;
    profile_image_url: string | null;
  };
}

export interface EventsResponse {
  events: TravelerEvent[];
  hasMore: boolean;
  nextPage: number | null;
}

// Fetch events with pagination and search
export const fetchTravelerEvents = async (
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  category?: string
): Promise<EventsResponse> => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("events")
    .select(
      `
      *,
      profiles!events_organizer_id_fkey (
        id,
        full_name,
        profile_image_url
      ),
      event_images (
        id,
        image_url,
        sort_order
      )
    `,
      { count: "exact" }
    )
    .gt("spots_remaining", 0) // Only events with available spots
    .gte("start_time", new Date().toISOString()) // Only show events that haven't started yet
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }

  // Apply category filter
  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }

  const events: TravelerEvent[] = (data || []).map((event) => ({
    ...event,
    organizer: event.profiles || {
      id: event.organizer_id || "",
      full_name: "Unknown Organizer",
      profile_image_url: null,
    },
    images: (event.event_images || []).sort(
      (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
    ),
  }));

  const totalCount = count || 0;
  const hasMore = totalCount > offset + events.length;
  const nextPage = hasMore ? page + 1 : null;

  return {
    events,
    hasMore,
    nextPage,
  };
};

// Fetch single event details
export const fetchEventDetails = async (
  eventId: string
): Promise<TravelerEvent> => {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles!events_organizer_id_fkey (
        id,
        full_name,
        profile_image_url,
        phone
      ),
      event_images (
        id,
        image_url,
        sort_order
      ),
      event_spots (
        id,
        spot_name,
        description,
        sort_order
      )
    `
    )
    .eq("id", eventId)
    .single();

  if (error) throw error;

  return {
    ...data,
    organizer: data.profiles,
    images: (data.event_images || []).sort(
      (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
    ),
    spots: (data.event_spots || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ),
  };
};

// Search events with debouncing support
export const searchEvents = async (
  searchQuery: string,
  category?: string,
  limit: number = 20
): Promise<TravelerEvent[]> => {
  if (!searchQuery.trim()) {
    const result = await fetchTravelerEvents(1, limit, undefined, category);
    return result.events;
  }

  let query = supabase
    .from("events")
    .select(
      `
      *,
      profiles!events_organizer_id_fkey (
        id,
        full_name,
        profile_image_url
      ),
      event_images (
        id,
        image_url,
        sort_order
      )
    `
    )
    .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .gt("spots_remaining", 0)
    .gte("start_time", new Date().toISOString()) // Only show events that haven't started yet
    .order("created_at", { ascending: false })
    .limit(limit);

  // Apply category filter if provided and not 'All'
  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((event) => ({
    ...event,
    organizer: event.profiles,
    images: (event.event_images || []).sort(
      (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
    ),
  }));
};

export { EVENT_CATEGORIES };
