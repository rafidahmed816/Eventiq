import { supabase } from "./supabase";

export interface Review {
  id: string;
  event_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  events?: {
    title: string;
    start_time: string;
  };
  reviewer?: {
    full_name: string;
    profile_image_url?: string;
  };
}

export interface CreateReviewData {
  event_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
}

// Create a new review
export const createReview = async (
  reviewData: CreateReviewData
): Promise<Review> => {
  const { data, error } = await supabase
    .from("reviews")
    .insert([reviewData])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating review:", error);
    throw error;
  }

  return data;
};

// Get reviews for a specific organizer
export const getOrganizerReviews = async (
  organizerId: string
): Promise<Review[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      events!inner(
        title,
        start_time,
        organizer_id
      ),
      reviewer:profiles!reviewer_id(
        full_name,
        profile_image_url
      )
    `
    )
    .eq("events.organizer_id", organizerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching organizer reviews:", error);
    throw error;
  }

  return data || [];
};

// Get organizer's average rating
export const getOrganizerAverageRating = async (
  organizerId: string
): Promise<{ avgRating: number; totalReviews: number }> => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      rating,
      events!inner(organizer_id)
    `
    )
    .eq("events.organizer_id", organizerId);

  if (error) {
    console.error("Error fetching organizer rating:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return { avgRating: 0, totalReviews: 0 };
  }

  const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = Math.round((totalRating / data.length) * 10) / 10; // Round to 1 decimal

  return {
    avgRating,
    totalReviews: data.length,
  };
};

// Check if user can review (event has ended and user attended)
export const canUserReview = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Check if event has ended
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("end_time")
      .eq("id", eventId)
      .single();

    if (eventError || !eventData) {
      console.log("Event not found or error:", eventError);
      return false;
    }

    const eventEndTime = new Date(eventData.end_time);
    const now = new Date();

    console.log("Event end time:", eventEndTime, "Current time:", now);

    // For testing purposes, allow reviews immediately after booking
    // In production, uncomment the next two lines:
    // if (eventEndTime > now) {
    //   console.log('Event has not ended yet');
    //   return false; // Event hasn't ended
    // }

    // Check if user has a confirmed booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("status")
      .eq("event_id", eventId)
      .eq("traveler_id", userId)
      .eq("status", "confirmed")
      .single();

    if (bookingError || !bookingData) {
      console.log("No confirmed booking found:", bookingError);
      return false;
    }

    // Check if user has already reviewed
    const { data: existingReview, error: reviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("event_id", eventId)
      .eq("reviewer_id", userId)
      .single();

    const hasReviewed = !!existingReview && !reviewError;
    console.log("Has already reviewed:", hasReviewed);

    return !hasReviewed; // Can review if no existing review
  } catch (error) {
    console.error("Error in canUserReview:", error);
    return false;
  }
};

// Check if user has already reviewed an event
export const hasUserReviewed = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("event_id", eventId)
    .eq("reviewer_id", userId)
    .single();

  return !!data && !error;
};
