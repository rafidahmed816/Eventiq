// components/EventAttendeesCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CONSTANTS } from "../constants/constants";
import { EventSummary } from "../lib/organizer/attendees";

interface EventAttendeesCardProps {
  event: EventSummary;
  // Pressing the whole card = go to attendees list (existing behaviour)
  onPress: () => void;
  // New: pressing the title navigates to event detail editor
  onPressTitle?: () => void;
}

const EventAttendeesCard: React.FC<EventAttendeesCardProps> = ({
  event,
  onPress,
  onPressTitle,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCapacityColor = () => {
    const percentage = (event.current_bookings / event.max_capacity) * 100;
    if (percentage >= 90) return "#FF6B6B";
    if (percentage >= 70) return "#FFB347";
    return CONSTANTS.PRIMARY_COLOR;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              marginRight: 16,
            }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: "#F0F0F0",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Ionicons name="calendar-outline" size={24} color="#999" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.6}
            disabled={!onPressTitle}
            onPress={onPressTitle}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: onPressTitle ? CONSTANTS.PRIMARY_COLOR : "#1A1A1A",
                marginBottom: 6,
                textDecorationLine: onPressTitle ? "underline" : "none",
              }}
              numberOfLines={2}
            >
              {event.title}
            </Text>
          </TouchableOpacity>
          {/* Location removed per request */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginLeft: 4,
              }}
            >
              {formatDate(event.date)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      {/* Stats Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: CONSTANTS.PRIMARY_COLOR,
            }}
          >
            {event.attendees_count}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 2,
            }}
          >
            Attendees
          </Text>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: "#E0E0E0",
            marginHorizontal: 16,
          }}
        />

        <View style={{ alignItems: "center", flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: getCapacityColor(),
            }}
          >
            {event.current_bookings}/{event.max_capacity}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 2,
            }}
          >
            Capacity
          </Text>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: "#E0E0E0",
            marginHorizontal: 16,
          }}
        />

        <View style={{ alignItems: "center", flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#2ECC71",
            }}
          >
            ${event.total_revenue}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 2,
            }}
          >
            Revenue
          </Text>
        </View>
      </View>

      {/* Category Badge */}
      <View
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: CONSTANTS.PRIMARY_COLOR,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: "white",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          {event.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default EventAttendeesCard;
