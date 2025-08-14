// components/CancelBookingButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BookingWithEvent } from "../lib/traveler/bookings";

interface CancelBookingButtonProps {
  booking: BookingWithEvent;
  onCancel: (bookingId: string) => void;
  disabled?: boolean;
}

export const CancelBookingButton: React.FC<CancelBookingButtonProps> = ({
  booking,
  onCancel,
  disabled = false,
}) => {
  const cancellationInfo = useMemo(() => {
    const now = new Date();
    const eventStart = new Date(booking.events.start_time);
    const hoursUntilEvent =
      (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const cancellationPolicy = booking.events.cancellation_policy || 0;

    const canCancel =
      booking.status !== "cancelled" &&
      eventStart > now && // Event hasn't started yet
      hoursUntilEvent > cancellationPolicy; // Within cancellation policy

    const isPastEvent = eventStart < now;
    const isWithinCancellationWindow =
      hoursUntilEvent <= cancellationPolicy && hoursUntilEvent > 0;

    let statusText = "";
    let statusColor = "#666";

    if (isPastEvent) {
      statusText = "Event has passed";
      statusColor = "#999";
    } else if (isWithinCancellationWindow) {
      statusText = `Cancellation period expired (${cancellationPolicy}h policy)`;
      statusColor = "#F44336";
    } else if (canCancel) {
      const timeLeft = Math.floor(hoursUntilEvent - cancellationPolicy);
      if (timeLeft > 24) {
        const daysLeft = Math.floor(timeLeft / 24);
        statusText = `Cancel up to ${daysLeft} day${
          daysLeft > 1 ? "s" : ""
        } before event`;
      } else {
        statusText = `Cancel up to ${timeLeft} hour${
          timeLeft > 1 ? "s" : ""
        } before event`;
      }
      statusColor = "#4CAF50";
    }

    return {
      canCancel,
      statusText,
      statusColor,
      hoursUntilEvent,
      cancellationPolicy,
    };
  }, [
    booking.events.start_time,
    booking.events.cancellation_policy,
    booking.status,
  ]);

  const handleCancel = () => {
    InteractionManager.runAfterInteractions(() => {
      Alert.alert(
        "Cancel Booking",
        `Are you sure you want to cancel your booking for "${booking.events.title}"?\n\nThis action cannot be undone.`,
        [
          {
            text: "Keep Booking",
            style: "cancel",
          },
          {
            text: "Cancel Booking",
            style: "destructive",
            onPress: () => onCancel(booking.id),
          },
        ]
      );
    });
  };

  // Don't show anything for cancelled bookings
  if (booking.status === "cancelled") {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Cancellation Policy Info */}
      {booking.events.cancellation_policy && (
        <View style={styles.policyContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={cancellationInfo.statusColor}
          />
          <Text
            style={[styles.policyText, { color: cancellationInfo.statusColor }]}
          >
            {cancellationInfo.statusText}
          </Text>
        </View>
      )}

      {/* Cancel Button */}
      <TouchableOpacity
        style={[
          styles.cancelButton,
          (!cancellationInfo.canCancel || disabled) &&
            styles.cancelButtonDisabled,
        ]}
        onPress={handleCancel}
        disabled={!cancellationInfo.canCancel || disabled}
      >
        {disabled ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Ionicons
            name="close-circle-outline"
            size={18}
            color={!cancellationInfo.canCancel || disabled ? "#999" : "#F44336"}
          />
        )}
        <Text
          style={[
            styles.cancelButtonText,
            (!cancellationInfo.canCancel || disabled) &&
              styles.cancelButtonTextDisabled,
          ]}
        >
          {disabled
            ? "Cancelling..."
            : !cancellationInfo.canCancel
            ? "Cannot Cancel"
            : "Cancel Booking"}
        </Text>
      </TouchableOpacity>

      {/* Additional Info for Refunds */}
      {booking.events.refund_rules && cancellationInfo.canCancel && (
        <Text style={styles.refundText}>{booking.events.refund_rules}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
  },
  policyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ddd",
  },
  policyText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  cancelButtonDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  cancelButtonTextDisabled: {
    color: "#999",
  },
  refundText: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 14,
  },
});
