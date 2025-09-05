// lib/organizer/attendees.ts - Updated with debugging and fixes

import { supabase } from "../supabase";

export type BookingStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "reserved"
  | "waitlist";

export interface EventAttendee {
  id: string;
  user_id: string;
  event_id: string;
  booking_date: string;
  seats_booked: number;
  status: BookingStatus;
  total_amount: number;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
  };
}

export interface EventWithAttendees {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  max_capacity: number;
  current_bookings: number;
  total_revenue: number;
  image_url?: string;
  attendees_count: number;
  attendees: EventAttendee[];
}

export interface EventSummary {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  max_capacity: number;
  current_bookings: number;
  total_revenue: number;
  image_url?: string;
  attendees_count: number;
}

// Debug function to check what's in the database
export const debugOrganizerData = async (userAuthId: string) => {
  console.log("🔍 DEBUG: Starting organizer data check", { userAuthId });

  // Check if organizer profile exists for this auth user
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userAuthId)
    .single();

  console.log("👤 Profile check:", {
    found: !!profile,
    profileId: profile?.id,
    role: profile?.role,
    error: profileError?.message,
  });

  if (!profile) {
    console.log("❌ No profile found for this auth user");
    return {
      profile: null,
      allEvents: [],
      organizerEvents: [],
      organizers: [],
    };
  }

  const organizerId = profile.id;

  // Check all events in the database
  const { data: allEvents, error: allEventsError } = await supabase
    .from("events")
    .select("id, title, organizer_id, start_time")
    .limit(10);

  console.log("📅 All events check:", {
    count: allEvents?.length || 0,
    error: allEventsError?.message,
    events: allEvents?.map((e) => ({
      id: e.id,
      title: e.title,
      organizer_id: e.organizer_id,
    })),
  });

  // Check events specifically for this organizer (using profile.id)
  const { data: organizerEvents, error: organizerEventsError } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId);

  console.log("🎯 Organizer events check:", {
    organizerId,
    count: organizerEvents?.length || 0,
    error: organizerEventsError?.message,
    events: organizerEvents,
  });

  // Check if there are any profiles with role='organizer'
  const { data: organizers, error: organizersError } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, role")
    .eq("role", "organizer");

  console.log("👥 All organizers check:", {
    count: organizers?.length || 0,
    error: organizersError?.message,
    organizers: organizers,
  });

  return {
    profile,
    allEvents,
    organizerEvents,
    organizers,
  };
};

