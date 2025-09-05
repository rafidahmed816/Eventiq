// components/dashboard/QuickActions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONSTANTS } from "../../constants/constants";

interface QuickActionsProps {
  onCreateEvent: () => void;
  onViewEvents: () => void;
  onViewBookings: () => void;
  onViewChats: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateEvent,
  onViewEvents,
  onViewBookings,
  onViewChats,
}) => {
  const actions = [
    {
      id: "create",
      icon: "add-circle-outline",
      title: "Create Event",
      subtitle: "Add new event",
      color: CONSTANTS.PRIMARY_COLOR,
      onPress: onCreateEvent,
    },
    {
      id: "events",
      icon: "calendar-outline",
      title: "My Events",
      subtitle: "Manage events",
      color: "#28a745",
      onPress: onViewEvents,
    },
    {
      id: "bookings",
      icon: "people-outline",
      title: "Attendees",
      subtitle: "View bookings",
      color: "#fd7e14",
      onPress: onViewBookings,
    },
    {
      id: "chats",
      icon: "chatbubbles-outline",
      title: "Messages",
      subtitle: "Chat with travelers",
      color: "#6f42c1",
      onPress: onViewChats,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${action.color}20` },
              ]}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color={action.color}
              />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
