// components/ProfileAvatar.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileAvatarProps {
  imageUrl?: string | null;
  fullName?: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onPress?: () => void;
  showEditIcon?: boolean;
  editable?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  fullName,
  size = 'medium',
  onPress,
  showEditIcon = false,
  editable = false,
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { 
          containerSize: 40, 
          fontSize: 14, 
          iconSize: 20,
          editIconSize: 12,
          editIconContainer: 16
        };
      case 'medium':
        return { 
          containerSize: 60, 
          fontSize: 18, 
          iconSize: 24,
          editIconSize: 14,
          editIconContainer: 20
        };
      case 'large':
        return { 
          containerSize: 80, 
          fontSize: 24, 
          iconSize: 32,
          editIconSize: 16,
          editIconContainer: 24
        };
      case 'xlarge':
        return { 
          containerSize: 120, 
          fontSize: 36, 
          iconSize: 48,
          editIconSize: 18,
          editIconContainer: 28
        };
      default:
        return { 
          containerSize: 60, 
          fontSize: 18, 
          iconSize: 24,
          editIconSize: 14,
          editIconContainer: 20
        };
    }
  };

  const config = getSizeConfig();

  // Get initials for fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const containerStyle = {
    width: config.containerSize,
    height: config.containerSize,
    borderRadius: config.containerSize / 2,
  };

  const AvatarContent = () => (
    <View style={[containerStyle, { position: 'relative' }]}>
      <View 
        style={[
          containerStyle,
          {
            backgroundColor: '#E5E7EB',
            borderWidth: 2,
            borderColor: '#D1D5DB',
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              containerStyle,
              {
                width: config.containerSize - 4,
                height: config.containerSize - 4,
              }
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {fullName ? (
              <Text 
                style={{ 
                  fontSize: config.fontSize, 
                  fontWeight: 'bold', 
                  color: '#6B7280' 
                }}
              >
                {getInitials(fullName)}
              </Text>
            ) : (
              <Ionicons 
                name="person" 
                size={config.iconSize} 
                color="#6B7280" 
              />
            )}
          </View>
        )}
      </View>
      
      {showEditIcon && (
        <View 
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#3B82F6',
            width: config.editIconContainer,
            height: config.editIconContainer,
            borderRadius: config.editIconContainer / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name="camera" 
            size={config.editIconSize} 
            color="white" 
          />
        </View>
      )}
    </View>
  );

  if (editable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};