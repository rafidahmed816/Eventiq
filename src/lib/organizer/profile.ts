// lib/profile.ts
import { deleteProfileImage, uploadProfileImage } from "../storage";
import { supabase } from "../supabase";

export interface Profile {
  id: string;
  user_id: string;
  role: "organizer" | "traveler";
  full_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
  profile_image_path: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  profile_image_url?: string | null;
  profile_image_path?: string | null;
}

// Get current user's profile
export const getCurrentProfile = async (): Promise<Profile | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Get current profile error:", error);
    return null;
  }
};

// Get profile by ID (for viewing other users)
export const getProfileById = async (
  profileId: string
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      console.error("Error fetching profile by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Get profile by ID error:", error);
    return null;
  }
};

// Update profile information
export const updateProfile = async (
  profileId: string,
  updates: UpdateProfileData
): Promise<Profile | null> => {
  try {
    console.log("=== UPDATE PROFILE DEBUG START ===");
    console.log("🔍 Input parameters:");
    console.log("  - profileId:", profileId);
    console.log("  - updates:", JSON.stringify(updates, null, 2));

    // Check current user authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("🔍 Current user:", JSON.stringify(user, null, 2));
    if (userError) {
      console.error(
        "❌ User authentication error:",
        JSON.stringify(userError, null, 2)
      );
      // Continue anyway, as the session might still be valid
    }

    // Filter out undefined/null values from updates to avoid overwriting with null
    const cleanUpdates = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    console.log(
      "🔍 Clean updates after filtering:",
      JSON.stringify(cleanUpdates, null, 2)
    );

    const updateData = {
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    };

    console.log("🔍 Final update data:", JSON.stringify(updateData, null, 2));
    console.log("🔍 Update data keys:", Object.keys(updateData));
    console.log("🔍 Update data values:", Object.values(updateData));
    console.log("🔍 Executing database update...");

    // Try a more basic update approach - avoid triggering any functions
    const dbUpdate: any = {
      updated_at: updateData.updated_at,
    };

    // Add fields only if they exist in updateData
    if ("profile_image_url" in updateData) {
      dbUpdate.profile_image_url = updateData.profile_image_url;
    }
    if ("profile_image_path" in updateData) {
      dbUpdate.profile_image_path = updateData.profile_image_path;
    }
    if ("full_name" in updateData) {
      dbUpdate.full_name = updateData.full_name;
    }
    if ("phone" in updateData) {
      dbUpdate.phone = updateData.phone;
    }

    console.log(
      "🔍 Database update object:",
      JSON.stringify(dbUpdate, null, 2)
    );

    // Try updating fields one by one to avoid triggering bulk update triggers
    let finalData = null;

    for (const [key, value] of Object.entries(dbUpdate)) {
      try {
        console.log(`🔍 Updating field ${key} with value:`, value);
        const { data: fieldData, error: fieldError } = await supabase
          .from("profiles")
          .update({ [key]: value })
          .eq("id", profileId)
          .select()
          .single();

        if (fieldError) {
          console.error(`❌ Error updating field ${key}:`, fieldError);
          // If updating profile_image_path fails, skip it but continue
          if (key === "profile_image_path") {
            console.warn("⚠️ Skipping profile_image_path update due to error");
            continue;
          }
          throw fieldError;
        }

        finalData = fieldData;
        console.log(`✅ Successfully updated field ${key}`);
      } catch (err) {
        console.error(`❌ Failed to update field ${key}:`, err);
        // If updating profile_image_path fails, skip it but continue
        if (key === "profile_image_path") {
          console.warn("⚠️ Skipping profile_image_path update due to error");
          continue;
        }
        throw err;
      }
    }

    const data = finalData;
    const error = null;

    console.log("🔍 Database update response:");
    console.log("  - data:", JSON.stringify(data, null, 2));
    console.log("  - error:", error);

    if (error) {
      console.error("❌ Database update error details:");
      console.error("  - Full error object:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to update profile: ${error}`);
    }

    console.log("✅ Profile updated successfully!");
    console.log("=== UPDATE PROFILE DEBUG END ===");
    return data;
  } catch (error) {
    console.error("❌ UPDATE PROFILE ERROR:");
    console.error("  - Error type:", typeof error);
    console.error(
      "  - Error message:",
      (error as any)?.message || "Unknown error"
    );
    console.error("  - Error stack:", (error as any)?.stack);
    console.error("  - Full error object:", JSON.stringify(error, null, 2));
    console.log("=== UPDATE PROFILE DEBUG END (ERROR) ===");
    throw error;
  }
};

// Upload and set new profile image
export const updateProfileImage = async (
  profileId: string,
  imageUri: string
): Promise<Profile | null> => {
  try {
    console.log("=== UPDATE PROFILE IMAGE DEBUG START ===");
    console.log("🔍 Input parameters:");
    console.log("  - profileId:", profileId);
    console.log("  - imageUri:", imageUri);

    // Get current profile to get user_id and old image path
    console.log("🔍 Getting current profile...");
    const currentProfile = await getCurrentProfile();
    console.log("🔍 Current profile:", JSON.stringify(currentProfile, null, 2));

    if (!currentProfile || currentProfile.id !== profileId) {
      console.error("❌ Profile not found or unauthorized");
      console.error("  - currentProfile exists:", !!currentProfile);
      console.error("  - currentProfile.id:", currentProfile?.id);
      console.error("  - requested profileId:", profileId);
      throw new Error("Profile not found or unauthorized");
    }

    console.log("🔍 Profile validation passed, proceeding with upload...");

    // Delete old image from storage if exists
    if (currentProfile.profile_image_path) {
      try {
        console.log(
          "🔍 Deleting old profile image:",
          currentProfile.profile_image_path
        );
        await deleteProfileImage(currentProfile.profile_image_path);
        console.log("✅ Old profile image deleted successfully");
      } catch (deleteError) {
        console.warn("⚠️ Could not delete old profile image:", deleteError);
        // Continue with profile update even if storage deletion fails
      }
    }

    // Upload new image
    console.log("🔍 Calling uploadProfileImage...");
    const uploadResult = await uploadProfileImage(
      currentProfile.user_id,
      imageUri
    );
    console.log("🔍 Upload result:", JSON.stringify(uploadResult, null, 2));

    // Update profile with new image
    console.log("🔍 Updating profile with new image URLs...");
    console.log("🔍 Upload result URL:", uploadResult.url);
    console.log("🔍 Upload result path:", uploadResult.path);

    // First, try updating only the URL (skip path for now)
    console.log("🔍 Attempting to update profile with URL only...");
    const updatedProfile = await updateProfile(profileId, {
      profile_image_url: uploadResult.url,
    });

    console.log(
      "🔍 Profile updated with image URL:",
      JSON.stringify(updatedProfile, null, 2)
    );
    console.log("🔍 Updated profile:", JSON.stringify(updatedProfile, null, 2));

    console.log("✅ Profile image update completed successfully!");
    console.log("=== UPDATE PROFILE IMAGE DEBUG END ===");

    return updatedProfile;
  } catch (error) {
    console.error("❌ UPDATE PROFILE IMAGE ERROR:");
    console.error("  - Error type:", typeof error);
    console.error(
      "  - Error message:",
      (error as any)?.message || "Unknown error"
    );
    console.error("  - Error stack:", (error as any)?.stack);
    console.error("  - Full error object:", JSON.stringify(error, null, 2));
    console.log("=== UPDATE PROFILE IMAGE DEBUG END (ERROR) ===");
    throw error;
  }
};

// Remove profile image
export const removeProfileImage = async (
  profileId: string
): Promise<Profile | null> => {
  try {
    const currentProfile = await getCurrentProfile();
    if (!currentProfile || currentProfile.id !== profileId) {
      throw new Error("Profile not found or unauthorized");
    }

    // Delete image from storage if exists
    if (currentProfile.profile_image_path) {
      try {
        await deleteProfileImage(currentProfile.profile_image_path);
      } catch (deleteError) {
        console.warn("Could not delete old profile image:", deleteError);
        // Continue with profile update even if storage deletion fails
      }
    }

    // Update profile to remove image references
    const updatedProfile = await updateProfile(profileId, {
      profile_image_url: null,
      profile_image_path: null,
    });

    return updatedProfile;
  } catch (error) {
    console.error("Remove profile image error:", error);
    throw error;
  }
};

// Get profile statistics for organizers
export const getOrganizerStats = async (organizerId: string) => {
  try {
    // Get total events created
    const { count: totalEvents, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", organizerId);

    if (eventsError) throw eventsError;

    // Get total bookings across all events
    const { count: totalBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*, events!inner(*)", { count: "exact", head: true })
      .eq("events.organizer_id", organizerId)
      .in("status", ["reserved", "confirmed"]);

    if (bookingsError) throw bookingsError;

    // Get average rating from reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating, events!inner(organizer_id)")
      .eq("events.organizer_id", organizerId);

    if (reviewsError) throw reviewsError;

    const averageRating =
      reviewsData?.length > 0
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
          reviewsData.length
        : 0;

    return {
      totalEvents: totalEvents || 0,
      totalBookings: totalBookings || 0,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewsData?.length || 0,
    };
  } catch (error) {
    console.error("Get organizer stats error:", error);
    return {
      totalEvents: 0,
      totalBookings: 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }
};

// Get profile statistics for travelers
export const getTravelerStats = async (travelerId: string) => {
  try {
    // Get total bookings
    const { count: totalBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("traveler_id", travelerId)
      .in("status", ["reserved", "confirmed"]);

    if (bookingsError) throw bookingsError;

    // Get completed events (where end_time has passed)
    const { count: completedEvents, error: completedError } = await supabase
      .from("bookings")
      .select("*, events!inner(*)", { count: "exact", head: true })
      .eq("traveler_id", travelerId)
      .in("status", ["confirmed"])
      .lt("events.end_time", new Date().toISOString());

    if (completedError) throw completedError;

    // Get reviews written
    const { count: reviewsWritten, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("reviewer_id", travelerId);

    if (reviewsError) throw reviewsError;

    return {
      totalBookings: totalBookings || 0,
      completedEvents: completedEvents || 0,
      reviewsWritten: reviewsWritten || 0,
    };
  } catch (error) {
    console.error("Get traveler stats error:", error);
    return {
      totalBookings: 0,
      completedEvents: 0,
      reviewsWritten: 0,
    };
  }
};

// Check if profile is complete
export const isProfileComplete = (profile: Profile): boolean => {
  return !!(profile.full_name?.trim() && profile.phone?.trim());
};
