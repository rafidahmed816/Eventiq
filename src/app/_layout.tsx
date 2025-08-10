// app/_layout.tsx
if (__DEV__) {
  require("../../ReactotronConfig");
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";

const ONBOARDING_KEY = "onboarding_completed";

function RootLayoutContent() {
  const { session, user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Check onboarding status only once on mount
  useEffect(() => {
    let isMounted = true;

    async function checkOnboardingStatus() {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isMounted) {
          setOnboardingComplete(completed === "true");
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        if (isMounted) {
          setOnboardingComplete(false);
          setIsInitializing(false);
        }
      }
    }

    checkOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Only show loading when actually initializing
  if (loading && isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log("Current state:", {
    loading,
    onboardingComplete,
    hasSession: !!session,
    hasUser: !!user,
  });

  // If onboarding not completed, show onboarding flow
  if (!onboardingComplete) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboard)" />
      </Stack>
    );
  }

  // If not authenticated, show auth flow
  if (!session || !user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }

  // User is authenticated and onboarded, show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
