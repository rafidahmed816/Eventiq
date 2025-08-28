import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  color?: string;
  editable?: boolean;
  style?: any;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  color = "#FFD700",
  editable = false,
  style
}) => {
  const handleStarPress = (starRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= rating;
    const StarComponent = editable ? TouchableOpacity : View;

    return (
      <StarComponent
        key={starNumber}
        onPress={() => handleStarPress(starNumber)}
        style={[styles.star, editable && styles.editableStar]}
        disabled={!editable}
      >
        <Ionicons
          name={isFilled ? "star" : "star-outline"}
          size={size}
          color={isFilled ? color : "#ddd"}
        />
      </StarComponent>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 4,
  },
  editableStar: {
    padding: 4,
  },
});