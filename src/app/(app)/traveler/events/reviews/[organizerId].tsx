import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StarRating } from "../../../../../components/StarRating";
import { getOrganizerReviews, getOrganizerAverageRating, Review } from "../../../../../lib/reviews";
import { CONSTANTS } from "@/src/constants/constants";
export default function OrganizerReviewsScreen() {
  const { organizerId, organizerName } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<{ avgRating: number; totalReviews: number }>({
    avgRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizerId) {
      loadReviews();
    }
  }, [organizerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, ratingData] = await Promise.all([
        getOrganizerReviews(organizerId as string),
        getOrganizerAverageRating(organizerId as string)
      ]);
      
      setReviews(reviewsData);
      setAverageRating(ratingData);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            {item.reviewer?.profile_image_url ? (
              <Image
                source={{ uri: item.reviewer.profile_image_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={20} color="#666" />
            )}
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>
              {item.reviewer?.full_name || "Anonymous"}
            </Text>
            <Text style={styles.reviewDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <StarRating rating={item.rating} size={16} />
      </View>

      {item.events && (
        <View style={styles.eventInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.eventText}>
            {item.events.title} • {formatEventDate(item.events.start_time)}
          </Text>
        </View>
      )}

      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        This organizer hasn't received any reviews yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CONSTANTS.PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.organizerTitle}>
          {organizerName || "Organizer"} Reviews
        </Text>
        
        {averageRating.totalReviews > 0 ? (
          <View style={styles.ratingSummary}>
            <View style={styles.ratingOverview}>
              <Text style={styles.averageRating}>
                {averageRating.avgRating.toFixed(1)}
              </Text>
              <StarRating rating={Math.round(averageRating.avgRating)} size={24} />
            </View>
            <Text style={styles.totalReviews}>
              Based on {averageRating.totalReviews} review{averageRating.totalReviews !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.noRatingText}>No ratings yet</Text>
        )}
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reviewsList}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  summarySection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 8,
  },
  organizerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  ratingSummary: {
    alignItems: "center",
  },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "700",
    color: CONSTANTS.PRIMARY_COLOR,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
  },
  noRatingText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  reviewDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  eventText: {
    fontSize: 13,
    color: "#666",
  },
  reviewComment: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
});