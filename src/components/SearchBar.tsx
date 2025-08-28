// components/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  onFilterPress?: () => void;
  activeFiltersCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search events...",
  onFilterPress,
  activeFiltersCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {onFilterPress && (
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Ionicons name="options-outline" size={20} color={CONSTANTS.PRIMARY_COLOR} />
            {activeFiltersCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

import {
  moderateScaling,
  normalizeFont,
  scale,
  spacing,
} from "../utils/scaling";
import { CONSTANTS } from "../constants/constants";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: moderateScaling(12),
    paddingHorizontal: spacing.sm,
    height: scale(44),
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: normalizeFont(16),
    color: "#1a1a1a",
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  filterButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScaling(12),
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
    fontSize: normalizeFont(10),
    fontWeight: "600",
  },
});
