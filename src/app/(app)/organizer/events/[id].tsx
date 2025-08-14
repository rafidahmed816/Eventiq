// app/(app)/organizer/events/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../../../context/AuthContext";
import {
  addImageToEvent,
  CreateEventData,
  deleteEvent,
  deleteEventImage,
  EVENT_CATEGORIES,
  EventImage,
  EventWithImages,
  fetchEventWithImages,
  removeEventImage,
  updateEvent,
} from "../../../../lib/organizer/events";

const { width } = Dimensions.get("window");

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();

  const [event, setEvent] = useState<EventWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    category: "Pilgrimage",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    budget_per_person: 0,
    total_seats: 1,
    cancellation_policy: 24,
    refund_rules: "",
    images: [],
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const eventData = await fetchEventWithImages(id);
      setEvent(eventData);

      // Initialize form data
      setFormData({
        title: eventData.title,
        description: eventData.description || "",
        category: eventData.category,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        budget_per_person: eventData.budget_per_person,
        total_seats: eventData.total_seats,
        cancellation_policy: eventData.cancellation_policy || 24,
        refund_rules: eventData.refund_rules || "",
        images: [],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load event details");
      console.error("Load event error:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvent();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!event || !profile?.id) return;

    try {
      setSaving(true);

      const updateData: Partial<CreateEventData> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        start_time: formData.start_time,
        end_time: formData.end_time,
        budget_per_person: formData.budget_per_person,
        total_seats: formData.total_seats,
        cancellation_policy: formData.cancellation_policy,
        refund_rules: formData.refund_rules,
      };

      await updateEvent(event.id, updateData);
      setEditing(false);
      await loadEvent();
      Alert.alert("Success", "Event updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update event");
      console.error("Update event error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = () => {
    if (!event) return;

    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              Alert.alert("Success", "Event deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete event");
              console.error("Delete event error:", error);
            }
          },
        },
      ]
    );
  };

  const handleAddImage = async () => {
    if (!event || event.images.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed per event");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setUploadingImage(true);
        const newImage = await addImageToEvent(event.id, result.assets[0].uri);
        setEvent((prev: EventWithImages | null) =>
          prev
            ? {
                ...prev,
                images: [...prev.images, newImage],
              }
            : prev
        );
        Alert.alert("Success", "Image added successfully!");
      } catch (error) {
        Alert.alert("Error", "Failed to add image");
        console.error("Add image error:", error);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = (imageId: string, imageUrl: string) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeEventImage(imageId);
            await deleteEventImage(imageUrl);
            setEvent((prev: EventWithImages | null) =>
              prev
                ? {
                    ...prev,
                    images: prev.images.filter(
                      (img: EventImage) => img.id !== imageId
                    ),
                  }
                : prev
            );
            Alert.alert("Success", "Image removed successfully!");
          } catch (error) {
            Alert.alert("Error", "Failed to remove image");
            console.error("Remove image error:", error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    if (isStartTime) {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
    }

    if ((event.type === "set" || Platform.OS === "ios") && selectedDate) {
      setFormData({
        ...formData,
        [isStartTime ? "start_time" : "end_time"]: selectedDate.toISOString(),
      });
    }
  };

  const showDatePicker = (isStartTime: boolean) => {
    if (Platform.OS === "android") {
      const currentDate = new Date(
        isStartTime ? formData.start_time : formData.end_time
      );

      DateTimePickerAndroid.open({
        value: currentDate,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) return;

          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: true,
            onChange: (event2, selectedTime) => {
              if (event2.type === "set" && selectedTime) {
                setFormData({
                  ...formData,
                  [isStartTime ? "start_time" : "end_time"]:
                    selectedTime.toISOString(),
                });
              }
            },
          });
        },
      });
    } else {
      if (isStartTime) {
        setShowStartPicker(true);
      } else {
        setShowEndPicker(true);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Header */}
      <View style={styles.statusBarSpace} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Event Details</Text>

        <View style={styles.headerActions}>
          {!editing ? (
            <>
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteEvent}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  loadEvent(); // Reset changes
                }}
                style={styles.actionButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[styles.actionButton, styles.saveButton]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Event Images */}
        <View style={styles.imagesSection}>
          <View style={styles.imagesSectionHeader}>
            <Text style={styles.sectionTitle}>Event Images</Text>
            {editing && (
              <TouchableOpacity
                onPress={handleAddImage}
                disabled={uploadingImage || event.images.length >= 5}
                style={[
                  styles.addImageButton,
                  (uploadingImage || event.images.length >= 5) &&
                    styles.disabledButton,
                ]}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={16} color="#007AFF" />
                    <Text style={styles.addImageText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {event.images.length > 0 ? (
            <ScrollView horizontal style={styles.imagesContainer}>
              {event.images.map((image: EventImage) => (
                <View key={image.id} style={styles.imageItem}>
                  <Image
                    source={{ uri: image.image_url }}
                    style={styles.eventImage}
                  />
                  {editing && (
                    <TouchableOpacity
                      onPress={() =>
                        handleRemoveImage(image.id, image.image_url)
                      }
                      style={styles.removeImageButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImages}>
              <Ionicons name="images-outline" size={48} color="#ccc" />
              <Text style={styles.noImagesText}>No images added</Text>
            </View>
          )}
        </View>

        {/* Event Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Event Information</Text>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Title</Text>
            {editing ? (
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Event title"
                maxLength={100}
              />
            ) : (
              <Text style={styles.fieldValue}>{event.title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            {editing ? (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Event description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {event.description || "No description provided"}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            {editing ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  style={styles.picker}
                >
                  {EVENT_CATEGORIES.map((category: string) => (
                    <Picker.Item
                      key={category}
                      label={category}
                      value={category}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            )}
          </View>

          {/* Start Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Start Time</Text>
            {editing ? (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.start_time)}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.fieldValue}>
                  {formatDate(event.start_time)}
                </Text>
              </View>
            )}
          </View>

          {/* End Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>End Time</Text>
            {editing ? (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(false)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.end_time)}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.fieldValue}>
                  {formatDate(event.end_time)}
                </Text>
              </View>
            )}
          </View>

          {/* Budget */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Budget per Person</Text>
            {editing ? (
              <TextInput
                style={styles.textInput}
                value={formData.budget_per_person.toString()}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    budget_per_person: parseFloat(text) || 0,
                  })
                }
                placeholder="0.00"
                keyboardType="numeric"
              />
            ) : (
              <View style={styles.priceInfo}>
                <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                <Text style={[styles.fieldValue, styles.priceText]}>
                  ${event.budget_per_person.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Total Seats */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Total Seats</Text>
            {editing ? (
              <TextInput
                style={styles.textInput}
                value={formData.total_seats.toString()}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    total_seats: parseInt(text) || 1,
                  })
                }
                placeholder="1"
                keyboardType="numeric"
              />
            ) : (
              <View style={styles.seatsInfo}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.fieldValue}>
                  {event.spots_remaining}/{event.total_seats} seats available
                </Text>
              </View>
            )}
          </View>

          {/* Cancellation Policy */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Cancellation Policy</Text>
            {editing ? (
              <>
                <TextInput
                  style={styles.textInput}
                  value={formData.cancellation_policy?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      cancellation_policy: parseInt(text) || undefined,
                    })
                  }
                  placeholder="24"
                  keyboardType="numeric"
                />
                <Text style={styles.fieldHint}>
                  Hours before event start when travelers can cancel
                </Text>
              </>
            ) : (
              <View style={styles.policyInfo}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.fieldValue}>
                  {event.cancellation_policy
                    ? `Cancel up to ${event.cancellation_policy}h before`
                    : "No cancellation policy"}
                </Text>
              </View>
            )}
          </View>

          {/* Refund Rules */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Refund Rules</Text>
            {editing ? (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.refund_rules}
                onChangeText={(text) =>
                  setFormData({ ...formData, refund_rules: text })
                }
                placeholder="Describe your refund policy..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {event.refund_rules || "No refund rules specified"}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers for iOS */}
      {Platform.OS === "ios" && showStartPicker && (
        <DateTimePicker
          value={new Date(formData.start_time)}
          mode="datetime"
          display="spinner"
          onChange={(event, date) => handleDateChange(event, date, true)}
        />
      )}

      {Platform.OS === "ios" && showEndPicker && (
        <DateTimePicker
          value={new Date(formData.end_time)}
          mode="datetime"
          display="spinner"
          onChange={(event, date) => handleDateChange(event, date, false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  statusBarSpace: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#ffe6e6",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  saveText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff6b6b",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imagesSection: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imagesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addImageText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },
  imagesContainer: {
    marginTop: 8,
  },
  imageItem: {
    position: "relative",
    marginRight: 12,
  },
  eventImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  noImages: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noImagesText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  detailsSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  fieldHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
  dateButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  seatsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  policyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
