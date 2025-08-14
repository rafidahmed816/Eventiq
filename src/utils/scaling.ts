import { Dimensions, PixelRatio, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions
const baseWidth = 375; // Standard iPhone width
const baseHeight = 812; // Standard iPhone height

// Scaling factors
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;
const moderateScale = Math.min(widthScale, heightScale);

export const scale = (size: number) => Math.round(size * widthScale);
export const verticalScale = (size: number) => Math.round(size * heightScale);
export const moderateScaling = (size: number, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);

// Font scaling
const baseFontScale = PixelRatio.getFontScale();
export const normalizeFont = (size: number) => {
  const normalizedSize = size * moderateScale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(normalizedSize));
  }
  return (
    Math.round(PixelRatio.roundToNearestPixel(normalizedSize)) / baseFontScale
  );
};

// Device type detection
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 768;

export const deviceSize = {
  isSmall: isSmallDevice,
  isLarge: isLargeDevice,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

// Padding and margin scales
export const spacing = {
  xs: moderateScaling(4),
  sm: moderateScaling(8),
  md: moderateScaling(16),
  lg: moderateScaling(24),
  xl: moderateScaling(32),
};

// Common styles with scaling
export const commonStyles = {
  container: {
    paddingHorizontal: spacing.md,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? moderateScaling(25) : 0,
  },
};
