// components/ImagePickerModal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  title?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = "Select Profile Image",
}) => {
  const requestPermissions = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return false;
    }

    // Request media library permissions
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required to select images."
      );
      return false;
    }

    return true;
  };

  const takePhoto = async () => {
    try {
      console.log("=== TAKE PHOTO DEBUG START ===");
      const hasPermissions = await requestPermissions();
      console.log("🔍 Camera permissions granted:", hasPermissions);

      if (!hasPermissions) {
        console.log("❌ Permissions not granted, aborting");
        return;
      }

      console.log("🔍 Launching camera...");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile images
        quality: 0.8,
        base64: false,
      });

      console.log("🔍 Camera result:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets[0]) {
        console.log("🔍 Photo taken successfully:");
        console.log("  - URI:", result.assets[0].uri);
        console.log("  - Width:", result.assets[0].width);
        console.log("  - Height:", result.assets[0].height);
        console.log("  - File size:", result.assets[0].fileSize);

        console.log("🔍 Calling onImageSelected...");
        onImageSelected(result.assets[0].uri);
        console.log("🔍 Closing modal...");
        onClose();
      } else {
        console.log("❌ Photo capture was canceled or failed");
      }
      console.log("=== TAKE PHOTO DEBUG END ===");
    } catch (error) {
      console.error("❌ TAKE PHOTO ERROR:");
      console.error("  - Error:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const selectFromLibrary = async () => {
    try {
      console.log("=== SELECT FROM LIBRARY DEBUG START ===");
      const hasPermissions = await requestPermissions();
      console.log("🔍 Library permissions granted:", hasPermissions);

      if (!hasPermissions) {
        console.log("❌ Permissions not granted, aborting");
        return;
      }

      console.log("🔍 Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile images
        quality: 0.8,
        base64: false,
      });

      console.log("🔍 Library result:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets[0]) {
        console.log("🔍 Image selected successfully:");
        console.log("  - URI:", result.assets[0].uri);
        console.log("  - Width:", result.assets[0].width);
        console.log("  - Height:", result.assets[0].height);
        console.log("  - File size:", result.assets[0].fileSize);

        console.log("🔍 Calling onImageSelected...");
        onImageSelected(result.assets[0].uri);
        console.log("🔍 Closing modal...");
        onClose();
      } else {
        console.log("❌ Image selection was canceled or failed");
      }
      console.log("=== SELECT FROM LIBRARY DEBUG END ===");
    } catch (error) {
      console.error("❌ SELECT FROM LIBRARY ERROR:");
      console.error("  - Error:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={takePhoto}
              style={[styles.option, styles.cameraOption]}
              activeOpacity={0.7}
            >
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>
                  Use camera to capture new photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={selectFromLibrary}
              style={[styles.option, styles.galleryOption]}
              activeOpacity={0.7}
            >
              <View style={styles.galleryIconContainer}>
                <Ionicons name="images" size={20} color="white" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose from Library</Text>
                <Text style={styles.optionSubtitle}>
                  Select from existing photos
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 320,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cameraOption: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  galleryOption: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  cameraIconContainer: {
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  galleryIconContainer: {
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  cancelText: {
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
    fontSize: 16,
  },
});
