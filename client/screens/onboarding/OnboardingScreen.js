import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { handleDone } from './OnboardingController';

const slides = [
  {
    key: 'one',
    title: 'Welcome to Eventiq',
    text: 'Your go-to app for event-based travel manager',
    image: require('../../assets/ob_1.png'),
    backgroundColor: '#a8e6cf',
  },
  {
    key: 'two',
    title: 'Create or Join Groups',
    text: 'As a user or group owner, plan events easily',
    image: require('../../assets/ob_2.png'),
    backgroundColor: '#dcedc1',
  },
  {
    key: 'three',
    title: 'Stay Connected',
    text: 'See updates, posts, and more from your group',
    image: require('../../assets/ob_3.png'),
    backgroundColor: '#ffd3b6',
  },
];

const OnboardingScreen = ({ onDone }) => {
  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  // Custom button components
  const renderNextButton = () => (
    <Text style={styles.buttonText}>Next</Text>
  );

  const renderSkipButton = () => (
    <Text style={styles.buttonText}>Skip</Text>
  );

  const renderDoneButton = () => (
    <Text style={styles.buttonText}>Done</Text>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={() => handleDone(onDone)}
      showSkipButton
      onSkip={() => handleDone(onDone)}
      renderNextButton={renderNextButton}
      renderSkipButton={renderSkipButton}
      renderDoneButton={renderDoneButton}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: Dimensions.get('window').width * 0.7,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default OnboardingScreen;
