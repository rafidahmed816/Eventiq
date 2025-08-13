// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { EventWithDetails } from '../lib/traveler/events';
// import { createBooking } from '../lib/traveler/bookings';
// import { useAuth } from '../context/AuthContext';

// interface BookingConfirmationModalProps {
//   visible: boolean;
//   event: EventWithDetails | null;
//   seatsRequested: number;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function BookingConfirmationModal({
//   visible,
//   event,
//   seatsRequested,
//   onClose,
//   onSuccess,
// }: BookingConfirmationModalProps) {
//   const { profile } = useAuth();
//   const [loading, setLoading] = useState(false);

//   if (!event) return null;

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
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

//   const totalPrice = event.budget_per_person * seatsRequested;
//   const isWaitlist = seatsRequested > event.spots_remaining;

//   const handleConfirmBooking = async () => {
//     if (!profile) return;

//     try {
//       setLoading(true);
//       await createBooking(profile.id, {
//         event_id: event.id,
//         seats_requested: seatsRequested,
//       });

//       Alert.alert(
//         'Booking Successful!',
//         isWaitlist 
//           ? 'You have been added to the waitlist. We\'ll notify you if spots become available.'
//           : 'Your booking has been confirmed!',
//         [{ text: 'OK', onPress: onSuccess }]
//       );
//     } catch (error) {
//       console.error('Booking error:', error);
//       Alert.alert('Booking Failed', 'Failed to create booking. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.modal}>
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>
//               {isWaitlist ? 'Join Waitlist' : 'Confirm Booking'}
//             </Text>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Ionicons name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           {/* Event Info */}
//           <View style={styles.eventInfo}>
//             {event.images && event.images.length > 0 ? (
//               <Image
//                 source={{ uri: event.images[0].image_url }}
//                 style={styles.eventImage}
//                 resizeMode="cover"
//               />
//             ) : (
//               <View style={[styles.eventImage, styles.placeholderImage]}>
//                 <Ionicons name="image-outline" size={40} color="#C4C4C4" />
//               </View>
//             )}
            
//             <View style={styles.eventDetails}>
//               <Text style={styles.eventTitle} numberOfLines={2}>
//                 {event.title}
//               </Text>
//               <Text style={styles.eventCategory}>{event.category}</Text>
              
//               <View style={styles.eventMeta}>
//                 <View style={styles.metaRow}>
//                   <Ionicons name="calendar-outline" size={16} color="#666" />
//                   <Text style={styles.metaText}>{formatDate(event.start_time)}</Text>
//                 </View>
//                 <View style={styles.metaRow}>
//                   <Ionicons name="time-outline" size={16} color="#666" />
//                   <Text style={styles.metaText}>
//                     {formatTime(event.start_time)} - {formatTime(event.end_time)}
//                   </Text>
//                 </View>
//                 {event.organizer && (
//                   <View style={styles.metaRow}>
//                     <Ionicons name="person-outline" size={16} color="#666" />
//                     <Text style={styles.metaText}>{event.organizer.full_name}</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           </View>

//           {/* Booking Details */}
//           <View style={styles.bookingDetails}>
//             <Text style={styles.sectionTitle}>Booking Summary</Text>
            
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Number of seats:</Text>
//               <Text style={styles.summaryValue}>{seatsRequested}</Text>
//             </View>
            
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Price per person:</Text>
//               <Text style={styles.summaryValue}>{formatPrice(event.budget_per_person)}</Text>
//             </View>
            
//             <View style={[styles.summaryRow, styles.totalRow]}>
//               <Text style={styles.totalLabel}>Total:</Text>
//               <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
//             </View>

//             {isWaitlist && (
//               <View style={styles.waitlistNotice}>
//                 <Ionicons name="information-circle" size={20} color="#FF9500" />
//                 <Text style={styles.waitlistText}>
//                   Only {event.spots_remaining} spots remaining. You'll be added to the waitlist.
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actions}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={onClose}
//               disabled={loading}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.confirmButton, loading && styles.disabledButton]}
//               onPress={handleConfirmBooking}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#FFFFFF" size="small" />
//               ) : (
//                 <>
//                   <Ionicons 
//                     name={isWaitlist ? "hourglass-outline" : "checkmark-circle"} 
//                     size={20} 
//                     color="#FFFFFF" 
//                   />
//                   <Text style={styles.confirmButtonText}>
//                     {isWaitlist ? 'Join Waitlist' : 'Confirm Booking'}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modal: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//     paddingBottom: 34, // For safe area
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E7',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1C1C1E',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   eventInfo: {
//     flexDirection: 'row',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E7',
//   },
//   eventImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//     marginRight: 16,
//   },
//   placeholderImage: {
//     backgroundColor: '#F5F5F5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   eventDetails: {
//     flex: 1,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   eventCategory: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   eventMeta: {
//     gap: 4,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   metaText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 6,
//   },
//   bookingDetails: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1C1C1E',
//     marginBottom: 16,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   summaryLabel: {
//     fontSize: 16,
//     color: '#666',
//   },
//   summaryValue: {
//     fontSize: 16,
//     color: '#1C1C1E',
//     fontWeight: '600',
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#E5E5E7',
//     marginTop: 8,
//     paddingTop: 16,
//   },
//   totalLabel: {
//     fontSize: 18,
//     color: '#1C1C1E',
//     fontWeight: '700',
//   },
//   totalValue: {
//     fontSize: 20,
//     color: '#34C759',
//     fontWeight: '700',
//   },
//   waitlistNotice: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3CD',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   waitlistText: {
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 8,
//     flex: 1,
//     lineHeight: 20,
//   },
//   actions: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E5E7',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '600',
//   },
//   confirmButton: {
//     flex: 2,
//     backgroundColor: '#007AFF',
//     paddingVertical: 16,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   disabledButton: {
//     backgroundColor: '#C4C4C4',
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
// });