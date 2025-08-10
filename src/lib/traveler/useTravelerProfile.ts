// lib/traveler/useTravelerProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  TravelerProfileService, 
  TravelerProfile, 
  TravelerBooking, 
  TravelerReview 
} from './travelerProfile';

export const useTravelerProfile = () => {
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await TravelerProfileService.getTravelerProfile();
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<TravelerProfile, 'full_name' | 'phone'>>) => {
    try {
      setError(null);
      const updatedProfile = await TravelerProfileService.updateTravelerProfile(updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
};

export const useTravelerBookings = () => {
  const [bookings, setBookings] = useState<TravelerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingsData = await TravelerProfileService.getTravelerBookings();
      setBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setError(null);
      const success = await TravelerProfileService.cancelBooking(bookingId);
      if (success) {
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    cancelBooking
  };
};

export const useTravelerReviews = () => {
  const [reviews, setReviews] = useState<TravelerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewsData = await TravelerProfileService.getTravelerReviews();
      setReviews(reviewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (eventId: string, rating: number, comment?: string) => {
    try {
      setError(null);
      const success = await TravelerProfileService.createReview(eventId, rating, comment);
      if (success) {
        // Refresh reviews after creating a new one
        await fetchReviews();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      return false;
    }
  }, [fetchReviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    createReview
  };
};

export const useTravelerConversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const conversationsData = await TravelerProfileService.getTravelerConversations();
      setConversations(conversationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations
  };
};