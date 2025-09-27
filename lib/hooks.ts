"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/database";
import { profileService, peopleService, bookingService } from "@/lib/services";
import type {
  Profile,
  PersonWithProfile,
  BookingWithDetails,
  PeopleFilters,
} from "@/lib/domain-types";

// Authentication hook with proper error handling
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setError(null);
      const result = await profileService.getProfile(userId);

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error.message);
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch profile");
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to get session");
          console.error("Session error:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    return { data, error };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      }

      return { data, error };
    },
    []
  );

  const signOut = useCallback(async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
    }

    return { error };
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        const error = new Error("No user found");
        setError(error.message);
        return { data: null, error };
      }

      setError(null);
      const result = await profileService.updateProfile(user.id, updates);

      if (result.success) {
        setProfile(result.data);
        return { data: result.data, error: null };
      } else {
        setError(result.error.message);
        return { data: null, error: result.error };
      }
    },
    [user]
  );

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchProfile: useCallback(
      (userId: string) => fetchProfile(userId),
      [fetchProfile]
    ),
  };
}

// People hook with service layer integration
export function usePeople() {
  const [people, setPeople] = useState<PersonWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async (filters?: PeopleFilters) => {
    try {
      setLoading(true);
      setError(null);

      const result = await peopleService.getAllPeople(filters);

      if (result.success) {
        setPeople(result.data);
      } else {
        setError(result.error.message);
        setPeople([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const searchPeople = useCallback(
    async (query: string, filters?: Omit<PeopleFilters, "search">) => {
      return fetchPeople({ ...filters, search: query });
    },
    [fetchPeople]
  );

  return {
    people,
    loading,
    error,
    refetch: fetchPeople,
    searchPeople,
  };
}

// Bookings hook with service layer integration
export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await bookingService.getUserBookings(userId);

      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.error.message);
        setBookings([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId, fetchBookings]);

  const createBooking = useCallback(
    async (bookingData: {
      person_id: string;
      session_notes?: string;
      hourly_rate: number;
      currency: "WLD" | "USDC";
      total_amount: number;
    }) => {
      if (!userId) {
        const error = new Error("No user found");
        return { data: null, error };
      }

      try {
        const result = await bookingService.createBooking({
          ...bookingData,
          client_id: userId,
        });

        if (result.success) {
          await fetchBookings(); // Refresh bookings
          return { data: result.data, error: null };
        } else {
          return { data: null, error: result.error };
        }
      } catch (err) {
        return { data: null, error: err };
      }
    },
    [userId, fetchBookings]
  );

  const updateBookingStatus = useCallback(
    async (
      bookingId: string,
      status: "pending" | "confirmed" | "completed" | "cancelled"
    ) => {
      if (!userId) {
        const error = new Error("No user found");
        return { data: null, error };
      }

      try {
        const result = await bookingService.updateBookingStatus(
          bookingId,
          status,
          userId
        );

        if (result.success) {
          await fetchBookings(); // Refresh bookings
          return { data: result.data, error: null };
        } else {
          return { data: null, error: result.error };
        }
      } catch (err) {
        return { data: null, error: err };
      }
    },
    [userId, fetchBookings]
  );

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings,
  };
}
