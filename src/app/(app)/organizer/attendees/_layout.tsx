// app/(app)/organizer/attendees/_layout.tsx
import { CONSTANTS } from "@/src/constants/constants";
import { Stack } from "expo-router";
import React from "react";

const AttendeesLayout: React.FC = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
          title: "Attendees",
        }}
      />
      <Stack.Screen
        name="[eventId]"
        options={{
          title: "Event Attendees",
          headerShown: true, // allow back button
          presentation: "card",
        }}
      />
      {/* Legacy route kept temporarily; can be removed once confirmed unused */}
      {/* <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
};

export default AttendeesLayout;
