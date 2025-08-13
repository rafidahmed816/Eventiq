// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../../../context/AuthContext';
// import { fetchTravelerBookings, cancelBooking, BookingWithEvent } from '../../../lib/traveler/bookings';

// export default function BookingsPage() {
//   const { profile } = useAuth();
//   const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'past' | 'waitlist'>('all');

//   useEffect(() => {
//     if (profile) {
//       loadBookings();
//     }
//   }, [profile]);

//   const loadBookings = async () => {
//     if (!profile) return;

//     try {
//       setLoading(true);
//       const data = await fetchTravelerBookings(profile.id);
//       setBookings(data);
//     } catch (error) {
//       console.error('Error loading bookings:', error);
//       Alert.alert('Error', 'Failed to load bookings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadBookings();
//     setRefreshing(false);
//   }, [profile]);

//   const handleCancelBooking = async (bookingId: string, eventTitle: string) => {
//     Alert.alert(
//       'Cancel Booking',
//       `Are you sure you want to cancel your booking for "${eventTitle}"?`,
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes, Cancel',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await cancelBooking(bookingId);
//               await loadBookings(); // Reload bookings
//               Alert.alert('Success', 'Booking cancelled successfully');
//             } catch (error) {
//               console.error('Cancel booking error:', error);
//               Alert.alert('Error', 'Failed to cancel booking');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const getFilteredBookings = () => {
//     const now = new Date();
    
