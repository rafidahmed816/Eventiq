import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createReview } from "../lib/reviews";
import { StarRating } from "./StarRating";

const { height } = Dimensions.get("window");

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  userId: string;
  organizerName: string;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  eventId,
  userId,
  organizerName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a star rating before submitting."
      );
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert(
        "Review Required",
        "Please write at least 10 characters for your review."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createReview({
        event_id: eventId,
        reviewer_id: userId,
        rating,
        comment: comment.trim(),
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
              onClose();
            },
          },
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

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate & Review</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={32} color="#FFD700" />
            </View>
            <Text style={styles.title}>How was your experience?</Text>
            <Text style={styles.subtitle}>
              Rate your experience with {organizerName}
            </Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={40}
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
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {comment.length}/500 characters
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || comment.trim().length < 10 || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={
              rating === 0 || comment.trim().length < 10 || isSubmitting
            }
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  closeButton: {
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
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff8e1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  starRating: {
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  commentSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  commentLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#f8f9fa",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  characterCount: {
    fontSize: 14,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
