// app/(onboard)/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

const { width } = Dimensions.get("window");
const ONBOARDING_KEY = "onboarding_completed";

interface OnboardingSlide {
  key: string;
  text: string;
  title: string;
  image: any;
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    key: "one",
    title: "Welcome to Eventiq",
    text: "Your go-to app for event-based travel manager",
    image: require("../../assets/images/ob_1.png"),
    backgroundColor: "#a8e6cf",
  },
  {
    key: "two",
    title: "Create or Join Groups",
    text: "As a user or group owner, plan events easily",
    image: require("../../assets/images/ob_2.png"),
    backgroundColor: "#dcedc1",
  },
  {
    key: "three",
    title: "Stay Connected",
    text: "See updates, posts, and more from your group",
    image: require("../../assets/images/ob_3.png"),
    backgroundColor: "#ffd3b6",
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = React.useRef<PagerView>(null);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const goToNext = () => {
    if (currentPage < slides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View
      key={slide.key}
      style={[styles.slide, { backgroundColor: slide.backgroundColor }]}
    >
      <View style={styles.content}>
        {/* Render the image from the slide object */}
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide) => renderSlide(slide, 0))}
      </PagerView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => pagerRef.current?.setPage(index)}
            >
              <View
                style={[
                  styles.paginationDot,
                  index === currentPage && styles.paginationDotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={goToNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>
            {currentPage === slides.length - 1 ? "Let's Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "flex-end",
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1, // Ensure the header is on top of the PagerView
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#007AFF",
    width: 20,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
