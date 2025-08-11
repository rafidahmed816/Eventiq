// components/EventsList.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Event } from "../lib/organizer/events";

interface EventsListProps {
  events: Event[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDeleteEvent: (eventId: string, title: string) => void;
}

export function EventsList({
  events,
  loading,
  refreshing,
  onRefresh,
  onDeleteEvent,
}: EventsListProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Ended ${Math.abs(diffDays)} day${
        Math.abs(diffDays) === 1 ? "" : "s"
      } ago`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  const getStatusColor = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);

    if (endDate < now) {
      return "#999"; // Past event
    } else if (startDate <= now && endDate >= now) {
      return "#4CAF50"; // Ongoing
    } else if (event.spots_remaining === 0) {
      return "#FF9800"; // Full
    } else {
      return "#007AFF"; // Upcoming
    }
  };

  const getStatusText = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);

    if (endDate < now) {
      return "Completed";
    } else if (startDate <= now && endDate >= now) {
      return "Ongoing";
    } else if (event.spots_remaining === 0) {
      return "Fully Booked";
    } else {
      return "Open";
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const statusColor = getStatusColor(event);
    const statusText = getStatusText(event);

    return (
      <View style={styles.eventCard}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <View style={styles.eventContent}>
          {/* Header */}
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleContainer}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => router.push(`/organizer/events/${event.id}`)}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onDeleteEvent(event.id, event.title)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description || "No description provided"}
          </Text>

          {/* Event Details */}
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.eventDetailText}>
                {formatDate(event.start_time)}
              </Text>
            </View>

            <View style={styles.eventDetailRow}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={[styles.eventDetailText, styles.priceText]}>
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

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push(`/organizer/events/${event.id}`)}
            >
              <Ionicons name="eye-outline" size={16} color="#007AFF" />
              <Text style={styles.quickActionText}>View Details</Text>
            </TouchableOpacity>

            <View style={styles.quickActionButton}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={[styles.quickActionText, { color: "#666" }]}>
                {event.total_seats - event.spots_remaining} booked
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (events.length === 0) {
    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#e0e0e0" />
          <Text style={styles.emptyStateTitle}>No Events Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first event to start connecting with travelers
          </Text>
          <View style={styles.emptyStateHint}>
            <Ionicons name="bulb-outline" size={16} color="#999" />
            <Text style={styles.hintText}>
              Tip: Add detailed descriptions and images to attract more bookings
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Events Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.filter((e) => new Date(e.end_time) > new Date()).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.reduce(
              (sum, e) => sum + (e.total_seats - e.spots_remaining),
              0
            )}
          </Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyStateHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#999",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventContent: {
    padding: 20,
    paddingTop: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingRight: 80, // Space for status badge
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 26,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 8,
  },
  eventDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
    lineHeight: 22,
  },
  eventDetails: {
    gap: 10,
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  priceText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 20,
  },
});
