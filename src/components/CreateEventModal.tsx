// components/CreateEventModal.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CreateEventData } from "../lib/organizer/events";
import { CategoryPicker } from "./CategoryPicker";
import { DateTimePickerComponent } from "./DateTimePicker";
import { FormInput } from "./FormInput";
import { ImagePickerModal } from "./ImagePickerModal";
import { ImageSelectionGrid } from "./ImageSelectionGrid";
import { CONSTANTS } from "../constants/constants";
interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: CreateEventData) => Promise<void>;
  creating: boolean;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreateEvent,
  creating,
}) => {
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

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const resetForm = () => {
    setFormData({
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
    setSelectedImages([]);
  };

  const handleImageSelected = (imageUri: string) => {
    if (selectedImages.length >= 5) {
      Alert.alert(
        "Limit Reached",
        "You can only upload up to 5 images per event."
      );
      return;
    }
    setSelectedImages((prev) => [...prev, imageUri]);
  };

  const handleAddImage = () => {
    if (selectedImages.length >= 5) {
      Alert.alert(
        "Limit Reached",
        "You can only upload up to 5 images per event."
      );
      return;
    }
    setShowImagePicker(true);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    if (formData.budget_per_person <= 0) {
      Alert.alert("Error", "Please enter a valid budget per person");
      return;
    }

    if (formData.total_seats <= 0) {
      Alert.alert("Error", "Please enter a valid number of seats");
      return;
    }

    // Validate end time is after start time
    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);

    if (endDate <= startDate) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    const eventDataWithImages: CreateEventData = {
      ...formData,
      images: selectedImages,
    };

    try {
      await onCreateEvent(eventDataWithImages);
      resetForm();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (creating) return; // Don't allow closing while creating
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} disabled={creating}>
              <Text
                style={[styles.cancelButton, creating && styles.disabledText]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Event</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color={CONSTANTS.PRIMARY_COLOR} />
              ) : (
                <Text style={styles.saveButton}>Create</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <FormInput
              label="Event Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter event title"
              required
            />

            <FormInput
              label="Description"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Describe your event"
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <CategoryPicker
              selectedCategory={formData.category}
              onSelectCategory={(category) =>
                setFormData({ ...formData, category })
              }
            />

            <DateTimePickerComponent
              label="Start Time"
              value={formData.start_time}
              onChange={(date) =>
                setFormData({ ...formData, start_time: date })
              }
              showPicker={showStartPicker}
              onShowPicker={() => setShowStartPicker(true)}
              onHidePicker={() => setShowStartPicker(false)}
              minimumDate={new Date()}
            />

            <DateTimePickerComponent
              label="End Time"
              value={formData.end_time}
              onChange={(date) => {
                const startDate = new Date(formData.start_time);
                const selectedDate = new Date(date);

                if (selectedDate <= startDate) {
                  Alert.alert(
                    "Invalid Date",
                    "End time must be after start time. Please select a later time."
                  );
                  return;
                }

                setFormData({ ...formData, end_time: date });
              }}
              showPicker={showEndPicker}
              onShowPicker={() => setShowEndPicker(true)}
              onHidePicker={() => setShowEndPicker(false)}
              minimumDate={new Date(formData.start_time)}
            />

            <FormInput
              label="Budget per Person ($)"
              value={formData.budget_per_person.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  budget_per_person: parseFloat(text) || 0,
                })
              }
              placeholder="0.00"
              keyboardType="numeric"
              required
            />

            <FormInput
              label="Total Seats"
              value={formData.total_seats.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, total_seats: parseInt(text) || 1 })
              }
              placeholder="1"
              keyboardType="numeric"
              required
            />

            <FormInput
              label="Cancellation Policy (hours before event)"
              value={formData.cancellation_policy?.toString() || ""}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  cancellation_policy: parseInt(text) || 24,
                })
              }
              placeholder="24"
              keyboardType="numeric"
            />

            <FormInput
              label="Refund Rules"
              value={formData.refund_rules}
              onChangeText={(text) =>
                setFormData({ ...formData, refund_rules: text })
              }
              placeholder="Describe your refund policy"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <ImageSelectionGrid
              selectedImages={selectedImages}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
            />

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        title="Add Event Image"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: CONSTANTS.PRIMARY_COLOR,
    fontWeight: "600",
  },
  disabledText: {
    color: "#ccc",
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  bottomSpacing: {
    height: 40,
  },
});
