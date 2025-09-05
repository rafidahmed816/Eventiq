// app/(app)/organizer/attendees/[eventId].tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar
} from "react-native";
import AttendeeListItem from "../../../../components/AttendeeListItem";
import { CONSTANTS } from "../../../../constants/constants";
import {
  EventWithAttendees,
  exportAttendeesToCSV,
  getEventAttendees,
} from "../../../../lib/organizer/attendees";

const EventAttendeesDetailScreen: React.FC = () => {
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState<EventWithAttendees | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventAttendees = async (isRefresh: boolean = false) => {
    if (!eventId || typeof eventId !== "string") return;

    try {
      console.log("[Attendees|Detail] fetchEventAttendees START", {
        eventId,
        isRefresh,
      });
      setError(null);
      if (!isRefresh) setLoading(true);

      const eventData = await getEventAttendees(eventId);
      console.log("[Attendees|Detail] fetchEventAttendees result", {
        hasEvent: !!eventData,
        attendees: eventData?.attendees.length,
      });
      setEvent(eventData);
    } catch (error) {
      console.error("Error fetching event attendees:", error);
      setError("Failed to load attendees. Please try again.");
    } finally {
      console.log("[Attendees|Detail] fetchEventAttendees FINALLY");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("[Attendees|Detail] useEffect eventId changed", { eventId });
    fetchEventAttendees();
  }, [eventId]);

  const handleRefresh = () => {
    console.log("[Attendees|Detail] handleRefresh");
    setRefreshing(true);
    fetchEventAttendees(true);
  };

  const handleExport = () => {
    if (!event || event.attendees.length === 0) {
      Alert.alert("No Data", "No attendees to export");
      return;
    }

    Alert.alert("Export Attendees", "Choose export format", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Share as Text",
        onPress: () => shareAttendees(),
      },
      {
        text: "CSV Format",
        onPress: () => shareCSV(),
      },
    ]);
  };

  const shareAttendees = async () => {
    if (!event) return;

    const attendeesList = event.attendees
      .map(
        (attendee, index) =>
          `${index + 1}. ${attendee.user.full_name} (${
            attendee.user.email
          }) - ${attendee.seats_booked} seats - $${attendee.total_amount}`
      )
      .join("\n");

    const shareText = `${event.title} - Attendees List\n\nTotal Attendees: ${event.attendees.length}\nTotal Revenue: $${event.total_revenue}\n\n${attendeesList}`;

    try {
      await Share.share({
        message: shareText,
        title: `${event.title} - Attendees`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const shareCSV = async () => {
    if (!event) return;

    try {
      const csvContent = exportAttendeesToCSV(event.attendees, event.title);
      await Share.share({
        message: csvContent,
        title: `${event.title} - Attendees CSV`,
      });
    } catch (error) {
      console.error("Error sharing CSV:", error);
    }
  };

  const renderAttendee = ({ item, index }: { item: any; index: number }) => (
    <AttendeeListItem attendee={item} index={index} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {event?.image_url && (
        <Image source={{ uri: event.image_url }} style={styles.eventImage} />
      )}
      <View style={styles.headerContent}>
        <Text style={styles.eventTitle}>{event?.title}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(event?.date || "").toLocaleDateString()}
          </Text>
        </View>
        {/* Location removed per request */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{event?.attendees_count ?? 0}</Text>
            <Text style={styles.statLabel}>Attendees</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              ${event?.total_revenue?.toFixed(2) ?? "0.00"}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Attendees Yet</Text>
      <Text style={styles.emptyMessage}>
        When someone books a spot, their details will appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CONSTANTS.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading attendees...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchEventAttendees()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Stack.Screen
        options={{
          headerTitle: "Event Attendees",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={CONSTANTS.PRIMARY_COLOR}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleExport}
              style={styles.exportButton}
            >
              <Feather name="share" size={22} color={CONSTANTS.PRIMARY_COLOR} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={event?.attendees || []}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendee}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[CONSTANTS.PRIMARY_COLOR]}
            tintColor={CONSTANTS.PRIMARY_COLOR}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  exportButton: {
    marginRight: 16,
  },
  header: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  eventImage: {
    width: "100%",
    height: 200,
  },
  headerContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: CONSTANTS.PRIMARY_COLOR,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});

export default EventAttendeesDetailScreen;
