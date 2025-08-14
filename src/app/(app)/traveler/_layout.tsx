import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Traveler Bottom Tabs Layout
export default function TravelerLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom + 10,
          height: 60 + insets.bottom,
        },
        // headerStyle: { backgroundColor: "#007AFF" },
        // headerTintColor: "#FFFFFF",
        // headerTitleStyle: { fontWeight: "bold" },
        // tabBarActiveTintColor: "#007AFF",
        // tabBarInactiveTintColor: "#666666",
        // tabBarStyle: {
        //   backgroundColor: "#FFFFFF",
        //   height: 60,
        //   paddingBottom: 5,
        // },
        // tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      {/* <Tabs.Screen
        name="feed"
        options={{
          // title: "Discover",
          tabBarLabel: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="events"
        options={{
          // title: "Events",
          // tabBarLabel: "Events",
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
  );
}