export const getOrganizerEventsWithAttendees = async (
  userAuthId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  events: EventSummary[];
  totalCount: number;
  hasMore: boolean;
}> => {
  try {
    console.log("[Attendees|getOrganizerEventsWithAttendees] START", {
      userAuthId,
      page,
      limit,
      ts: Date.now(),
    });

    // First, get the organizer profile ID from the user auth ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("user_id", userAuthId)
      .single();

    console.log("[Attendees|getOrganizerEventsWithAttendees] profile query", {
      userAuthId,
      profileId: profile?.id,
      role: profile?.role,
      error: profileError?.message || null,
    });

    if (profileError) {
      console.error("❌ Profile query error:", profileError);
      throw new Error(`Profile not found: ${profileError.message}`);
    }

    if (!profile) {
      console.log("📭 No profile found for user");
      return {
        events: [],
        totalCount: 0,
        hasMore: false,
      };
    }

    if (profile.role !== "organizer") {
      throw new Error("User is not an organizer");
    }

    const organizerId = profile.id;
    console.log(
      "[Attendees|getOrganizerEventsWithAttendees] Using organizer ID",
      {
        organizerId,
        userAuthId,
      }
    );

    const offset = (page - 1) * limit;

    // First, get all events for this organizer with more detailed logging
    const eventsQuery = supabase
      .from("events")
      .select(
        `
        id,
        title,
        start_time,
        category,
        total_seats,
        organizer_id
      `
      )
      .eq("organizer_id", organizerId) // Now using the correct organizer ID
      .order("start_time", { ascending: false });

    console.log(
      "🔍 About to execute events query with organizerId:",
      organizerId
    );

    const { data: events, error: eventsError } = await eventsQuery.range(
      offset,
      offset + limit - 1
    );

    console.log(
      "[Attendees|getOrganizerEventsWithAttendees] events query result",
      {
        count: events?.length ?? 0,
        error: eventsError || null,
        rawData: events,
        organizerId,
      }
    );

    if (eventsError) {
      console.error("❌ Events query error:", eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      console.log("📭 No events found for organizer");

      // Additional debugging - check if the organizer_id exists in any events
      const { data: anyEvents, error: anyError } = await supabase
        .from("events")
        .select("organizer_id")
        .limit(5);

      console.log("🔍 Sample organizer_ids in events table:", {
        sample: anyEvents?.map((e) => e.organizer_id),
        error: anyError,
      });

      return {
        events: [],
        totalCount: 0,
        hasMore: false,
      };
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("events")
      .select("id", { count: "exact" })
      .eq("organizer_id", organizerId);

    console.log("[Attendees|getOrganizerEventsWithAttendees] total count", {
      totalCount,
      countError: countError || null,
    });

    if (countError) {
      console.error("❌ Count query error:", countError);
      throw countError;
    }

    // For each event, get its bookings
    const processedEvents: EventSummary[] = [];

    for (const event of events) {
      console.log(`🎫 Processing event: ${event.title} (${event.id})`);

      // Get bookings for this specific event
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, seats_requested, amount_paid, status")
        .eq("event_id", event.id)
        .neq("status", "cancelled");

      console.log(
        `[Attendees|getOrganizerEventsWithAttendees] bookings for event ${event.id}`,
        {
          bookingsCount: bookings?.length ?? 0,
          bookingsError: bookingsError || null,
        }
      );

      if (bookingsError) {
        console.error(
          `❌ Bookings query error for event ${event.id}:`,
          bookingsError
        );
        continue;
      }

      const activeBookings = bookings || [];
      const current_bookings = activeBookings.reduce(
        (sum, booking) => sum + (booking.seats_requested || 0),
        0
      );
      let total_revenue = activeBookings.reduce(
        (sum, booking) => sum + (booking.amount_paid || 0),
        0
      );

      // Fallback: if revenue is zero but we have bookings, attempt to derive from payments table
      if (total_revenue === 0 && activeBookings.length > 0) {
        console.log(
          "[Attendees|getOrganizerEventsWithAttendees] revenue fallback check",
          { eventId: event.id }
        );
        const bookingIds = activeBookings.map((b) => b.id).filter(Boolean);
        if (bookingIds.length) {
          const { data: paymentRows, error: paymentError } = await supabase
            .from("payments")
            .select("booking_id, amount, status")
            .in("booking_id", bookingIds)
            .eq("status", "succeeded");
          if (paymentError) {
            console.log(
              "[Attendees|getOrganizerEventsWithAttendees] payments fallback error",
              paymentError.message
            );
          } else {
            const paymentsTotal = (paymentRows || []).reduce(
              (s, p: any) => s + (p.amount || 0),
              0
            );
            // Assume payments.amount stored in same currency minor/major? If minor (e.g. cents) adjust here if needed.
            // TODO: Adjust scaling if you store cents. For now we assume major units.
            if (paymentsTotal > 0) {
              total_revenue = paymentsTotal;
              console.log(
                "[Attendees|getOrganizerEventsWithAttendees] revenue fallback applied",
                { eventId: event.id, paymentsTotal }
              );
            } else {
              console.log(
                "[Attendees|getOrganizerEventsWithAttendees] payments fallback found no positive totals",
                { eventId: event.id }
              );
            }
          }
        }
      }

      // Get event image if available
      const { data: eventImage } = await supabase
        .from("event_images")
        .select("image_url")
        .eq("event_id", event.id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .single();

      processedEvents.push({
        id: event.id,
        title: event.title,
        date: event.start_time,
        location: "", // You might want to add location to events table
        category: event.category,
        max_capacity: event.total_seats,
        current_bookings,
        total_revenue,
        image_url: eventImage?.image_url,
        attendees_count: activeBookings.length,
      });
    }

    console.log("[Attendees|getOrganizerEventsWithAttendees] DONE", {
      processedEventsCount: processedEvents.length,
    });

    return {
      events: processedEvents,
      totalCount: totalCount || 0,
      hasMore: page * limit < (totalCount || 0),
    };
  } catch (error) {
    console.error("[Attendees|getOrganizerEventsWithAttendees] ERROR", error);
    throw error;
  }
};

// Alternative helper function that automatically gets organizer ID
export const getOrganizerEventsWithAttendeesAuto = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  events: EventSummary[];
  totalCount: number;
  hasMore: boolean;
}> => {
  try {
    console.log(
      "[Attendees|getOrganizerEventsWithAttendeesAuto] START - Auto-detecting organizer"
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("❌ User not authenticated:", userError);
      throw new Error("User not authenticated");
    }

    // Use the main function with the auth user ID
    return await getOrganizerEventsWithAttendees(user.id, page, limit);
  } catch (error) {
    console.error(
      "[Attendees|getOrganizerEventsWithAttendeesAuto] ERROR",
      error
    );
    throw error;
  }
};

export const getEventAttendees = async (
  eventId: string
): Promise<EventWithAttendees | null> => {
  try {
    console.log("[Attendees|getEventAttendees] START", {
      eventId,
      ts: Date.now(),
    });

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        start_time,
        category,
        total_seats
      `
      )
      .eq("id", eventId)
      .single();

    console.log("[Attendees|getEventAttendees] event query", {
      found: !!event,
      eventError: eventError || null,
    });

    if (eventError) {
      console.error("❌ Event query error:", eventError);
      throw eventError;
    }

    if (!event) {
      console.log("📭 No event found");
      return null;
    }

    // Get attendees with user details
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        traveler_id,
        event_id,
        created_at,
        seats_requested,
        status,
        amount_paid
      `
      )
      .eq("event_id", eventId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    console.log("[Attendees|getEventAttendees] bookings query", {
      bookingsCount: bookings?.length ?? 0,
      bookingsError: bookingsError || null,
    });

    if (bookingsError) {
      console.error("❌ Bookings query error:", bookingsError);
      throw bookingsError;
    }

    if (!bookings || bookings.length === 0) {
      console.log("[Attendees|getEventAttendees] no active bookings");
      return {
        id: event.id,
        title: event.title,
        date: event.start_time,
        location: "",
        category: event.category,
        max_capacity: event.total_seats,
        image_url: undefined,
        current_bookings: 0,
        total_revenue: 0,
        attendees_count: 0,
        attendees: [],
      };
    }

    // Get user details for each booking
    const attendees: EventAttendee[] = [];

    for (const booking of bookings) {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          phone,
          profile_image_url,
          user_id
        `
        )
        .eq("id", booking.traveler_id)
        .single();

      if (userError || !userProfile) {
        console.error("❌ User profile error:", userError);
        continue;
      }

      // Get user auth details for email
      let userEmail = "No email";
      if (userProfile.user_id) {
        try {
          // Note: admin.getUserById requires service role key
          // For client-side, you might need to use a different approach
          const { data: authUser, error: authError } =
            await supabase.auth.admin.getUserById(userProfile.user_id);
          if (authUser && authUser.user) {
            userEmail = authUser.user.email || "No email";
          }
        } catch (error) {
          console.log("Cannot fetch auth user from client, using fallback");
          userEmail = "Email not available";
        }
      }

      const attendee: EventAttendee = {
        id: booking.id,
        user_id: booking.traveler_id,
        event_id: booking.event_id,
        booking_date: booking.created_at,
        seats_booked: booking.seats_requested || 0,
        status: booking.status as BookingStatus,
        total_amount: booking.amount_paid || 0,
        user: {
          id: userProfile.id,
          full_name: userProfile.full_name || "Anonymous",
          email: userEmail,
          avatar_url: userProfile.profile_image_url,
          phone: userProfile.phone,
        },
      };

      attendees.push(attendee);
    }

    const current_bookings = attendees.reduce(
      (sum, attendee) => sum + attendee.seats_booked,
      0
    );
    let total_revenue = attendees.reduce(
      (sum, attendee) => sum + attendee.total_amount,
      0
    );

    if (total_revenue === 0 && attendees.length > 0) {
      console.log("[Attendees|getEventAttendees] revenue fallback check", {
        eventId,
      });
      const bookingIds = attendees.map((a) => a.id);
      if (bookingIds.length) {
        const { data: paymentRows, error: paymentError } = await supabase
          .from("payments")
          .select("booking_id, amount, status")
          .in("booking_id", bookingIds)
          .eq("status", "succeeded");
        if (paymentError) {
          console.log(
            "[Attendees|getEventAttendees] payments fallback error",
            paymentError.message
          );
        } else {
          const paymentsTotal = (paymentRows || []).reduce(
            (s, p: any) => s + (p.amount || 0),
            0
          );
          if (paymentsTotal > 0) {
            total_revenue = paymentsTotal;
            console.log(
              "[Attendees|getEventAttendees] revenue fallback applied",
              { eventId, paymentsTotal }
            );
          } else {
            console.log(
              "[Attendees|getEventAttendees] payments fallback found no positive totals",
              { eventId }
            );
          }
        }
      }
    }

    return {
      id: event.id,
      title: event.title,
      date: event.start_time,
      location: "",
      category: event.category,
      max_capacity: event.total_seats,
      image_url: undefined,
      current_bookings,
      total_revenue,
      attendees_count: attendees.length,
      attendees,
    };
  } catch (error) {
    console.error("[Attendees|getEventAttendees] ERROR", error);
    throw error;
  }
};

export const exportAttendeesToCSV = (
  attendees: EventAttendee[],
  eventTitle: string
): string => {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Seats Booked",
    "Booking Date",
    "Amount Paid",
    "Status",
  ];

  const csvContent = [
    headers.join(","),
    ...attendees.map((attendee) =>
      [
        `"${attendee.user.full_name}"`,
        `"${attendee.user.email}"`,
        `"${attendee.user.phone || "N/A"}"`,
        attendee.seats_booked.toString(),
        `"${new Date(attendee.booking_date).toLocaleDateString()}"`,
        `"$${attendee.total_amount.toFixed(2)}"`,
        `"${attendee.status}"`,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
};
