// components/ImageSelectionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageSelectionGridProps {
  selectedImages: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
}

const { width } = Dimensions.get("window");
const imageSize = (width - 48 - 32) / 3; // 3 images per row with margins

export const ImageSelectionGrid: React.FC<ImageSelectionGridProps> = ({
  selectedImages,
  onAddImage,
  onRemoveImage,
  maxImages = 5,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Event Images</Text>
        <Text style={styles.subtitle}>
          {selectedImages.length}/{maxImages} images selected
        </Text>
      </View>

      <View style={styles.imageGrid}>
        {/* Existing images */}
        {selectedImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add image button */}
        {selectedImages.length < maxImages && (
          <TouchableOpacity style={styles.addButton} onPress={onAddImage}>
            <Ionicons name="add" size={32} color="#666" />
            <Text style={styles.addText}>Add Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedImages.length >= maxImages && (
        <Text style={styles.limitText}>
          Maximum {maxImages} images allowed per event
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  addText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  limitText: {
    fontSize: 12,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 8,
  },
});
