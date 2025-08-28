// app/(app)/traveler/bookings.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookingCard } from "../../../components/BookingCard";
import { ReviewModal } from "../../../components/ReviewModal";
import { useAuth } from "../../../context/AuthContext";
import {
  BookingWithEvent,
  cancelBooking,
  fetchUserBookings,
} from "../../../lib/traveler/bookings";

type BookingFilter = "all" | "upcoming" | "past" | "cancelled";

const FILTER_OPTIONS: { key: BookingFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsScreen() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithEvent[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] =
    useState<BookingWithEvent | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const loadBookings = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const data = await fetchUserBookings(profile.id);
      setBookings(data);
    } catch (error) {
      console.error("Load bookings error:", error);
      Alert.alert("Error", "Failed to load your bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBookings = () => {
    const now = new Date();

    let filtered = bookings;

    switch (activeFilter) {
      case "upcoming":
        filtered = bookings.filter(
          (booking) =>
            new Date(booking.events.start_time) > now &&
            booking.status !== "cancelled"
        );
        break;
      case "past":
        filtered = bookings.filter(
          (booking) =>
            new Date(booking.events.start_time) <= now &&
            booking.status !== "cancelled"
        );
        break;
      case "cancelled":
        filtered = bookings.filter((booking) => booking.status === "cancelled");
        break;
      default:
        filtered = bookings;
    }

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancelling(bookingId);
      await cancelBooking(bookingId);

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" as const }
            : booking
        )
      );

      Alert.alert("Success", "Your booking has been cancelled");
    } catch (error) {
      console.error("Cancel booking error:", error);
      Alert.alert("Error", "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const handleBookingPress = (booking: BookingWithEvent) => {
    router.push(`/(app)/traveler/events/${booking.events.id}`);
  };

  const handleReviewPress = (booking: BookingWithEvent) => {
    setSelectedBookingForReview(booking);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setSelectedBookingForReview(null);
    // Refresh bookings to update review status
    loadBookings();
  };

  const renderFilterTab = ({
    item,
  }: {
    item: { key: BookingFilter; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === item.key && styles.activeFilterTab,
      ]}
      onPress={() => setActiveFilter(item.key)}
    >
      <Text
        style={[
          styles.filterTabText,
          activeFilter === item.key && styles.activeFilterTabText,
        ]}
      >
        {item.label}
      </Text>
      {item.key !== "all" && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{getFilterCount(item.key)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getFilterCount = (filter: BookingFilter) => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return bookings.filter(
          (booking) =>
            new Date(booking.events.start_time) > now &&
            booking.status !== "cancelled"
        ).length;
      case "past":
        return bookings.filter(
          (booking) =>
            new Date(booking.events.start_time) <= now &&
            booking.status !== "cancelled"
        ).length;
      case "cancelled":
        return bookings.filter((booking) => booking.status === "cancelled")
          .length;
      default:
        return 0;
    }
  };

  const renderBookingCard = ({ item }: { item: BookingWithEvent }) => (
    <BookingCard
      booking={item}
      onPress={() => handleBookingPress(item)}
      onReviewPress={handleReviewPress}
      userId={profile?.id}
    />
  );

  const renderEmptyState = () => {
    const getEmptyStateContent = () => {
      switch (activeFilter) {
        case "upcoming":
          return {
            icon: "calendar-outline",
            title: "No upcoming bookings",
            subtitle: "Book your next adventure from the Feed tab",
          };
        case "past":
          return {
            icon: "time-outline",
            title: "No past events",
            subtitle: "Your completed events will appear here",
          };
        case "cancelled":
          return {
            icon: "close-circle-outline",
            title: "No cancelled bookings",
            subtitle: "Cancelled bookings will appear here",
          };
        default:
          return {
            icon: "bookmark-outline",
            title: "No bookings yet",
            subtitle: "Discover and book amazing events from the Feed tab",
          };
      }
    };

    const { icon, title, subtitle } = getEmptyStateContent();

    return (
      <View style={styles.emptyState}>
        <Ionicons name={icon as any} size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{subtitle}</Text>
        {activeFilter === "all" || activeFilter === "upcoming" ? (
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(app)/traveler/events")}
          >
            <Text style={styles.browseButtonText}>Browse Events</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          renderItem={renderFilterTab}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="center"
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Review Modal */}
      {selectedBookingForReview && profile && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBookingForReview(null);
          }}
          eventId={selectedBookingForReview.events.id}
          userId={profile.id}
          organizerName={
            selectedBookingForReview.events.profiles?.full_name ||
            "the organizer"
          }
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  filterWrapper: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginRight: 6,
    height: 32,
  },
  activeFilterTab: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterTabText: {
    color: "white",
  },
  filterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#007AFF",
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancellingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancellingModal: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancellingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
});
