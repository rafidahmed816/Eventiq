// app/(app)/organizer/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed imports based on the actual exported function names
import {
  BookingStats,
  BookingWithDetails,
  fetchOrganizerBookings,
  getOrganizerBookingStats,
} from "../../../lib/organizer/bookings";
import {
  createEvent,
  CreateEventData,
  Event,
  fetchOrganizerEvents,
} from "../../../lib/organizer/events";
import { getCurrentProfile, Profile } from "../../../lib/organizer/profile";

// Import components
import { CreateEventModal } from "../../../components/CreateEventModal";
import { QuickActions } from "../../../components/dashboard/QuickActions";
import { RecentBookings } from "../../../components/dashboard/RecentBookings";
import { RecentEvents } from "../../../components/dashboard/RecentEvents";
import { StatsOverview } from "../../../components/dashboard/StatsOverview";
import { UpcomingEvents } from "../../../components/dashboard/UpcomingEvents";

const OrganizerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total_bookings: 0,
    confirmed_bookings: 0,
    waitlist_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: 0,
    total_seats_booked: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        Alert.alert("Error", "Unable to load profile");
        return;
      }

      setProfile(currentProfile);

      // Load events, bookings, and stats in parallel
      const [eventsData, bookingsData, statsData] = await Promise.all([
        fetchOrganizerEvents(currentProfile.id),
        fetchOrganizerBookings(currentProfile.id),
        getOrganizerBookingStats(currentProfile.id),
      ]);

      setEvents(eventsData);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error("Dashboard load error:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Handle create event
  const handleCreateEvent = async (eventData: CreateEventData) => {
    if (!profile) return;

    setCreating(true);
    try {
      await createEvent(profile.id, eventData);
      Alert.alert("Success", "Event created successfully!");
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Create event error:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
      throw error; // Re-throw to let modal handle it
    } finally {
      setCreating(false);
    }
  };

  // Calculate derived stats
  const totalRevenue = bookings
    .filter((booking: BookingWithDetails) => booking.status === "confirmed")
    .reduce((sum: number, booking: BookingWithDetails) => {
      return sum + (booking.amount_paid || 0);
    }, 0);

  const upcomingEvents = events
    .filter((event: Event) => new Date(event.start_time) > new Date())
    .sort(
      (a: Event, b: Event) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )
    .slice(0, 3);

  const recentBookings = bookings
    .sort(
      (a: BookingWithDetails, b: BookingWithDetails) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const recentEvents = events
    .sort(
      (a: Event, b: Event) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>
              {profile?.full_name || "Organizer"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/organizer/profile")}
          >
            <Ionicons name="person-circle-outline" size={32} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <StatsOverview
          totalEvents={events.length}
          totalBookings={stats.total_bookings}
          totalRevenue={totalRevenue}
          confirmedBookings={stats.confirmed_bookings}
        />

        {/* Quick Actions */}
        <QuickActions
          onCreateEvent={() => setShowCreateModal(true)}
          onViewEvents={() => router.push("/organizer/events")}
          onViewBookings={() => router.push("/organizer/attendees")}
          onViewChats={() => router.push("/organizer/chat")}
        />

        {/* Upcoming Events */}
        <UpcomingEvents
          events={upcomingEvents}
          onViewAll={() => router.push("/organizer/events")}
          onEventPress={(event: Event) =>
            router.push(`/organizer/events/${event.id}`)
          }
        />

        {/* Recent Bookings */}
        <RecentBookings
          bookings={recentBookings}
          onViewAll={() => router.push("/organizer/attendees")}
        />

        {/* Recent Events */}
        <RecentEvents
          events={recentEvents}
          onViewAll={() => router.push("/organizer/events")}
          onEventPress={(event: Event) =>
            router.push(`/organizer/events/${event.id}`)
          }
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Event Modal */}
      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEvent={handleCreateEvent}
        creating={creating}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    padding: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default OrganizerDashboard;
