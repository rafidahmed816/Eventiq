import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../lib/auth";
import { loginStyles as styles } from "./styles/login";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [animation] = useState(new Animated.Value(30));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logoRotation] = useState(new Animated.Value(0));
  const [formScale] = useState(new Animated.Value(0.95));
  const [buttonScale] = useState(new Animated.Value(1));
  const [gradientAnim] = useState(new Animated.Value(0));

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    // Enhanced entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(formScale, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        { iterations: -1 }
      ),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await authService.signIn({ email, password });
      router.replace("/(app)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  const getInputContainerStyle = (inputName: string) => [
    styles.inputContainer,
    focusedInput === inputName && styles.focusedInputContainer,
  ];

  const animatedGradientStyle = {
    transform: [
      {
        translateX: gradientAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 50],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.backgroundContainer, animatedGradientStyle]}
      >
        <LinearGradient
          colors={[
            "#32DC96",
            "#20B576",
            "#1DA87A",
            "#28E5A3",
            "#40E8A8",
            "#52EBAD",
          ]}
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      </Animated.View>

      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: animation }],
              },
            ]}
          >
            <View style={styles.header}>
                <Image
                  source={require("../../assets/images/eventiq-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your journey
              </Text>
            </View>

            {/* Enhanced Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  transform: [{ scale: formScale }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.9)"]}
                style={styles.form}
              >
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="mail" size={16} color="#32DC96" /> Email
                  </Text>
                  <View style={getInputContainerStyle("email")}>
                    <Feather
                      name="mail"
                      size={20}
                      color={focusedInput === "email" ? "#32DC96" : "#A0A0A0"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => handleInputFocus("email")}
                      onBlur={handleInputBlur}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="lock" size={16} color="#32DC96" /> Password
                  </Text>
                  <View style={getInputContainerStyle("password")}>
                    <Feather
                      name="lock"
                      size={20}
                      color={
                        focusedInput === "password" ? "#32DC96" : "#A0A0A0"
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => handleInputFocus("password")}
                      onBlur={handleInputBlur}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#32DC96"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Enhanced Login Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#32DC96", "#20B576"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={styles.loginButtonText}>
                            Signing In...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <Feather
                            name="arrow-right"
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Forgot Password */}
                
                {/* Sign Up Section - Moved inside form for better visibility */}
                <View style={styles.signupSection}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.signupContainer}>
                    <Text style={styles.footerText}>
                      Don't have an account?{" "}
                    </Text>
                    <Link href="/(auth)/register" asChild>
                      <TouchableOpacity activeOpacity={0.7}>
                        <LinearGradient
                          colors={["#32DC96", "#20B576"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.signupGradient}
                        >
                          <Text style={styles.signupLink}>Sign Up</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={["rgba(50, 220, 150, 0.95)", "rgba(32, 181, 118, 0.95)"]}
            style={styles.loadingGradient}
          >
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Signing you in...</Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}
