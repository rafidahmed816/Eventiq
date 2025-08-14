// app/(app)/organizer/events.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateEventModal } from "../../../../components/CreateEventModal";
import { EventsList } from "../../../../components/EventsList";
import { useAuth } from "../../../../context/AuthContext";
import {
  createEvent,
  CreateEventData,
  deleteEvent,
  Event,
  fetchOrganizerEvents,
} from "../../../../lib/organizer/events";

export default function EventsScreen() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const data = await fetchOrganizerEvents(profile.id);
      setEvents(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load events");
      console.error("Load events error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleCreateEvent = async (eventData: CreateEventData) => {
    if (!profile?.id) {
      throw new Error("No profile found");
    }

    try {
      setCreating(true);
      await createEvent(profile.id, eventData);
      await loadEvents();
      Alert.alert("Success", "Event created successfully!");
    } catch (error) {
      console.error("Create event error:", error);
      Alert.alert("Error", "Failed to create event");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              await loadEvents();
              Alert.alert("Success", "Event deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete event");
              console.error("Delete event error:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>
            Manage your travel experiences
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <EventsList
        events={events}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEvent={handleCreateEvent}
        creating={creating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? 25 : 0, // Add extra padding for Android status bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
