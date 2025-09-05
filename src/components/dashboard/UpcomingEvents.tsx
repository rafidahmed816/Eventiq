// components/dashboard/UpcomingEvents.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../../lib/organizer/events";
import { CONSTANTS } from "../../constants/constants";

interface UpcomingEventsProps {
  events: Event[];
  onViewAll: () => void;
  onEventPress: (event: Event) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  onViewAll,
  onEventPress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => onEventPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.eventCategory}>{item.category}</Text>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventInfo}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.eventInfoText}>
            {formatDate(item.start_time)}
          </Text>
        </View>

        <View style={styles.eventInfo}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.eventInfoText}>
            {item.spots_remaining} spots left
          </Text>
        </View>

        <View style={styles.eventInfo}>
          <Ionicons name="cash-outline" size={14} color="#666" />
          <Text style={styles.eventInfoText}>
            {formatCurrency(item.budget_per_person)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No upcoming events</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first event to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: "white",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: CONSTANTS.PRIMARY_COLOR,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  separator: {
    width: 12,
  },
  eventCard: {
    width: 280,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: CONSTANTS.PRIMARY_COLOR,
    backgroundColor: `${CONSTANTS.PRIMARY_COLOR}20`,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventDetails: {
    gap: 8,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventInfoText: {
    fontSize: 13,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
