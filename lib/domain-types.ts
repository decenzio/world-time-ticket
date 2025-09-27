// Domain types and interfaces
import type { Database } from "./types";

// Base types from database
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Person = Database["public"]["Tables"]["people"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

// Composed types for UI components
export interface PersonWithProfile extends Person {
  profiles: Profile;
}

export interface BookingWithDetails extends Booking {
  person?: PersonWithProfile;
  profiles?: Profile;
}

export interface ReviewWithProfile extends Review {
  profiles: Profile;
}

// Review type for backward compatibility
export type ReviewType = Review;

// Input types for creating entities
export interface CreatePersonInput {
  user_id: string;
  hourly_rate: number;
  currency?: "WLD" | "USDC";
  calendly_url?: string;
  skills?: string[];
  availability_status?: string;
}

export interface CreateBookingInput {
  client_id: string;
  person_id: string;
  session_notes?: string;
  hourly_rate: number;
  currency: "WLD" | "USDC";
  total_amount: number;
  scheduled_date?: string;
  calendly_event_id?: string;
}

export interface CreateReviewInput {
  booking_id: string;
  client_id: string;
  person_id: string;
  rating: number;
  comment?: string;
  tags?: string[];
}

// Filter types
export interface PeopleFilters {
  search?: string;
  priceRange?: "all" | "under-100" | "100-200" | "over-200";
  isActive?: boolean;
}

export interface BookingFilters {
  status?: Booking["status"];
  personId?: string;
  clientId?: string;
}