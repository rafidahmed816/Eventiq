
const ONBOARDING_KEY = "onboarding_completed";

// Since we're skipping onboarding entirely, always return true
export const isOnboarded = async (): Promise<boolean> => {
  console.log("🔍 [OnboardingStorage] Skipping onboarding - always returning true");
  return true;
};

export const setOnboarded = async ()=> {
  console.log("🔍 [OnboardingStorage] Skipping onboarding - no action needed");
  // No action needed since we're skipping onboarding
};

// Add a debug function to clear onboarding status
export const clearOnboardingStatus = async () => {
  console.log("🔍 [OnboardingStorage] Skipping onboarding - no action needed");
  // No action needed since we're skipping onboarding
};
