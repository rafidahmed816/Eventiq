// components/FilterButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CONSTANTS } from "../constants/constants";

interface FilterButtonProps {
  onPress: () => void;
  activeFiltersCount?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onPress,
  activeFiltersCount = 0,
}) => {
  return (
    <TouchableOpacity style={styles.filterButton} onPress={onPress}>
      <Ionicons name="options-outline" size={20} color={CONSTANTS.PRIMARY_COLOR} />
      {activeFiltersCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeFiltersCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
});
