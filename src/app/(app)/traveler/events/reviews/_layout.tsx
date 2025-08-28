import { Stack } from "expo-router";

export default function ReviewsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[organizerId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
