import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import {
  createEvent,
  CreateEventData,
  deleteEvent,
  Event,
  EVENT_CATEGORIES,
  fetchOrganizerEvents,
} from "../../../lib/organizer/events";

export default function EventsScreen() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    category: "Pilgrimage",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    budget_per_person: 0,
    total_seats: 1,
    cancellation_policy: "",
    refund_rules: "",
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const data = await fetchOrganizerEvents(profile.id);
      setEvents(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load events");
      console.error("Load events error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Pilgrimage",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      budget_per_person: 0,
      total_seats: 1,
      cancellation_policy: "",
      refund_rules: "",
    });
  };

  const handleCreateEvent = async () => {
    if (!profile?.id || !formData.title.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      await createEvent(profile.id, formData);
      setShowCreateModal(false);
      resetForm();
      await loadEvents();
      Alert.alert("Success", "Event created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create event");
      console.error("Create event error:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    Alert.alert("Delete Event", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            await loadEvents();
            Alert.alert("Success", "Event deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete event");
            console.error("Delete event error:", error);
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

  const EventCard = ({ event }: { event: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteEvent(event.id, event.title)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.description || "No description provided"}
      </Text>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {formatDate(event.start_time)}
          </Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            ${event.budget_per_person.toFixed(2)} per person
          </Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {event.spots_remaining}/{event.total_seats} seats available
          </Text>
        </View>
      </View>
    </View>
  );

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    isStartTime: boolean
  ) => {
    // Hide the picker first for both platforms.
    if (isStartTime) {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
    }

    // On Android, the event type tells us if the user picked a date or cancelled.
    // On iOS, the behavior is different and we just check for a selected date.
    // We only update the state if a date was actually selected.
    if ((event.type === "set" || Platform.OS === "ios") && selectedDate) {
      setFormData({
        ...formData,
        [isStartTime ? "start_time" : "end_time"]: selectedDate.toISOString(),
      });
    }
  };

  // const showDatePickerModal = (isStartTime: boolean) => {
  //   isStartTime ? setShowStartPicker(true) : setShowEndPicker(true);
  // };
  const showDatePicker = (isStartTime: boolean) => {
    const currentDate = new Date(
      isStartTime ? formData.start_time : formData.end_time
    );

    // First pick date
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "date",
      onChange: (event, selectedDate) => {
        if (event.type !== "set" || !selectedDate) return;

        // Then pick time
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
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create Event Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Create New Event</Text>
      </TouchableOpacity>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No events created yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the button above to create your first event
            </Text>
          </View>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Create Event</Text>

            <TouchableOpacity onPress={handleCreateEvent} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.modalSaveButton}>Create</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Title *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Enter event title"
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Describe your event..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  style={styles.picker}
                >
                  {EVENT_CATEGORIES.map((category) => (
                    <Picker.Item
                      key={category}
                      label={category}
                      value={category}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Start Time */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Start Time *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.start_time)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>End Time *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(false)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.end_time)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget per Person *</Text>
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
            </View>

            {/* Total Seats */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Total Seats *</Text>
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
            </View>

            {/* Cancellation Policy */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cancellation Policy</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.cancellation_policy}
                onChangeText={(text) =>
                  setFormData({ ...formData, cancellation_policy: text })
                }
                placeholder="Describe your cancellation policy..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Refund Rules */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Refund Rules</Text>
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
            </View>
          </ScrollView>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={new Date(formData.start_time)}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date, true)}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={new Date(formData.end_time)}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date, false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  createButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#666",
  },
  modalSaveButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: "white",
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
});
