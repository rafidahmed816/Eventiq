// debug.ts - Database debugging utilities
import { supabase } from "./supabase";

export const testDatabaseConnection = async () => {
  console.log("=== DATABASE CONNECTION TEST ===");

  try {
    // Test basic connection
    console.log("🔍 Testing basic connection...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Current user:", JSON.stringify(user, null, 2));
    if (userError) {
      console.error("User error:", JSON.stringify(userError, null, 2));
    }

    // Test profiles table access
    console.log("🔍 Testing profiles table access...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    console.log("Profiles query result:");
    console.log("  - data:", JSON.stringify(profiles, null, 2));
    console.log("  - error:", JSON.stringify(profilesError, null, 2));

    // Test storage buckets
    console.log("🔍 Testing storage access...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    console.log("Storage buckets:");
    console.log("  - data:", JSON.stringify(buckets, null, 2));
    console.log("  - error:", JSON.stringify(bucketsError, null, 2));

    // Test profile-images bucket specifically
    if (buckets?.some((bucket) => bucket.name === "profile-images")) {
      console.log("🔍 Testing profile-images bucket access...");
      const { data: files, error: filesError } = await supabase.storage
        .from("profile-images")
        .list("", { limit: 1 });

      console.log("Profile-images bucket files:");
      console.log("  - data:", JSON.stringify(files, null, 2));
      console.log("  - error:", JSON.stringify(filesError, null, 2));
    }

    console.log("=== DATABASE CONNECTION TEST COMPLETE ===");
  } catch (error) {
    console.error("Database test error:", JSON.stringify(error, null, 2));
  }
};

export const testProfileUpdate = async (profileId: string) => {
  console.log("=== PROFILE UPDATE TEST ===");
  console.log("Testing profile ID:", profileId);

  try {
    // First, try to read the profile
    console.log("🔍 Testing profile read...");
    const { data: readData, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    console.log("Profile read result:");
    console.log("  - data:", JSON.stringify(readData, null, 2));
    console.log("  - error:", JSON.stringify(readError, null, 2));

    if (readError) {
      console.error("❌ Cannot read profile, stopping test");
      return;
    }

    // Try a simple update (just updated_at)
    console.log("🔍 Testing simple profile update...");
    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select()
      .single();

    console.log("Profile update result:");
    console.log("  - data:", JSON.stringify(updateData, null, 2));
    console.log("  - error:", JSON.stringify(updateError, null, 2));

    console.log("=== PROFILE UPDATE TEST COMPLETE ===");
  } catch (error) {
    console.error("Profile update test error:", JSON.stringify(error, null, 2));
  }
};
