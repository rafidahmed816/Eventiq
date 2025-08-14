// components/BookingCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BookingWithEvent } from "../lib/traveler/bookings";

interface BookingCardProps {
  booking: BookingWithEvent;
  onCancel?: (bookingId: string) => void;
  onPress?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "waitlist":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "reserved":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "waitlist":
        return "Waitlisted";
      case "cancelled":
        return "Cancelled";
      case "reserved":
        return "Reserved";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Past Event";
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

  const canCancel = () => {
    const now = new Date();
    const eventStart = new Date(booking.events.start_time);
    const hoursUntilEvent =
      (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      booking.status !== "cancelled" &&
      hoursUntilEvent > (booking.events.cancellation_policy || 0)
    );
  };

  const handleCancel = () => {
    if (!onCancel) return;

    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking for "${booking.events.title}"?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => onCancel(booking.id),
        },
      ]
    );
  };

  const renderImage = () => {
    const images = booking.events.event_images;
    if (!images || images.length === 0) {
      return (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: images[0].image_url }}
        style={styles.eventImage}
        resizeMode="cover"
      />
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Event Image */}
      {renderImage()}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title} numberOfLines={1}>
              {booking.events.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{booking.events.category}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(booking.status)}
            </Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(booking.events.start_time)} •{" "}
              {formatTime(booking.events.start_time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {booking.seats_requested} seat
              {booking.seats_requested > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              $
              {(
                booking.events.budget_per_person * booking.seats_requested
              ).toFixed(2)}{" "}
              total
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              by {booking.events.profiles?.full_name || "Anonymous"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {booking.status !== "cancelled" && (
          <View style={styles.actions}>
            {canCancel() && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Ionicons name="close-outline" size={16} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

import {
  moderateScaling,
  normalizeFont,
  scale,
  spacing,
} from "../utils/scaling";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: moderateScaling(12),
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3.84),
    elevation: 5,
  },
  card: {
    overflow: "hidden",
  },
  eventImage: {
    width: scale(100),
    height: scale(120),
  },
  imagePlaceholder: {
    width: scale(100),
    height: scale(120),
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: normalizeFont(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: moderateScaling(8),
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: normalizeFont(11),
    color: "#1976d2",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: moderateScaling(12),
  },
  statusText: {
    fontSize: normalizeFont(12),
    color: "white",
    fontWeight: "600",
  },
  details: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: normalizeFont(13),
    color: "#666",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: moderateScaling(8),
    backgroundColor: "#ffebee",
  },
  cancelButtonText: {
    fontSize: normalizeFont(13),
    color: "#F44336",
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewButtonText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
});
