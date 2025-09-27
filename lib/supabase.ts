// Legacy Supabase client - Use services instead for new code
// This file is kept for backward compatibility with existing components

import { supabase } from "./database";
import { peopleService, bookingService, reviewService } from "./services";

// Re-export the supabase client for direct access if needed
export { supabase };

// Legacy wrapper functions - these delegate to the new service layer
export const getActivePeople = async () => {
  const result = await peopleService.getAllPeople();
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const getPersonById = async (personId: string) => {
  const result = await peopleService.getPersonById(personId);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const getPersonReviews = async (personId: string) => {
  const result = await reviewService.getPersonReviews(personId);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const createBooking = async (bookingData: {
  client_id: string;
  person_id: string;
  session_notes?: string;
  hourly_rate: number;
  currency: "WLD" | "USDC";
  total_amount: number;
}) => {
  const result = await bookingService.createBooking(bookingData);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const getUserBookings = async (userId: string) => {
  const result = await bookingService.getUserBookings(userId);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const getPersonBookings = async (personId: string) => {
  const result = await bookingService.getPersonBookings(personId);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const createReview = async (reviewData: {
  booking_id: string;
  client_id: string;
  person_id: string;
  rating: number;
  comment?: string;
  tags?: string[];
}) => {
  const result = await reviewService.createReview(reviewData);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled",
  userId: string = ""
) => {
  const result = await bookingService.updateBookingStatus(
    bookingId,
    status,
    userId
  );
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};

export const searchPeople = async (query: string, priceRange?: string) => {
  const filters = priceRange ? { priceRange: priceRange as any } : {};
  const result = await peopleService.searchPeople(query, filters);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
};
