import {
  cleanupEventStorage,
  UploadResult,
  uploadEventImage as uploadToStorage,
} from "../storage";
import { supabase } from "../supabase";

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
  cancellation_policy?: number; // Hours before event when travelers can cancel
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
  cancellation_policy?: number; // Hours before event when travelers can cancel
  refund_rules?: string;
  spots?: Omit<EventSpot, "id" | "event_id">[];
  images?: string[]; // Array of image URIs (local paths before upload)
}

export interface EventWithImages extends Event {
  images: EventImage[];
}

// Fetch all events for organizer
export const fetchOrganizerEvents = async (
  organizerId: string
): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create new event with image upload
export const createEvent = async (
  organizerId: string,
  eventData: CreateEventData
): Promise<Event> => {
  const { spots, images, ...eventDetails } = eventData;

  // Create event first
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      ...eventDetails,
      organizer_id: organizerId,
      spots_remaining: eventDetails.total_seats,
    })
    .select()
    .single();

  if (eventError) throw eventError;

  try {
    // Upload images if provided
    if (images && images.length > 0) {
      console.log(`Uploading ${images.length} images for event ${event.id}`);

      const uploadPromises = images.map(async (imageUri, index) => {
        const fileName = `image_${index}`;
        const uploadResult = await uploadToStorage(
          event.id,
          imageUri,
          fileName
        );

        return {
          event_id: event.id,
          image_url: uploadResult.url,
          sort_order: index,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Save image records to database
      const { error: imagesError } = await supabase
        .from("event_images")
        .insert(uploadedImages);

      if (imagesError) {
        console.error("Database images insert error:", imagesError);
        throw imagesError;
      }

      console.log(
        `Successfully uploaded and saved ${uploadedImages.length} images`
      );
    }

    // Add spots if provided
    if (spots && spots.length > 0) {
      const spotsData = spots.map((spot, index) => ({
        ...spot,
        event_id: event.id,
        sort_order: spot.sort_order || index,
      }));

      const { error: spotsError } = await supabase
        .from("event_spots")
        .insert(spotsData);

      if (spotsError) throw spotsError;
    }

    return event;
  } catch (error) {
    console.error("Error during event creation, cleaning up...", error);

    // If image upload or spots creation fails, cleanup the created event
    try {
      await deleteEventWithCleanup(event.id);
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }

    throw error;
  }
};

// Delete event with proper cleanup
const deleteEventWithCleanup = async (eventId: string): Promise<void> => {
  try {
    // First cleanup storage files if cleanupEventStorage is available
    if (typeof cleanupEventStorage === "function") {
      await cleanupEventStorage(eventId);
    } else {
      // Manual cleanup if function is not available
      try {
        const { data: files, error: listError } = await supabase.storage
          .from("event-images")
          .list(`events/${eventId}`, { limit: 100 });

        if (!listError && files && files.length > 0) {
          const filePaths = files.map(
            (file) => `events/${eventId}/${file.name}`
          );
          await supabase.storage.from("event-images").remove(filePaths);
        }
      } catch (storageError) {
        console.error("Manual storage cleanup error:", storageError);
      }
    }

    // Then delete from database (cascade will handle related records)
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) throw error;
  } catch (error) {
    console.error("Delete event error:", error);
    throw new Error("Failed to delete event");
  }
};

// Public delete event function
export const deleteEvent = async (eventId: string): Promise<void> => {
  return deleteEventWithCleanup(eventId);
};

// Update event
export const updateEvent = async (
  eventId: string,
  eventData: Partial<CreateEventData>
): Promise<Event> => {
  const { spots, images, ...eventDetails } = eventData;

  // If total_seats is being updated, we need to handle spots_remaining carefully
  let updateData: any = { ...eventDetails };

  if (eventDetails.total_seats !== undefined) {
    // Get current event data to check existing bookings
    const { data: currentEvent, error: fetchError } = await supabase
      .from("events")
      .select("total_seats, spots_remaining")
      .eq("id", eventId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate how many seats are currently booked
    const currentlyBooked =
      currentEvent.total_seats - currentEvent.spots_remaining;

    // Ensure new total_seats is not less than currently booked seats
    if (eventDetails.total_seats < currentlyBooked) {
      throw new Error(
        `Cannot reduce total seats to ${eventDetails.total_seats}. ${currentlyBooked} seats are already booked.`
      );
    }

    // Calculate new spots_remaining
    updateData.spots_remaining = eventDetails.total_seats - currentlyBooked;
  }

  const { data, error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fetch event spots
export const fetchEventSpots = async (
  eventId: string
): Promise<EventSpot[]> => {
  const { data, error } = await supabase
    .from("event_spots")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add event spots
export const addEventSpots = async (
  eventId: string,
  spots: Omit<EventSpot, "id" | "event_id">[]
): Promise<EventSpot[]> => {
  const spotsData = spots.map((spot, index) => ({
    ...spot,
    event_id: eventId,
    sort_order: spot.sort_order || index,
  }));

  const { data, error } = await supabase
    .from("event_spots")
    .insert(spotsData)
    .select();

  if (error) throw error;
  return data || [];
};

// Fetch event images
export const fetchEventImages = async (
  eventId: string
): Promise<EventImage[]> => {
  const { data, error } = await supabase
    .from("event_images")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add event image
export const addEventImage = async (
  eventId: string,
  imageUrl: string,
  sortOrder: number = 0
): Promise<EventImage> => {
  const { data, error } = await supabase
    .from("event_images")
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
  "Pilgrimage",
  "City Tour",
  "Adventure",
  "Cultural",
  "Religious",
  "Nature",
  "Historical",
  "Food & Dining",
  "Shopping",
  "Entertainment",
] as const;

// Upload image to Supabase Storage (wrapper function)
export const uploadEventImage = async (
  eventId: string,
  imageUri: string,
  fileName: string
): Promise<UploadResult> => {
  try {
    return await uploadToStorage(eventId, imageUri, fileName);
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Delete image from Supabase Storage
export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split("/storage/v1/object/public/event-images/");
    if (urlParts.length < 2) {
      throw new Error("Invalid image URL format");
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("event-images")
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error("Delete image error:", error);
    throw new Error("Failed to delete image");
  }
};

// Remove image from database
export const removeEventImage = async (imageId: string): Promise<void> => {
  const { error } = await supabase
    .from("event_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;
};

// Get event with images
export const fetchEventWithImages = async (
  eventId: string
): Promise<Event & { images: EventImage[] }> => {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError) throw eventError;

  const { data: images, error: imagesError } = await supabase
    .from("event_images")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (imagesError) throw imagesError;

  return { ...event, images: images || [] };
};

// Fetch events with images
export const fetchOrganizerEventsWithImages = async (
  organizerId: string
): Promise<EventWithImages[]> => {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(
      `
      *,
      event_images (
        id,
        image_url,
        sort_order
      )
    `
    )
    .eq("organizer_id", organizerId)
    .order("created_at", { ascending: false });

  if (eventsError) throw eventsError;

  return (
    events?.map((event) => ({
      ...event,
      images:
        event.event_images?.sort(
          (a: EventImage, b: EventImage) => a.sort_order - b.sort_order
        ) || [],
    })) || []
  );
};

// Add single image to existing event
export const addImageToEvent = async (
  eventId: string,
  imageUri: string
): Promise<EventImage> => {
  try {
    // Check current image count
    const { data: existingImages, error: countError } = await supabase
      .from("event_images")
      .select("id")
      .eq("event_id", eventId);

    if (countError) throw countError;

    if (existingImages && existingImages.length >= 5) {
      throw new Error("Maximum 5 images allowed per event");
    }

    // Upload to storage
    const fileName = `additional_${Date.now()}`;
    const uploadResult = await uploadToStorage(eventId, imageUri, fileName);

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from("event_images")
      .insert({
        event_id: eventId,
        image_url: uploadResult.url,
        sort_order: existingImages?.length || 0,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return imageRecord;
  } catch (error) {
    console.error("Add image error:", error);
    throw error;
  }
};
