import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../lib/auth";
import { registerStyles as styles } from "./styles/register"; // Correct import path for styles

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "traveler" as "organizer" | "traveler",
    countryCode: "BD" as CountryCode, // Cast BD as CountryCode
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const [passwordFocused, setPasswordFocused] = useState(false);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Fixed back button handler
  const handleBack = () => {
    router.replace("/(auth)/login"); // Use replace instead of back() and specify exact path
  };

  // Fixed login navigation handler
  const handleNavigateToLogin = () => {
    router.replace("/(auth)/login"); // Use replace for consistent navigation
  };

  const handleRegister = async () => {
    setErrors({
      email: "",
      password: "",
      phone: "",
    });

    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Please enter a valid email address",
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Passwords do not match",
      }));
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password:
          "Password must be at least 8 characters long and include at least one letter",
      }));
      return;
    }

    if (
      formData.phone &&
      !isValidPhoneNumber(formData.phone, formData.countryCode as CountryCode)
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: "Invalid phone number",
      }));
      return;
    }

    setLoading(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      });

      Alert.alert(
        "Success",
        "Account created successfully! Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong"
      );
    } finally {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setLoading(false);
    }
  };

  const handlePasswordFocus = () => {
    if (!passwordFocused) {
      Alert.alert(
        "Password Requirement",
        "Password must be at least 8 characters long and include at least one letter."
      );
      setPasswordFocused(true);
    }
  };

  const getCountryFlag = (countryCode: string) => {
    switch (countryCode) {
      case "US":
        return "🇺🇸";
      case "IN":
        return "🇮🇳";
      case "BD":
        return "🇧🇩";
      case "SA":
        return "🇸🇦";
      default:
        return "🇧🇩";
    }
  };

  const getCountryDialCode = (countryCode: string) => {
    switch (countryCode) {
      case "US":
        return "+1";
      case "IN":
        return "+91";
      case "BD":
        return "+880";
      case "SA":
        return "+966";
      default:
        return "+880";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[
            "#32DC96",
            "#20B576",
            "#1DA87A",
            "#28E5A3",
            "#40E8A8",
            "#52EBAD",
          ]}
          locations={[0, 0.18, 0.36, 0.55, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      </View>

      <View style={styles.particlesContainer} pointerEvents="none">
        {[...Array(18)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
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
          contentContainerStyle={{ paddingBottom: 20 }} // Added padding for footer
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header with Logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/eventiq-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join our community and start your journey
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <View style={styles.form}>
                {/* Full Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="user" size={16} color="#32DC96" /> Full Name
                    *
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={formData.fullName}
                      onChangeText={(text) =>
                        setFormData({ ...formData, fullName: text })
                      }
                      placeholder="Enter your full name"
                      autoCapitalize="words"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="mail" size={16} color="#32DC96" /> Email *
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.email ? styles.inputError : {},
                      ]}
                      value={formData.email}
                      onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                      }
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="phone" size={16} color="#32DC96" /> Phone
                    (Optional)
                  </Text>
                  <View style={styles.phoneContainer}>
                    <View style={styles.countrySelector}>
                      <Text style={styles.countryFlag}>
                        {getCountryFlag(formData.countryCode)}
                      </Text>
                      <Text style={styles.countryCode}>
                        {getCountryDialCode(formData.countryCode)}
                      </Text>
                      <Feather name="chevron-down" size={16} color="#32DC96" />
                      <Picker
                        selectedValue={formData.countryCode}
                        style={styles.hiddenPicker}
                        onValueChange={(itemValue) =>
                          setFormData({
                            ...formData,
                            countryCode: itemValue as CountryCode,
                          })
                        }
                      >
                        <Picker.Item label="🇧🇩 +880" value="BD" />
                        <Picker.Item label="🇺🇸 +1" value="US" />
                        <Picker.Item label="🇮🇳 +91" value="IN" />
                        <Picker.Item label="🇸🇦 +966" value="SA" />
                      </Picker>
                    </View>
                    <View style={styles.phoneInputContainer}>
                      <TextInput
                        style={[
                          styles.phoneInput,
                          errors.phone ? styles.inputError : {},
                        ]}
                        value={formData.phone}
                        onChangeText={(text) =>
                          setFormData({ ...formData, phone: text })
                        }
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor="#A0A0A0"
                      />
                    </View>
                  </View>
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                {/* Role Selection (Traveler or Organizer) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="briefcase" size={16} color="#32DC96" /> I am
                    a:
                  </Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        formData.role === "traveler" && styles.roleButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, role: "traveler" })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.role === "traveler"
                            ? ["#32DC96", "#20B576"]
                            : ["#F7FAFC", "#F7FAFC"]
                        }
                        style={styles.roleButtonGradient}
                      >
                        <Feather
                          name="map-pin"
                          size={20}
                          color={
                            formData.role === "traveler" ? "#FFFFFF" : "#32DC96"
                          }
                        />
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === "traveler" &&
                              styles.roleButtonTextActive,
                          ]}
                        >
                          Traveler
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        formData.role === "organizer" &&
                          styles.roleButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, role: "organizer" })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.role === "organizer"
                            ? ["#32DC96", "#20B576"]
                            : ["#F7FAFC", "#F7FAFC"]
                        }
                        style={styles.roleButtonGradient}
                      >
                        <Feather
                          name="users"
                          size={20}
                          color={
                            formData.role === "organizer"
                              ? "#FFFFFF"
                              : "#32DC96"
                          }
                        />
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === "organizer" &&
                              styles.roleButtonTextActive,
                          ]}
                        >
                          Organizer
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="lock" size={16} color="#32DC96" /> Password *
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        errors.password ? styles.inputError : {},
                      ]}
                      value={formData.password}
                      onChangeText={(text) =>
                        setFormData({ ...formData, password: text })
                      }
                      onFocus={handlePasswordFocus}
                      placeholder="Create a password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#32DC96"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="lock" size={16} color="#32DC96" /> Confirm
                    Password *
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={formData.confirmPassword}
                      onChangeText={(text) =>
                        setFormData({ ...formData, confirmPassword: text })
                      }
                      placeholder="Confirm your password"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Feather
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#32DC96"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#32DC96", "#20B576"]}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Feather name="user-plus" size={20} color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>
                          Create Account
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer with Login Navigation */}
            <View style={styles.footer}>
              <View style={styles.loginNavContainer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={handleNavigateToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Loading Screen */}
      {loading && (
        <Animated.View style={[styles.splashScreen, { opacity: animation }]}>
          <LinearGradient
            colors={["rgba(50, 220, 150, 0.9)", "rgba(32, 181, 118, 0.9)"]}
            style={styles.splashGradient}
          >
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Creating your account...</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
