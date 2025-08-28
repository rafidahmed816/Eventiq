import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import React from "react";
import { StatusBar } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CONSTANTS } from "@/src/constants/constants";
// Traveler Bottom Tabs Layout
export default function TravelerLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom + 10,
          height: 60 + insets.bottom,
          backgroundColor: "#FFFFFF",
        },
        tabBarActiveTintColor: CONSTANTS.PRIMARY_COLOR_DARKER, // Darker primary color for active icons
        tabBarInactiveTintColor: "#6B7280", // Default inactive color
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
        <Tabs.Screen
          name="events"
          options={{
            tabBarLabel: "Events",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "My Bookings",
            tabBarLabel: "Bookings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ticket" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Messages",
            tabBarLabel: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
