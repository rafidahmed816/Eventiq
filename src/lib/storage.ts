import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";
import { decode } from "base64-arraybuffer";


export interface UploadResult {
  url: string;
  path: string;
}


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

// Get storage usage for an event
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

// Cleanup storage when event is deleted
export const cleanupEventStorage = async (eventId: string): Promise<void> => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from("event-images")
      .list(`events/${eventId}`, {
        limit: 100,
      });

    if (listError) {
      console.error("List files error:", listError);
      return; // Don't throw, just log and return
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `events/${eventId}/${file.name}`);

      const { error: deleteError } = await supabase.storage
        .from("event-images")
        .remove(filePaths);

      if (deleteError) {
        console.error("Delete files error:", deleteError);
        // Don't throw error here as it's cleanup operation
      } else {
        console.log(
          `Cleaned up ${filePaths.length} files for event ${eventId}`
        );
      }
    }
  } catch (error) {
    console.error("Cleanup storage error:", error);
    // Don't throw error here as it's cleanup operation
  }
};
