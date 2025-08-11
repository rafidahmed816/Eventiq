// components/DateTimePicker.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateTimePickerComponentProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  showPicker: boolean;
  onShowPicker: () => void;
  onHidePicker: () => void;
  minimumDate?: Date;
}

export const DateTimePickerComponent: React.FC<
  DateTimePickerComponentProps
> = ({
  label,
  value,
  onChange,
  showPicker,
  onShowPicker,
  onHidePicker,
  minimumDate,
}) => {
  const formatDateTime = (dateString: string) => {
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      onHidePicker();
    }

    if ((event.type === "set" || Platform.OS === "ios") && selectedDate) {
      onChange(selectedDate.toISOString());
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === "android") {
      const currentDate = new Date(value);

      DateTimePickerAndroid.open({
        value: currentDate,
        mode: "date",
        minimumDate,
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) return;

          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: true,
            onChange: (event2, selectedTime) => {
              if (event2.type === "set" && selectedTime) {
                onChange(selectedTime.toISOString());
              }
            },
          });
        },
      });
    } else {
      // iOS
      onShowPicker();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={showDatePicker}>
        <Text style={styles.inputText}>{formatDateTime(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      {Platform.OS === "ios" && showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={new Date(value)}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={minimumDate}
          />
          <TouchableOpacity style={styles.doneButton} onPress={onHidePicker}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButton: {
    backgroundColor: "#007AFF",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
