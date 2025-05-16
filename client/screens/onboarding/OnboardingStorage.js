import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export const setOnboardingSeen = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
};

export const getOnboardingSeen = async () => {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
};

export const resetOnboarding = async () => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
};
