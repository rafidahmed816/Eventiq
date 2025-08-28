// components/FilterModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EVENT_CATEGORIES } from "../lib/organizer/events";
import {CONSTANTS} from "../constants/constants";
const { height: screenHeight } = Dimensions.get("window");

interface FilterOptions {
  categories: string[];
  priceRanges: string[];
  durations: string[];
  dates: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const PRICE_RANGES = [
  { label: "Under $25", value: "0-25" },
  { label: "$25 - $50", value: "25-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "Over $200", value: "200+" },
];

const DURATION_OPTIONS = [
  { label: "Under 2 hours", value: "0-120" },
  { label: "2 - 4 hours", value: "120-240" },
  { label: "4 - 6 hours", value: "240-360" },
  { label: "6 - 8 hours", value: "360-480" },
  { label: "Full day (8+ hours)", value: "480+" },
];

const DATE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "Next month", value: "next-month" },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(
    initialFilters?.priceRanges || []
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    initialFilters?.durations || []
  );
  const [selectedDates, setSelectedDates] = useState<string[]>(
    initialFilters?.dates || []
  );

  const toggleSelection = (
    item: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      priceRanges: selectedPriceRanges,
      durations: selectedDurations,
      dates: selectedDates,
    });
    onClose();
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedDurations([]);
    setSelectedDates([]);
  };

  const getActiveFiltersCount = () => {
    return (
      selectedCategories.length +
      selectedPriceRanges.length +
      selectedDurations.length +
      selectedDates.length
    );
  };

  const renderFilterSection = (
    title: string,
    items: Array<{ label: string; value: string }> | string[],
    selectedItems: string[],
    onToggle: (item: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {items.map((item) => {
          const value = typeof item === "string" ? item : item.value;
          const label = typeof item === "string" ? item : item.label;
          const isSelected = selectedItems.includes(value);

          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterOption,
                isSelected && styles.filterOptionSelected,
              ]}
              onPress={() => onToggle(value)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  isSelected && styles.filterOptionTextSelected,
                ]}
              >
                {label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={CONSTANTS.PRIMARY_COLOR} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFilterSection(
            "Categories",
            EVENT_CATEGORIES.map((cat) => ({ label: cat, value: cat })),
            selectedCategories,
            (item) =>
              toggleSelection(item, selectedCategories, setSelectedCategories)
          )}

          {renderFilterSection(
            "Price Range",
            PRICE_RANGES,
            selectedPriceRanges,
            (item) =>
              toggleSelection(item, selectedPriceRanges, setSelectedPriceRanges)
          )}

          {renderFilterSection(
            "Duration",
            DURATION_OPTIONS,
            selectedDurations,
            (item) =>
              toggleSelection(item, selectedDurations, setSelectedDurations)
          )}

          {renderFilterSection("Date", DATE_OPTIONS, selectedDates, (item) =>
            toggleSelection(item, selectedDates, setSelectedDates)
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>
              Apply Filters{" "}
              {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  clearAllText: {
    fontSize: 16,
    color: CONSTANTS.PRIMARY_COLOR,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 32,
    paddingTop: 24,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  filterOptions: {
    gap: 12,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterOptionSelected: {
    borderColor: CONSTANTS.PRIMARY_COLOR,
    backgroundColor: "#f0f8ff",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  filterOptionTextSelected: {
    color: CONSTANTS.PRIMARY_COLOR,
    fontWeight: "500",
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  applyButton: {
    backgroundColor: CONSTANTS.PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
