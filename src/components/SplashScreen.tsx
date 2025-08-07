import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, Animated, Easing, ActivityIndicator } from "react-native";

interface SplashScreenProps {
  onComplete: () => void;
  isLoading?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isLoading = false }) => {
  const [fadeAnim] = useState<Animated.Value>(new Animated.Value(1));

  useEffect(() => {
    if (!isLoading) {
      // Start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }
  }, [isLoading, fadeAnim, onComplete]);

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <Image
        source={require('../assets/eventiq-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 220, 150, 1)',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;