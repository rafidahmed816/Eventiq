import { Stack } from "expo-router";
import React from "react";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerBackTitle: "Back",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Events",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Event Details",
        }}
      />
    </Stack>
  );
}