//     switch (selectedTab) {
//       case 'upcoming':
//         return bookings.filter(
//           booking => 
//             new Date(booking.event.start_time) > now && 
//             booking.status !== 'cancelled'
//         );
//       case 'past':
//         return bookings.filter(
//           booking => 
//             new Date(booking.event.end_time) < now ||
//             booking.status === 'cancelled'
//         );
//       case 'waitlist':
//         return bookings.filter(booking => booking.status === 'waitlist');
//       default:
//         return bookings;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'confirmed':
//       case 'reserved':
//         return '#34C759';
//       case 'waitlist':
//         return '#FF9500';
//       case 'cancelled':
//         return '#FF3B30';
//       default:
//         return '#666';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'reserved':
//         return 'Reserved';
//       case 'confirmed':
//         return 'Confirmed';
//       case 'waitlist':
//         return 'Waitlisted';
//       case 'cancelled':
//         return 'Cancelled';
//       default:
//         return status;
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (dateString: string) => {
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatPrice = (price: number) => {
//     return `$${price.toLocaleString()}`;
//   };

//   const canCancelBooking = (booking: BookingWithEvent) => {
//     const now = new Date();
//     const eventStart = new Date(booking.event.start_time);
//     const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
//     return (
//       booking.status !== 'cancelled' &&
//       hoursUntilEvent > 24 && // Can cancel at least 24 hours before
//       eventStart > now
//     );
//   };

//   const renderBookingCard = ({ item }: { item: BookingWithEvent }) => (
//     <TouchableOpacity
//       style={styles.bookingCard}
//       onPress={() => router.push(`/traveler/events/${item.event.id}`)}
//       activeOpacity={0.7}
//     >
//       {/* Event Image */}
//       <View style={styles.imageContainer}>
//         {item.event.image_url ? (
//           <Image
//             source={{ uri: item.event.image_url }}
//             style={styles.eventImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View style={[styles.eventImage, styles.placeholderImage]}>
//             <Ionicons name="image-outline" size={30} color="#C4C4C4" />
//           </View>
//         )}
        
//         {/* Status Badge */}
//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//           <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
//         </View>
//       </View>

//       {/* Booking Details */}
//       <View style={styles.bookingDetails}>
//         <Text style={styles.eventTitle} numberOfLines={2}>
//           {item.event.title}
//         </Text>
        
//         <View style={styles.eventMeta}>
//           <View style={styles.metaRow}>
//             <Ionicons name="calendar-outline" size={16} color="#666" />
//             <Text style={styles.metaText}>{formatDate(item.event.start_time)}</Text>
//           </View>
          
//           <View style={styles.metaRow}>
//             <Ionicons name="time-outline" size={16} color="#666" />
//             <Text style={styles.metaText}>
//               {formatTime(item.event.start_time)} - {formatTime(item.event.end_time)}
//             </Text>
//           </View>
          
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#666" />
//             <Text style={styles.metaText}>{item.event.category}</Text>
//           </View>
          
//           {item.event.organizer_name && (
//             <View style={styles.metaRow}>
//               <Ionicons name="person-outline" size={16} color="#666" />
//               <Text style={styles.metaText}>{item.event.organizer_name}</Text>
//             </View>
//           )}
//         </View>

//         {/* Booking Info */}
//         <View style={styles.bookingInfo}>
//           <View style={styles.seatsContainer}>
//             <Text style={styles.seatsLabel}>Seats:</Text>
//             <Text style={styles.seatsValue}>{item.seats_requested}</Text>
//           </View>
          
//           <View style={styles.totalContainer}>
//             <Text style={styles.totalLabel}>Total:</Text>
//             <Text style={styles.totalValue}>
//               {formatPrice(item.event.budget_per_person * item.seats_requested)}
//             </Text>
//           </View>
//         </View>

//         {/* Actions */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={styles.viewButton}
//             onPress={() => router.push(`/traveler/events/${item.event.id}`)}
//           >
//             <Ionicons name="eye-outline" size={16} color="#007AFF" />
//             <Text style={styles.viewButtonText}>View Event</Text>
//           </TouchableOpacity>
          
//           {canCancelBooking(item) && (
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => handleCancelBooking(item.id, item.event.title)}
//             >
//               <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderTabBar = () => (
//     <View style={styles.tabBar}>
//       {[
//         { key: 'all', label: 'All' },
//         { key: 'upcoming', label: 'Upcoming' },
//         { key: 'past', label: 'Past' },
//         { key: 'waitlist', label: 'Waitlist' },
//       ].map((tab) => (
//         <TouchableOpacity
//           key={tab.key}
//           style={[
//             styles.tabButton,
//             selectedTab === tab.key && styles.activeTabButton,
//           ]}
//           onPress={() => setSelectedTab(tab.key as any)}
//         >
//           <Text
//             style={[
//               styles.tabButtonText,
//               selectedTab === tab.key && styles.activeTabButtonText,
//             ]}
//           >
//             {tab.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <Ionicons name="ticket-outline" size={80} color="#C4C4C4" />
//       <Text style={styles.emptyTitle}>No Bookings Found</Text>
//       <Text style={styles.emptyMessage}>
//         {selectedTab === 'all' 
//           ? "You haven't made any bookings yet"
//           : `No ${selectedTab} bookings found`
//         }
//       </Text>
//       {selectedTab === 'all' && (
//         <TouchableOpacity
//           style={styles.exploreButton}
//           onPress={() => router.push('/traveler/feed')}
//         >
//           <Text style={styles.exploreButtonText}>Explore Events</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const filteredBookings = getFilteredBookings();

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Stack.Screen
//           options={{
//             headerShown: true,
//             title: 'My Bookings',
//             headerStyle: { backgroundColor: '#007AFF' },
//             headerTintColor: '#FFFFFF',
//             headerTitleStyle: { fontWeight: 'bold' },
//           }}
//         />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={styles.loadingText}>Loading your bookings...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <Stack.Screen
//         options={{
//           headerShown: true,
//           title: 'My Bookings',
//           headerStyle: { backgroundColor: '#007AFF' },
//           headerTintColor: '#FFFFFF',
//           headerTitleStyle: { fontWeight: 'bold' },
//         }}
//       />

//       <View style={styles.content}>
//         {/* Tab Bar */}
//         {renderTabBar()}

//         {/* Bookings List */}
//         <FlatList
//           data={filteredBookings}
//           renderItem={renderBookingCard}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//           }
//           ListEmptyComponent={renderEmptyState}
//           contentContainerStyle={
//             filteredBookings.length === 0 ? styles.emptyContent : styles.listContent
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   content: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   tabBar: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E7',
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   activeTabButton: {
//     backgroundColor: '#007AFF',
//   },
//   tabButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   activeTabButtonText: {
//     color: '#FFFFFF',
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   emptyContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   bookingCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   imageContainer: {
//     position: 'relative',
//     height: 120,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//     overflow: 'hidden',
//   },
//   eventImage: {
//     width: '100%',
//     height: '100%',
//   },
//   placeholderImage: {
//     backgroundColor: '#F5F5F5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   statusBadge: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   bookingDetails: {
//     padding: 16,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   eventMeta: {
//     marginBottom: 12,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   metaText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 6,
//   },
//   bookingInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//     marginBottom: 12,
//   },
//   seatsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   seatsLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginRight: 4,
//   },
//   seatsValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1C1C1E',
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginRight: 4,
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#34C759',
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   viewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     backgroundColor: '#F0F8FF',
//   },
//   viewButtonText: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   cancelButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     backgroundColor: '#FFF0F0',
//   },
//   cancelButtonText: {
//     fontSize: 14,
//     color: '#FF3B30',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyMessage: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//     marginBottom: 24,
//   },
//   exploreButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   exploreButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });