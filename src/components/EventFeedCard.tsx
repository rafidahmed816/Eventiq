// components/EventFeedCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TravelerEvent } from "../lib/traveler/events";

import { scale, spacing } from "../utils/scaling";

const CARD_WIDTH = Dimensions.get("window").width - spacing.md * 2;
const IMAGE_HEIGHT = scale(180);

interface EventFeedCardProps {
  event: TravelerEvent;
  onPress: () => void;
}

export const EventFeedCard: React.FC<EventFeedCardProps> = ({
  event,
  onPress,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / CARD_WIDTH);
    setCurrentImageIndex(index);
  };

  const renderImageSection = () => {
    if (!event.images || event.images.length === 0) {
      return (
        <View style={[styles.imagePlaceholder, { height: IMAGE_HEIGHT }]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
          <Text style={styles.placeholderText}>No Images</Text>
        </View>
      );
    }

    if (event.images.length === 1) {
      return (
        <Image
          source={{ uri: event.images[0].image_url }}
          style={[styles.singleImage, { height: IMAGE_HEIGHT }]}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {event.images.map((image, index) => (
            <Image
              key={image.id}
              source={{ uri: image.image_url }}
              style={[styles.carouselImage, { width: CARD_WIDTH }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {event.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {event.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {renderImageSection()}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>${event.budget_per_person}</Text>
            <Text style={styles.priceLabel}>per person</Text>
          </View>
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(event.start_time)} • {formatTime(event.start_time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {event.spots_remaining} seats left
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              by {event.organizer?.full_name || "Anonymous"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  singleImage: {
    width: "100%",
  },
  carouselImage: {
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  placeholderText: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  activeIndicator: {
    backgroundColor: "white",
    borderColor: "rgba(0, 0, 0, 0.2)",
    transform: [{ scale: 1.3 }],
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});
