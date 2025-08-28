// app/(app)/_layout.tsx
import { Redirect, Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (profile) {
        console.log("Current user role:", profile.role);
      }

      if (profile?.role === "organizer") {
        console.log("Redirecting to organizer layout");
        router.replace("/(app)/organizer/events");
      } else if (profile?.role === "traveler") {
        console.log("Redirecting to traveler layout");
        router.replace("/(app)/traveler/events");
      } else {
        console.log("No valid role found, redirecting to login");
        router.replace("/(auth)/login");
      }
    }
  }, [profile, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color="
#007AFF"
        />
      </View>
    );
  }

  if (!profile) {
    console.log("No profile found, redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile.role) {
    console.log("No role found, redirecting to register");
    return <Redirect href="/(auth)/register" />;
  }

  return <Slot />;
}
