// components/EventCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Event } from "../lib/organizer/events";

interface EventCardProps {
  event: Event;
  onDelete: (eventId: string, title: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(event.id, event.title)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.description || "No description provided"}
      </Text>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {formatDate(event.start_time)}
          </Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            ${event.budget_per_person.toFixed(2)} per person
          </Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {event.spots_remaining}/{event.total_seats} seats available
          </Text>
        </View>

        {event.cancellation_policy && (
          <View style={styles.eventDetailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.eventDetailText}>
              Cancel up to {event.cancellation_policy}h before
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

import {
  moderateScaling,
  normalizeFont,
  scale,
  spacing,
} from "../utils/scaling";

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "white",
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: moderateScaling(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  eventTitle: {
    fontSize: normalizeFont(18),
    fontWeight: "bold",
    color: "#333",
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: moderateScaling(12),
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: normalizeFont(12),
    color: "#1976D2",
    fontWeight: "500",
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: moderateScaling(8),
    backgroundColor: "#FFEBEE",
  },
  eventDescription: {
    fontSize: normalizeFont(14),
    color: "#666",
    marginBottom: spacing.md,
    lineHeight: scale(20),
  },
  eventDetails: {
    gap: spacing.sm,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  eventDetailText: {
    fontSize: normalizeFont(14),
    color: "#666",
    flex: 1,
  },
});
