import { Stack } from "expo-router";
import React from "react";
import { CONSTANTS } from "@/src/constants/constants";
export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: CONSTANTS.PRIMARY_COLOR,
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
          title: "Events",
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
