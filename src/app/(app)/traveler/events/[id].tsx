// app/(app)/traveler/events/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CancelBookingButton } from "../../../../components/CancelBookingButton";
import MessageButton from "../../../../components/MessageButton";
import { useAuth } from "../../../../context/AuthContext";
import {
  BookingWithEvent,
  cancelBooking,
  checkExistingBooking,
  createBooking,
} from "../../../../lib/traveler/bookings";
import {
  fetchEventDetails,
  TravelerEvent,
} from "../../../../lib/traveler/events";
const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 250;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<TravelerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [existingBooking, setExistingBooking] =
    useState<BookingWithEvent | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventDetails();
    }
  }, [id]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await fetchEventDetails(id as string);
      setEvent(eventData);

      // Check if user already has a booking for this event
      if (profile?.id) {
        const bookingData = await checkExistingBooking(
          eventData.id,
          profile.id
        );
        setExistingBooking(bookingData);
        setHasExistingBooking(!!bookingData);

        // Reset seat selector to 1 when loading event details
        setSeatsRequested(1);
      }
    } catch (error) {
      console.error("Load event details error:", error);
      Alert.alert("Error", "Failed to load event details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!event || !profile?.id) {
      Alert.alert("Error", "Unable to process booking");
      return;
    }

    if (hasExistingBooking) {
      Alert.alert(
        "Already Booked",
        "You have already booked this event. Check your bookings for details."
      );
      return;
    }

    if (event.spots_remaining < seatsRequested) {
      Alert.alert(
        "Not Enough Seats",
        `Only ${event.spots_remaining} seat${
          event.spots_remaining === 1 ? "" : "s"
        } remaining. Please select fewer seats.`
      );
      return;
    }

    const totalPrice = event.budget_per_person * seatsRequested;

    Alert.alert(
      "Confirm Booking",
      `Book ${seatsRequested} seat${
        seatsRequested > 1 ? "s" : ""
      } for $${totalPrice.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            try {
              setBooking(true);
              const newBooking = await createBooking({
                event_id: event.id,
                traveler_id: profile.id,
                seats_requested: seatsRequested,
              });

              // Update local event state to reflect the booking
              setEvent((prev) =>
                prev
                  ? {
                      ...prev,
                      spots_remaining: prev.spots_remaining - seatsRequested,
                    }
                  : null
              );

              // Create a BookingWithEvent object for the cancel button
              const bookingWithEvent: BookingWithEvent = {
                ...newBooking,
                events: {
                  ...event,
                  event_images: event.images || [],
                  profiles: event.organizer,
                },
              };

              setExistingBooking(bookingWithEvent);
              setHasExistingBooking(true);

              InteractionManager.runAfterInteractions(() => {
                Alert.alert("Success", "Your booking has been confirmed!", [
                  {
                    text: "View Bookings",
                    onPress: () => router.push("/(app)/traveler/bookings"),
                  },
                  {
                    text: "Stay Here",
                    style: "cancel",
                  },
                ]);
              });
            } catch (error) {
              console.error("Booking error:", error);
              InteractionManager.runAfterInteractions(() => {
                Alert.alert(
                  "Error",
                  "Failed to create booking. Please try again."
                );
              });
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!existingBooking) return;

    try {
      setCancelling(true);
      await cancelBooking(bookingId);

      // Update local state
      setExistingBooking(null);
      setHasExistingBooking(false);

      // Reset seat selector to 1
      setSeatsRequested(1);

      // Update event spots - restore the number of seats that were booked
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              spots_remaining:
                prev.spots_remaining + existingBooking.seats_requested,
            }
          : null
      );

      InteractionManager.runAfterInteractions(() => {
        Alert.alert("Success", "Your booking has been cancelled successfully!");
      });
    } catch (error) {
      console.error("Cancel booking error:", error);
      InteractionManager.runAfterInteractions(() => {
        Alert.alert("Error", "Failed to cancel booking. Please try again.");
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    setCurrentImageIndex(index);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getDuration = () => {
    if (!event) return "";
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) return `${diffMinutes}m`;
    if (diffMinutes === 0) return `${diffHours}h`;
    return `${diffHours}h ${diffMinutes}m`;
  };

  const renderImageGallery = () => {
    if (!event?.images || event.images.length === 0) {
      return (
        <View style={[styles.imagePlaceholder, { height: IMAGE_HEIGHT }]}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
          <Text style={styles.placeholderText}>No Images Available</Text>
        </View>
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
          {event.images.map((image) => (
            <Image
              key={image.id}
              source={{ uri: image.image_url }}
              style={[styles.image, { width }]}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Visual separator with info indicator */}
        <View style={styles.separator}>
          <View style={styles.separatorIndicator} />
        </View>

        {/* Event Details */}
        <View style={styles.content}>
          {/* Title and Category */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>

          {/* Organizer Info */}
          <View style={styles.organizerSection}>
            <View style={styles.organizerAvatar}>
              {event.organizer?.profile_image_url ? (
                <Image
                  source={{ uri: event.organizer.profile_image_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={24} color="#666" />
              )}
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>
                {event.organizer?.full_name || "Anonymous"}
              </Text>
              <Text style={styles.organizerLabel}>Event Organizer</Text>
            </View>
          </View>

          {/* Date & Time Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(event.start_time)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Time</Text>
                <Text style={styles.infoValue}>
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#007AFF" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Duration</Text>
                <Text style={styles.infoValue}>{getDuration()}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#007AFF" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Available Seats</Text>
                <Text style={styles.infoValue}>
                  {event.spots_remaining} of {event.total_seats} seats
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Event Spots */}
          {event.spots && event.spots.length > 0 && (
            <View style={styles.spotsSection}>
              <Text style={styles.sectionTitle}>Places We'll Visit</Text>
              {event.spots.map((spot: any, index: number) => (
                <View key={spot.id} style={styles.spotItem}>
                  <View style={styles.spotNumber}>
                    <Text style={styles.spotNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.spotInfo}>
                    <Text style={styles.spotName}>{spot.spot_name}</Text>
                    {spot.description && (
                      <Text style={styles.spotDescription}>
                        {spot.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price per person</Text>
              <Text style={styles.price}>${event.budget_per_person}</Text>
            </View>
          </View>

          {/* Cancellation Policy */}
          {event.cancellation_policy && (
            <View style={styles.policySection}>
              <Text style={styles.sectionTitle}>Cancellation Policy</Text>
              <Text style={styles.policyText}>
                Free cancellation up to {event.cancellation_policy} hours before
                the event
              </Text>
              {event.refund_rules && (
                <Text style={styles.refundText}>{event.refund_rules}</Text>
              )}
            </View>
          )}

          {/* Message Organizer Button */}
          {event.organizer && profile && (
            <View style={styles.messageSection}>
              <View style={styles.messageSectionHeader}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.messageSectionTitle}>Have Questions?</Text>
              </View>
              <MessageButton
                eventId={event.id}
                organizerId={event.organizer_id}
                currentUser={profile}
                style={styles.customMessageButton}
              />
            </View>
          )}

          {/* Bottom spacing for scroll content */}
          <View style={styles.scrollBottomSpacing} />
        </View>
      </ScrollView>

      {/* Booking Section */}
      <View style={styles.bookingSection}>
        {hasExistingBooking && existingBooking ? (
          // Show booking status and cancel button if user has a booking
          <View style={styles.bookedContainer}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookedText}>You're booked!</Text>
              <Text style={styles.priceSubtext}>
                {existingBooking.seats_requested} seat
                {existingBooking.seats_requested > 1 ? "s" : ""} reserved
              </Text>
            </View>

            <CancelBookingButton
              booking={existingBooking}
              onCancel={handleCancelBooking}
              disabled={cancelling}
            />
          </View>
        ) : (
          // Show booking button if no booking exists
          <View style={styles.bookingRow}>
            <View style={styles.bookingInfo}>
              <Text style={styles.totalPrice}>
                ${(event.budget_per_person * seatsRequested).toFixed(2)}
              </Text>
              <Text style={styles.priceSubtext}>
                {seatsRequested} seat{seatsRequested > 1 ? "s" : ""}
              </Text>
            </View>

            {/* Seat Selector */}
            <View style={styles.seatSelector}>
              <TouchableOpacity
                style={[
                  styles.seatButton,
                  seatsRequested <= 1 && styles.seatButtonDisabled,
                ]}
                onPress={() =>
                  setSeatsRequested(Math.max(1, seatsRequested - 1))
                }
                disabled={seatsRequested <= 1}
              >
                <Text style={styles.seatButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.seatCount}>{seatsRequested}</Text>

              <TouchableOpacity
                style={[
                  styles.seatButton,
                  seatsRequested >= event.spots_remaining &&
                    styles.seatButtonDisabled,
                ]}
                onPress={() =>
                  setSeatsRequested(
                    Math.min(event.spots_remaining, seatsRequested + 1)
                  )
                }
                disabled={seatsRequested >= event.spots_remaining}
              >
                <Text style={styles.seatButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.bookButton,
                (booking || event.spots_remaining === 0) &&
                  styles.bookButtonDisabled,
              ]}
              onPress={handleBooking}
              disabled={booking || event.spots_remaining === 0}
            >
              {booking ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.bookButtonText}>
                  {event.spots_remaining === 0 ? "Sold Out" : "Book Now"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
  },
  shareBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
    marginTop: 12,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
  organizerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  organizerLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  spotsSection: {
    marginBottom: 24,
  },
  spotItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  spotNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  spotNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  spotDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  policySection: {
    marginBottom: 24,
  },
  policyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  refundText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  bookingSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bookedContainer: {
    flex: 1,
    gap: 12,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  bookedText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
  },
  priceSubtext: {
    fontSize: 14,
    color: "#666",
  },
  seatSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
  },
  seatButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  seatButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  seatButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  seatCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    paddingHorizontal: 16,
  },
  bookButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#ff4444",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 24,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    alignItems: "center",
    justifyContent: "center",
  },
  separatorIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#d0d0d0",
    borderRadius: 2,
  },
  messageSection: {
    marginBottom: 24,
    backgroundColor: "#f8fafe",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  messageSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  messageSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  customMessageButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollBottomSpacing: {
    height: 200, // Provides space for the fixed booking section
  },
});
