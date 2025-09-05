// components/AttendeeInfoCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { CONSTANTS } from "../constants/constants";
import { EventAttendee } from "../lib/organizer/attendees";

interface AttendeeInfoCardProps {
  attendee: EventAttendee;
  showContactActions?: boolean;
}

const AttendeeInfoCard: React.FC<AttendeeInfoCardProps> = ({
  attendee,
  showContactActions = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCall = () => {
    if (attendee.user.phone) {
      Linking.openURL(`tel:${attendee.user.phone}`);
    } else {
      Alert.alert(
        "No Phone Number",
        "This attendee has not provided a phone number."
      );
    }
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${attendee.user.email}`);
  };

  const handleMessage = () => {
    if (attendee.user.phone) {
      Linking.openURL(`sms:${attendee.user.phone}`);
    } else {
      Alert.alert(
        "No Phone Number",
        "This attendee has not provided a phone number."
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(attendee.user.full_name)}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{attendee.user.full_name}</Text>
          <Text style={styles.userEmail}>{attendee.user.email}</Text>
          {attendee.user.phone && (
            <Text style={styles.userPhone}>{attendee.user.phone}</Text>
          )}
        </View>

        {showContactActions && (
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={CONSTANTS.PRIMARY_COLOR} />
            </TouchableOpacity>
            {attendee.user.phone && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCall}
                >
                  <Ionicons
                    name="call"
                    size={20}
                    color={CONSTANTS.PRIMARY_COLOR}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleMessage}
                >
                  <Ionicons
                    name="chatbubble"
                    size={20}
                    color={CONSTANTS.PRIMARY_COLOR}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Booking Details Section */}
      <View style={styles.divider} />

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Booking Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.detailLabel}>Seats</Text>
            <Text style={styles.detailValue}>{attendee.seats_booked}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#666" />
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              ${attendee.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailLabel}>Booked</Text>
            <Text style={styles.detailValueSmall}>
              {formatDate(attendee.booking_date)}
            </Text>
          </View>
        </View>

        {/* Booking Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.bookingStatus,
              { backgroundColor: getStatusColor(attendee.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(attendee.status)}
              size={16}
              color={getStatusColor(attendee.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(attendee.status) },
              ]}
            >
              {attendee.status?.toUpperCase() || "UNKNOWN"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  contactActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CONSTANTS.PRIMARY_COLOR + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 16,
  },
  detailsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  detailItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
    gap: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  detailValueSmall: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  statusContainer: {
    alignItems: "center" as const,
    marginTop: 8,
  },
  bookingStatus: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
};

export default AttendeeInfoCard;
