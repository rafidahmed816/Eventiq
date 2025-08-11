// storage.ts
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

export interface UploadResult {
  url: string;
  path: string;
}

// Event image upload (existing function)
export const uploadEventImage = async (
  eventId: string,
  imageUri: string,
  fileName?: string
): Promise<UploadResult> => {
  try {
    console.log("Starting upload for:", imageUri);

    // Detect file extension
    const extMatch = imageUri.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";

    // Final file name
    const baseFileName = fileName
      ? fileName.replace(/\.[^/.]+$/, "")
      : `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const finalFileName = `${baseFileName}.${ext}`;
    const filePath = `events/${eventId}/${finalFileName}`;

    console.log("Upload path:", filePath);

    // MIME type
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "jpeg" || ext === "jpg") mimeType = "image/jpeg";
    else if (ext === "webp") mimeType = "image/webp";

    // Check file exists
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) throw new Error("File does not exist");

    // Read file as Base64
    console.log("Reading file as base64 for ArrayBuffer...");
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert to ArrayBuffer
    const arrayBuffer = decode(base64Data);
    console.log("ArrayBuffer size:", arrayBuffer.byteLength);

    // Upload directly using ArrayBuffer
    console.log("Uploading to Supabase Storage...");
    const { data, error } = await supabase.storage
      .from("event-images")
      .upload(filePath, arrayBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: mimeType,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    console.log("Upload successful:", data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Profile image upload (NEW FUNCTION)
export const uploadProfileImage = async (
  userId: string,
  imageUri: string,
  fileName?: string
): Promise<UploadResult> => {
  try {
    console.log("=== PROFILE IMAGE UPLOAD DEBUG START ===");
    console.log("🔍 Input parameters:");
    console.log("  - userId:", userId);
    console.log("  - imageUri:", imageUri);
    console.log("  - fileName:", fileName);

    // Detect file extension
    const extMatch = imageUri.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    console.log("🔍 Detected file extension:", ext);

    // Final file name
    const baseFileName = fileName
      ? fileName.replace(/\.[^/.]+$/, "")
      : `profile_${Date.now()}`;
    const finalFileName = `${baseFileName}.${ext}`;
    const filePath = `${userId}/${finalFileName}`;

    console.log("🔍 Generated file info:");
    console.log("  - baseFileName:", baseFileName);
    console.log("  - finalFileName:", finalFileName);
    console.log("  - filePath:", filePath);

    // MIME type
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "jpeg" || ext === "jpg") mimeType = "image/jpeg";
    else if (ext === "webp") mimeType = "image/webp";
    console.log("🔍 MIME type:", mimeType);

    // Check file exists
    console.log("🔍 Checking if file exists...");
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    console.log("🔍 File info:", JSON.stringify(fileInfo, null, 2));

    if (!fileInfo.exists) {
      console.error("❌ File does not exist at URI:", imageUri);
      throw new Error("File does not exist");
    }

    // Read file as Base64
    console.log("🔍 Reading file as base64...");
    const startTime = Date.now();
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const readTime = Date.now() - startTime;
    console.log(`🔍 File read completed in ${readTime}ms`);
    console.log("🔍 Base64 data length:", base64Data.length);
    console.log(
      "🔍 Base64 preview (first 100 chars):",
      base64Data.substring(0, 100)
    );

    // Convert to ArrayBuffer
    console.log("🔍 Converting to ArrayBuffer...");
    const arrayBuffer = decode(base64Data);
    console.log("🔍 ArrayBuffer size:", arrayBuffer.byteLength, "bytes");
    console.log(
      "🔍 ArrayBuffer size in MB:",
      (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)
    );

    // Check file size (5MB limit)
    if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
      console.error("❌ File too large:", arrayBuffer.byteLength, "bytes");
      throw new Error("Image too large. Please choose an image under 5MB.");
    }

    // Check Supabase connection
    console.log("🔍 Checking Supabase client...");
    console.log("🔍 Supabase storage available:", !!supabase.storage);

    // Upload to profile-images bucket
    console.log("🔍 Starting upload to Supabase Storage...");
    console.log("🔍 Upload parameters:");
    console.log("  - bucket: profile-images");
    console.log("  - path:", filePath);
    console.log("  - contentType:", mimeType);
    console.log("  - arrayBuffer size:", arrayBuffer.byteLength);

    const uploadStartTime = Date.now();
    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, arrayBuffer, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting for profile images
        contentType: mimeType,
      });
    const uploadTime = Date.now() - uploadStartTime;

    console.log(`🔍 Upload completed in ${uploadTime}ms`);

    if (error) {
      console.error("❌ Upload error details:");
      console.error("  - error message:", error.message);
      console.error("  - error object:", JSON.stringify(error, null, 2));
      throw new Error(`Profile upload failed: ${error.message}`);
    }

    console.log("✅ Upload successful!");
    console.log("🔍 Upload response data:", JSON.stringify(data, null, 2));

    // Get public URL
    console.log("🔍 Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    console.log("🔍 Public URL data:", JSON.stringify(publicUrlData, null, 2));

    const result = {
      url: publicUrlData.publicUrl,
      path: filePath,
    };

    console.log("✅ Final result:", JSON.stringify(result, null, 2));
    console.log("=== PROFILE IMAGE UPLOAD DEBUG END ===");

    return result;
  } catch (error) {
    console.error("❌ PROFILE UPLOAD ERROR:");
    console.error("  - Error type:", typeof error);
    console.error(
      "  - Error message:",
      (error as any)?.message || "Unknown error"
    );
    console.error("  - Error stack:", (error as any)?.stack);
    console.error("  - Full error object:", JSON.stringify(error, null, 2));
    console.log("=== PROFILE IMAGE UPLOAD DEBUG END (ERROR) ===");
    throw error;
  }
};

// Delete profile image
export const deleteProfileImage = async (imagePath: string): Promise<void> => {
  try {
    // Skip if no image path provided
    if (!imagePath || imagePath.trim() === "") {
      console.log("No image path provided, skipping delete");
      return;
    }

    console.log("Deleting profile image:", imagePath);

    const { error } = await supabase.storage
      .from("profile-images")
      .remove([imagePath]);

    if (error) {
      if (
        error.message.includes("delete_object") ||
        error.message.includes("No such object")
      ) {
        console.log("Image already deleted or doesn't exist, ignoring error");
        return;
      }
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log("Profile image deleted successfully");
  } catch (error) {
    console.error("Delete profile image error:", error);
    // Don't rethrow the error to prevent cascading failures
    // This allows the profile update to continue even if image deletion fails
  }
};

// Get storage usage for an event (existing)
export const getEventStorageUsage = async (
  eventId: string
): Promise<number> => {
  try {
    const { data: files, error } = await supabase.storage
      .from("event-images")
      .list(`events/${eventId}`, {
        limit: 100,
      });

    if (error) throw error;

    return (
      files?.reduce((total, file) => total + (file.metadata?.size || 0), 0) || 0
    );
  } catch (error) {
    console.error("Storage usage error:", error);
    return 0;
  }
};

// Get profile storage usage (NEW FUNCTION)
export const getProfileStorageUsage = async (
  userId: string
): Promise<number> => {
  try {
    const { data: files, error } = await supabase.storage
      .from("profile-images")
      .list(userId, {
        limit: 10, // Usually just one profile image
      });

    if (error) throw error;

    return (
      files?.reduce((total, file) => total + (file.metadata?.size || 0), 0) || 0
    );
  } catch (error) {
    console.error("Profile storage usage error:", error);
    return 0;
  }
};

// Cleanup storage when event is deleted (existing)
export const cleanupEventStorage = async (eventId: string): Promise<void> => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from("event-images")
      .list(`events/${eventId}`, {
        limit: 100,
      });

    if (listError) {
      console.error("List files error:", listError);
      return;
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `events/${eventId}/${file.name}`);

      const { error: deleteError } = await supabase.storage
        .from("event-images")
        .remove(filePaths);

      if (deleteError) {
        console.error("Delete files error:", deleteError);
      } else {
        console.log(
          `Cleaned up ${filePaths.length} files for event ${eventId}`
        );
      }
    }
  } catch (error) {
    console.error("Cleanup storage error:", error);
  }
};

// Cleanup profile storage when user is deleted (NEW FUNCTION)
export const cleanupProfileStorage = async (userId: string): Promise<void> => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from("profile-images")
      .list(userId, {
        limit: 10,
      });

    if (listError) {
      console.error("List profile files error:", listError);
      return;
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${userId}/${file.name}`);

      const { error: deleteError } = await supabase.storage
        .from("profile-images")
        .remove(filePaths);

      if (deleteError) {
        console.error("Delete profile files error:", deleteError);
      } else {
        console.log(
          `Cleaned up ${filePaths.length} profile files for user ${userId}`
        );
      }
    }
  } catch (error) {
    console.error("Cleanup profile storage error:", error);
  }
};
