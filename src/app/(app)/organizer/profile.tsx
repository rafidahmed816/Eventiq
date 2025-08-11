// app/(app)/organizer/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImagePickerModal } from "../../../components/ImagePickerModal";
import { LogoutButton } from "../../../components/LogoutButton";
import { ProfileAvatar } from "../../../components/ProfileAvatar";
import { testDatabaseConnection, testProfileUpdate } from "../../../lib/debug";
import {
  getCurrentProfile,
  getOrganizerStats,
  Profile,
  removeProfileImage,
  updateProfileImage,
} from "../../../lib/organizer/profile";

export default function OrganizerProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getCurrentProfile();
      if (profileData) {
        setProfile(profileData);

        if (profileData.role === "organizer") {
          const statsData = await getOrganizerStats(profileData.id);
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error("Load profile error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = async (imageUri: string) => {
    console.log("=== HANDLE IMAGE SELECTED DEBUG START ===");
    console.log("🔍 Image selected:", imageUri);
    console.log("🔍 Current profile:", profile?.id);

    if (!profile) {
      console.error("❌ No profile available");
      return;
    }

    try {
      console.log("🔍 Setting uploading state to true...");
      setUploadingImage(true);

      console.log("🔍 Calling updateProfileImage...");
      const updatedProfile = await updateProfileImage(profile.id, imageUri);
      console.log(
        "🔍 Update profile image result:",
        JSON.stringify(updatedProfile, null, 2)
      );

      if (updatedProfile) {
        console.log("🔍 Setting updated profile state...");
        setProfile(updatedProfile);
        console.log("✅ Showing success alert...");
        Alert.alert("Success", "Profile image updated successfully");
      } else {
        console.error("❌ Updated profile is null");
      }
    } catch (error) {
      console.error("❌ HANDLE IMAGE SELECTED ERROR:");
      console.error("  - Error type:", typeof error);
      console.error(
        "  - Error message:",
        (error as any)?.message || "Unknown error"
      );
      console.error("  - Full error object:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to update profile image");
    } finally {
      console.log("🔍 Setting uploading state to false...");
      setUploadingImage(false);
      console.log("=== HANDLE IMAGE SELECTED DEBUG END ===");
    }
  };

  const handleRemoveImage = async () => {
    if (!profile?.profile_image_url) return;

    Alert.alert(
      "Remove Profile Image",
      "Are you sure you want to remove your profile image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setUploadingImage(true);
              const updatedProfile = await removeProfileImage(profile.id);
              if (updatedProfile) {
                setProfile(updatedProfile);
                Alert.alert("Success", "Profile image removed");
              }
            } catch (error) {
              console.error("Remove image error:", error);
              Alert.alert("Error", "Failed to remove profile image");
            } finally {
              setUploadingImage(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <ProfileAvatar
                imageUrl={profile.profile_image_url}
                fullName={profile.full_name}
                size="xlarge"
                onPress={() => setShowImagePicker(true)}
                showEditIcon={!uploadingImage}
                editable
              />
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="white" size="large" />
                </View>
              )}
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.full_name || "Organizer"}
            </Text>
            <View style={styles.roleContainer}>
              <Ionicons name="briefcase" size={16} color="#3B82F6" />
              <Text style={styles.roleText}>Event Organizer</Text>
            </View>
          </View>

          {/* Image Actions */}
          <View style={styles.imageActions}>
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              style={styles.changePhotoButton}
              disabled={uploadingImage}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.changePhotoText}>
                {profile.profile_image_url ? "Change Photo" : "Add Photo"}
              </Text>
            </TouchableOpacity>

            {profile.profile_image_url && (
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={styles.removePhotoButton}
                disabled={uploadingImage}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.eventsCard]}>
              <Ionicons name="calendar" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.totalEvents}</Text>
              <Text style={styles.statLabel}>Events Created</Text>
            </View>

            <View style={[styles.statCard, styles.bookingsCard]}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={[styles.statCard, styles.ratingCard]}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>
                {stats.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>

            <View style={[styles.statCard, styles.reviewsCard]}>
              <Ionicons name="chatbubble" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{stats.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Profile Details</Text>

          <View style={styles.detailItem}>
            <Ionicons name="person" size={20} color="#6B7280" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>
                {profile.full_name || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="call" size={20} color="#6B7280" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>
                {profile.phone || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={20} color="#6B7280" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <LogoutButton
            variant="menu-item"
            showIcon={true}
            onLogoutStart={() => console.log("Logout started")}
            onLogoutComplete={() => console.log("Logout completed")}
            onLogoutError={(error) => console.error("Logout error:", error)}
          />
        </View>

        {/* Debug Section */}
        <View style={styles.debugContainer}>
          <Text style={styles.sectionTitle}>Debug Tools</Text>

          <TouchableOpacity
            onPress={testDatabaseConnection}
            style={styles.debugButton}
          >
            <Text style={styles.debugButtonText}>Test Database Connection</Text>
          </TouchableOpacity>

          {profile && (
            <TouchableOpacity
              onPress={() => testProfileUpdate(profile.id)}
              style={styles.debugButton}
            >
              <Text style={styles.debugButtonText}>Test Profile Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        title="Update Profile Image"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  profileHeader: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    marginLeft: 6,
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 16,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  changePhotoText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  removePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  removePhotoText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  eventsCard: {
    backgroundColor: "#EFF6FF",
  },
  bookingsCard: {
    backgroundColor: "#F0FDF4",
  },
  ratingCard: {
    backgroundColor: "#FFFBEB",
  },
  reviewsCard: {
    backgroundColor: "#FAF5FF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  logoutContainer: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    padding: 24,
    borderRadius: 12,
  },
  debugContainer: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    padding: 24,
    borderRadius: 12,
  },
  debugButton: {
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});
