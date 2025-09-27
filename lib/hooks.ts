"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/database";
import { profileService, peopleService } from "@/lib/services";
import type {
  Profile,
  PersonWithProfile,
  PeopleFilters,
  Booking,
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

    getInitialSession().catch((err) => {
      if (mounted) {
        setError("Failed to get initial session");
        console.error("Initial session error:", err);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    fetchPeople().catch((err) => {
      console.error("Error fetching people:", err);
    });
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

// Bookings hook for managing user bookings
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically call a booking service
      // For now, we'll return an empty array
      setBookings([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings().catch((err) => {
      console.error("Error fetching bookings:", err);
    });
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}


