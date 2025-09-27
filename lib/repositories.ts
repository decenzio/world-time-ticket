// Simplified repository layer - hackathon ready! 🚀
// Using 'any' types to bypass complex Supabase typing issues for speed

import { getSupabase } from "./database";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  asyncResult,
  type Result,
} from "./errors";
import type {
  Profile,
  Person,
  Booking,
  Review,
  PersonWithProfile,
  BookingWithDetails,
  ReviewWithProfile,
  CreatePersonInput,
  CreateBookingInput,
  CreateReviewInput,
  PeopleFilters,
  BookingFilters,
} from "./domain-types";

// Profile operations
export const findProfileById = async (
  id: string
): Promise<Result<Profile | null>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    const { data, error } = await (client as any)
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Fetch profile failed: ${error.message}`);
    }
    return data;
  });
};

export const updateProfile = async (
  id: string,
  updates: Partial<Profile>
): Promise<Result<Profile>> => {
  return asyncResult(async () => {
    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Update profile failed: ${error.message}`);
    }
    return data;
  });
};

// People operations
export const findAllPeople = async (
  filters: PeopleFilters = {}
): Promise<Result<PersonWithProfile[]>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    let query = (client as any).from("people").select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          bio
        )
      `);

    // Apply filters
    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }

    if (filters.priceRange && filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under-100":
          query = query.lt("hourly_rate", 100);
          break;
        case "100-200":
          query = query.gte("hourly_rate", 100).lte("hourly_rate", 200);
          break;
        case "over-200":
          query = query.gt("hourly_rate", 200);
          break;
      }
    }

    const { data, error } = await query.order("average_rating", {
      ascending: false,
    });

    if (error) {
      throw new DatabaseError(`Fetch people failed: ${error.message}`);
    }

    // Client-side search filtering
    let filteredData = data || [];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (person: any) =>
          person.profiles?.full_name?.toLowerCase().includes(searchLower) ||
          person.profiles?.bio?.toLowerCase().includes(searchLower) ||
          person.skills?.some((skill: string) =>
            skill.toLowerCase().includes(searchLower)
          )
      );
    }

    return filteredData as PersonWithProfile[];
  });
};

export const findPersonById = async (
  id: string
): Promise<Result<PersonWithProfile | null>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    const { data, error } = await (client as any)
      .from("people")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          bio
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Fetch person failed: ${error.message}`);
    }
    return data as PersonWithProfile | null;
  });
};

export const createPerson = async (
  input: CreatePersonInput
): Promise<Result<Person>> => {
  return asyncResult(async () => {
    // Validate required fields
    if (!input.user_id) {
      throw new ValidationError("User ID is required", "user_id");
    }
    if (!input.hourly_rate || input.hourly_rate <= 0) {
      throw new ValidationError("Valid hourly rate is required", "hourly_rate");
    }

    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("people")
      .insert([input])
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Create person failed: ${error.message}`);
    }
    return data;
  });
};

export const updatePerson = async (
  id: string,
  updates: Partial<Person>
): Promise<Result<Person>> => {
  return asyncResult(async () => {
    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("people")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Update person failed: ${error.message}`);
    }
    return data;
  });
};

// Booking operations
export const findBookingsByUserId = async (
  userId: string,
  filters: BookingFilters = {}
): Promise<Result<BookingWithDetails[]>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    let query = (client as any)
      .from("bookings")
      .select(
        `
        *,
        person:person_id (
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("client_id", userId);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new DatabaseError(`Fetch user bookings failed: ${error.message}`);
    }
    return data as BookingWithDetails[];
  });
};

export const findBookingsByPersonId = async (
  personId: string,
  filters: BookingFilters = {}
): Promise<Result<BookingWithDetails[]>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    let query = (client as any)
      .from("bookings")
      .select(
        `
        *,
        profiles:client_id (
          full_name,
          avatar_url
        )
      `
      )
      .eq("person_id", personId);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new DatabaseError(`Fetch person bookings failed: ${error.message}`);
    }
    return data as BookingWithDetails[];
  });
};

export const createBooking = async (
  input: CreateBookingInput
): Promise<Result<Booking>> => {
  return asyncResult(async () => {
    // Validate required fields
    if (!input.client_id || !input.person_id) {
      throw new ValidationError("Client ID and Person ID are required");
    }
    if (!input.hourly_rate || input.hourly_rate <= 0) {
      throw new ValidationError("Valid hourly rate is required", "hourly_rate");
    }
    if (!input.total_amount || input.total_amount <= 0) {
      throw new ValidationError(
        "Valid total amount is required",
        "total_amount"
      );
    }

    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("bookings")
      .insert([input])
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Create booking failed: ${error.message}`);
    }
    return data;
  });
};

export const updateBookingStatus = async (
  id: string,
  status: Booking["status"]
): Promise<Result<Booking>> => {
  return asyncResult(async () => {
    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Update booking status failed: ${error.message}`);
    }
    return data;
  });
};

// Review operations
export const findReviewsByPersonId = async (
  personId: string
): Promise<Result<ReviewWithProfile[]>> => {
  return asyncResult(async () => {
    const client = getSupabase();
    const { data, error } = await (client as any)
      .from("reviews")
      .select(
        `
        *,
        profiles:client_id (
          full_name,
          avatar_url
        )
      `
      )
      .eq("person_id", personId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(`Fetch person reviews failed: ${error.message}`);
    }
    return data as ReviewWithProfile[];
  });
};

export const createReview = async (
  input: CreateReviewInput
): Promise<Result<Review>> => {
  return asyncResult(async () => {
    // Validate required fields
    if (!input.booking_id || !input.client_id || !input.person_id) {
      throw new ValidationError(
        "Booking ID, Client ID, and Person ID are required"
      );
    }
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5", "rating");
    }

    const client = getSupabase({ admin: true });
    const { data, error } = await (client as any)
      .from("reviews")
      .insert([input])
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Create review failed: ${error.message}`);
    }
    return data;
  });
};
