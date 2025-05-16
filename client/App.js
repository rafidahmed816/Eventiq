import React, { useEffect, useState } from "react";
import { View, ActivityIndicator,Button } from "react-native";
import OnboardingScreen from "./screens/onboarding/OnboardingScreen";
import {
  getOnboardingSeen,
  resetOnboarding,
} from "./screens/onboarding/OnboardingStorage";
import MainApp from "./MainApp";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await getOnboardingSeen();
      setShowOnboarding(!hasSeen);
    };
    checkOnboarding();
  }, []);

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return showOnboarding ? (
    <OnboardingScreen onDone={() => setShowOnboarding(false)} />
  ) : (
    <>
      <MainApp />
      {/*  TEMP BUTTON to Reset Onboarding */}
      <Button
        title="🔁 Reset Onboarding (Dev)"
        onPress={async () => {
          await resetOnboarding();
          setShowOnboarding(true);
        }}
      />
    </>
  );
}
