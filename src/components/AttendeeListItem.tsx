// components/AttendeeListItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONSTANTS } from '../constants/constants';
import { EventAttendee } from '../lib/organizer/attendees';

interface AttendeeListItemProps {
  attendee: EventAttendee;
  index: number;
}

const AttendeeListItem: React.FC<AttendeeListItemProps> = ({ attendee, index }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCall = () => {
    if (attendee.user.phone) {
      Linking.openURL(`tel:${attendee.user.phone}`);
    }
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${attendee.user.email}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: CONSTANTS.PRIMARY_COLOR,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: 'white',
            }}
          >
            {getInitials(attendee.user.full_name)}
          </Text>
        </View>

        {/* User Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1A1A1A',
                marginRight: 8,
              }}
            >
              {attendee.user.full_name}
            </Text>
            <View
              style={{
                backgroundColor: '#F0F8FF',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: '#007AFF',
                  fontWeight: '600',
                }}
              >
                #{index + 1}
              </Text>
            </View>
          </View>
          
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 4,
            }}
          >
            {attendee.user.email}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={12} color="#999" />
            <Text
              style={{
                fontSize: 12,
                color: '#999',
                marginLeft: 4,
              }}
            >
              Booked {formatDate(attendee.booking_date)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {attendee.user.phone && (
            <TouchableOpacity
              onPress={handleCall}
              style={{
                padding: 8,
                marginRight: 4,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color={CONSTANTS.PRIMARY_COLOR} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={handleEmail}
            style={{
              padding: 8,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={20} color={CONSTANTS.PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Details */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
        }}
      >
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Ionicons name="people-outline" size={16} color={CONSTANTS.PRIMARY_COLOR} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: CONSTANTS.PRIMARY_COLOR,
                marginLeft: 4,
              }}
            >
              {attendee.seats_booked}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            {attendee.seats_booked === 1 ? 'Seat' : 'Seats'}
          </Text>
        </View>
        
        <View
          style={{
            width: 1,
            backgroundColor: '#E0E0E0',
            marginHorizontal: 16,
          }}
        />
        
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Ionicons name="card-outline" size={16} color="#2ECC71" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#2ECC71',
                marginLeft: 4,
              }}
            >
              ${attendee.total_amount}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            Amount
          </Text>
        </View>
        
        <View
          style={{
            width: 1,
            backgroundColor: '#E0E0E0',
            marginHorizontal: 16,
          }}
        />
        
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={{
              backgroundColor: '#E8F5E8',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: '#2ECC71',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {attendee.status}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            Status
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AttendeeListItem;