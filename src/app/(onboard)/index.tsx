// app/(onboard)/index.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PagerView from 'react-native-pager-view'

const { width } = Dimensions.get('window')
const ONBOARDING_KEY = 'onboarding_completed'

interface OnboardingSlide {
  id: string
  title: string
  description: string
  icon: string
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Amazing Events',
    description: 'Find unique pilgrimage tours, city adventures, and cultural experiences near you.',
    icon: '🕌',
  },
  {
    id: '2',
    title: 'Book with Confidence',
    description: 'Secure your spot with trusted organizers. Easy booking and payment process.',
    icon: '✅',
  },
  {
    id: '3',
    title: 'Connect & Share',
    description: 'Chat with organizers, ask questions, and share your experiences with others.',
    icon: '💬',
  },
  {
    id: '4',
    title: 'Ready to Begin?',
    description: 'Join thousands of travelers and organizers creating unforgettable experiences.',
    icon: '🚀',
  },
]

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0)

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      router.replace('/(auth)/login')
    } catch (error) {
      console.error('Error saving onboarding status:', error)
      router.replace('/(auth)/login')
    }
  }

  const handleSkip = async () => {
    await handleComplete()
  }

  const goToNext = () => {
    if (currentPage < slides.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      handleComplete()
    }
  }

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <PagerView
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </PagerView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentPage && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={goToNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>
            {currentPage === slides.length - 1 ? "Let's Get Started" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})