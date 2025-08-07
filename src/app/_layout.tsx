// app/_layout.tsx
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View } from 'react-native'

const ONBOARDING_KEY = '@onboarding_completed'

function RootLayoutContent() {
  const { session, user, profile, loading } = useAuth()
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY)
      setOnboardingComplete(completed === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setOnboardingComplete(false)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  // Show loading spinner while checking auth and onboarding status
  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // If onboarding not completed, show onboarding flow
  if (!onboardingComplete) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboard)" options={{ headerShown: false }} />
      </Stack>
    )
  }

  // If not authenticated, show auth flow
  if (!session || !user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    )
  }

  // If profile exists but not onboarded, redirect to complete profile
  if (profile && !profile.onboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/complete-profile" options={{ headerShown: false }} />
      </Stack>
    )
  }

  // User is authenticated and onboarded, show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="logout" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  )
}