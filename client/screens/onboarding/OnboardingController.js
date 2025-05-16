import { setOnboardingSeen } from './OnboardingStorage';

export const handleDone = async (onComplete) => {
  await setOnboardingSeen();
  onComplete();
};
