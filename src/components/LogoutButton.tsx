// components/LogoutButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TravelerProfileService } from '../lib/traveler/travelerProfile';

interface LogoutButtonProps {
  variant?: 'button' | 'menu-item';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: string) => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'button',
  size = 'medium',
  showIcon = true,
  onLogoutStart,
  onLogoutComplete,
  onLogoutError
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = async () => {
    try {
      setIsLoading(true);
      onLogoutStart?.();

      const success = await TravelerProfileService.logout();

      if (success) {
        onLogoutComplete?.();
        // Navigate to login screen
        router.replace('/(auth)/login');
      } else {
        const errorMessage = 'Failed to logout. Please try again.';
        onLogoutError?.(errorMessage);
        Alert.alert('Logout Error', errorMessage);
      }
    } catch (error) {
      // Type 'error' as 'unknown' for better type safety than 'any'.
      // Then, check if it's an instance of Error to safely access its message property.
      let errorMessage = 'An error occurred during logout.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      onLogoutError?.(errorMessage);
      Alert.alert('Error', errorMessage);
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'menu-item') {
    return (
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={handleLogout}
        disabled={isLoading}
      >
        <View style={styles.menuItemContent}>
          {showIcon && (
            <Ionicons 
              name="log-out-outline" 
              size={24} 
              color="#ef4444" 
              style={styles.menuIcon}
            />
          )}
          <Text style={styles.menuItemText}>Logout</Text>
          {isLoading && (
            <ActivityIndicator 
              size="small" 
              color="#ef4444" 
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Create explicit style lookup objects to ensure type safety.
  // This prevents mixing ViewStyle and TextStyle properties.
  const buttonSizeStyles: { [key in 'small' | 'medium' | 'large']: ViewStyle } = {
    small: styles.buttonSmall,
    medium: styles.buttonMedium,
    large: styles.buttonLarge,
  };

  const textSizeStyles: { [key in 'small' | 'medium' | 'large']: TextStyle } = {
    small: styles.buttonTextSmall,
    medium: styles.buttonTextMedium,
    large: styles.buttonTextLarge,
  };

  const buttonStyle: StyleProp<ViewStyle> = [
    styles.button,
    buttonSizeStyles[size],
    isLoading && styles.buttonDisabled
  ];

  const textStyle: StyleProp<TextStyle> = [
    styles.buttonText,
    textSizeStyles[size]
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={handleLogout}
      disabled={isLoading}
    >
      <View style={styles.buttonContent}>
        {showIcon && !isLoading && (
          <Ionicons 
            name="log-out-outline" 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
            color="white" 
            style={styles.buttonIcon}
          />
        )}
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={textStyle}>Logout</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Button variant styles
  button: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextMedium: {
    fontSize: 16,
  },
  buttonTextLarge: {
    fontSize: 18,
  },

  // Menu item variant styles
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
});

export default LogoutButton;
