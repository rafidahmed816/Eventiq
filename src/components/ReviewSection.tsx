import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StarRating } from "./StarRating";
import { createReview } from "../lib/reviews";
import { CONSTANTS } from "../constants/constants";

interface ReviewSectionProps {
  eventId: string;
  userId: string;
  organizerName: string;
  onReviewSubmitted?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  eventId,
  userId,
  organizerName,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating before submitting.");
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert("Review Required", "Please write at least 10 characters for your review.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createReview({
        event_id: eventId,
        reviewer_id: userId,
        rating,
        comment: comment.trim()
      });

      Alert.alert(
        "Review Submitted",
        "Thank you for your feedback! Your review has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setRating(0);
              setComment("");
              onReviewSubmitted?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        "Failed to submit your review. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star-outline" size={24} color={CONSTANTS.PRIMARY_COLOR} />
        <Text style={styles.title}>Rate & Review</Text>
      </View>
      
      <Text style={styles.subtitle}>
        How was your experience with {organizerName}?
      </Text>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Your Rating</Text>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size={32}
          editable={true}
          style={styles.starRating}
        />
        <Text style={styles.ratingText}>
          {rating === 0 ? "Tap to rate" : `${rating} out of 5 stars`}
        </Text>
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.commentLabel}>Your Review</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience with other travelers..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {comment.length}/500 characters
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (rating === 0 || comment.trim().length < 10 || isSubmitting) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitReview}
        disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafe",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  starRating: {
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "white",
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: CONSTANTS.PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});