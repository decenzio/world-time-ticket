// Service layer implementing business logic with clean architecture
import * as repositories from "./repositories";
import {
  AppError,
  ValidationError,
  NotFoundError,
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

// Profile service
export class ProfileService {
  async getProfile(userId: string): Promise<Result<Profile | null>> {
    return repositories.findProfileById(userId);
  }

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Result<Profile>> {
    // Basic validation
    if (!userId) {
      return {
        success: false,
        error: new ValidationError("User ID is required"),
      };
    }

    return repositories.updateProfile(userId, updates);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// People service
export class PeopleService {
  async getAllPeople(
    filters: PeopleFilters = {}
  ): Promise<Result<PersonWithProfile[]>> {
    // Set default filter for active people
    const defaultFilters = { isActive: true, ...filters };
    return repositories.findAllPeople(defaultFilters);
  }

  async getPersonById(personId: string): Promise<Result<PersonWithProfile>> {
    const result = await repositories.findPersonById(personId);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: new NotFoundError("Person", personId),
      };
    }

    return { success: true, data: result.data };
  }

  async createPerson(input: CreatePersonInput): Promise<Result<Person>> {
    // Business validation
    if (input.hourly_rate < 1) {
      return {
        success: false,
        error: new ValidationError(
          "Hourly rate must be at least $1",
          "hourly_rate"
        ),
      };
    }

    if (input.hourly_rate > 10000) {
      return {
        success: false,
        error: new ValidationError(
          "Hourly rate cannot exceed $10,000",
          "hourly_rate"
        ),
      };
    }

    return repositories.createPerson(input);
  }

  async updatePerson(
    personId: string,
    updates: Partial<Person>
  ): Promise<Result<Person>> {
    // Business validation for updates
    if (updates.hourly_rate !== undefined) {
      if (updates.hourly_rate < 1 || updates.hourly_rate > 10000) {
        return {
          success: false,
          error: new ValidationError(
            "Hourly rate must be between $1 and $10,000",
            "hourly_rate"
          ),
        };
      }
    }

    return repositories.updatePerson(personId, updates);
  }

  async searchPeople(
    query: string,
    filters: Omit<PeopleFilters, "search"> = {}
  ): Promise<Result<PersonWithProfile[]>> {
    const searchFilters = { ...filters, search: query.trim() };
    return this.getAllPeople(searchFilters);
  }

  async getPersonByUserId(userId: string): Promise<Result<PersonWithProfile>> {
    const result = await repositories.findPersonByUserId(userId);

    if (!result.success) return (result as unknown) as Result<PersonWithProfile>;

    if (!result.data) {
      return {
        success: false,
        error: new NotFoundError("Person for user", userId),
      } as unknown as Result<PersonWithProfile>;
    }

    return ({ success: true, data: result.data } as unknown) as Result<PersonWithProfile>;
  }
}

// Booking service
export class BookingService {
  async getUserBookings(
    userId: string,
    filters: BookingFilters = {}
  ): Promise<Result<BookingWithDetails[]>> {
    return repositories.findBookingsByUserId(userId, filters);
  }

  async getPersonBookings(
    personId: string,
    filters: BookingFilters = {}
  ): Promise<Result<BookingWithDetails[]>> {
    return repositories.findBookingsByPersonId(personId, filters);
  }

  async createBooking(input: CreateBookingInput): Promise<Result<Booking>> {
    // Business logic: validate booking constraints
    const validationResult = await this.validateBookingInput(input);
    if (!validationResult.success) {
      return validationResult;
    }

    return repositories.createBooking(input);
  }

  async updateBookingStatus(
    bookingId: string,
    status: Booking["status"],
    userId: string
  ): Promise<Result<Booking>> {
    // Business logic: validate status transitions and permissions
    const validationResult = await this.validateStatusUpdate(
      bookingId,
      status,
      userId
    );
    if (!validationResult.success) {
      return validationResult;
    }

    return repositories.updateBookingStatus(bookingId, status);
  }

  async getBookingById(id: string): Promise<Result<BookingWithDetails | null>> {
    return repositories.findBookingById(id);
  }

  private async validateBookingInput(
    input: CreateBookingInput
  ): Promise<Result<void>> {
    return asyncResult(async () => {
      // Check if person exists and is active
      const personResult = await repositories.findPersonById(input.person_id);
      if (!personResult.success) {
        throw personResult.error;
      }

      if (!personResult.data) {
        throw new NotFoundError("Person", input.person_id);
      }

      if (!personResult.data.is_active) {
        throw new ValidationError("Cannot book inactive person");
      }

      // Validate rate matches person's current rate
      if (Math.abs(input.hourly_rate - personResult.data.hourly_rate) > 0.01) {
        throw new ValidationError(
          "Hourly rate does not match person's current rate"
        );
      }

      // Validate total amount calculation
      const expectedTotal = input.hourly_rate * 1; // Assuming 1 hour sessions
      if (Math.abs(input.total_amount - expectedTotal) > 0.01) {
        throw new ValidationError("Total amount calculation is incorrect");
      }
    });
  }

  private async validateStatusUpdate(
    bookingId: string,
    newStatus: Booking["status"],
    userId: string
  ): Promise<Result<void>> {
    return asyncResult(async () => {
      // In a real app, you'd check if user has permission to update this booking
      // and validate status transitions (e.g., can't go from completed to pending)

      const validTransitions: Record<Booking["status"], Booking["status"][]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
        completed: [], // Final state
        cancelled: [], // Final state
      };

      // This is a simplified validation - in reality you'd fetch the current booking
      // and check actual permissions and current status
      if (newStatus === "completed" && !userId) {
        throw new ValidationError(
          "User must be authenticated to complete booking"
        );
      }
    });
  }
}

// Review service
export class ReviewService {
  async getPersonReviews(
    personId: string
  ): Promise<Result<ReviewWithProfile[]>> {
    return repositories.findReviewsByPersonId(personId);
  }

  async createReview(input: CreateReviewInput): Promise<Result<Review>> {
    // Business logic: validate review constraints
    const validationResult = await this.validateReviewInput(input);
    if (!validationResult.success) {
      return validationResult;
    }

    return repositories.createReview(input);
  }

  async calculatePersonStats(personId: string): Promise<
    Result<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    }>
  > {
    return asyncResult(async () => {
      const reviewsResult = await this.getPersonReviews(personId);
      if (!reviewsResult.success) {
        throw reviewsResult.error;
      }

      const reviews = reviewsResult.data;
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

      const ratingDistribution = reviews.reduce((dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      }, {} as Record<number, number>);

      // Ensure all ratings 1-5 are represented
      for (let i = 1; i <= 5; i++) {
        if (!ratingDistribution[i]) {
          ratingDistribution[i] = 0;
        }
      }

      return {
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        totalReviews,
        ratingDistribution,
      };
    });
  }

  private async validateReviewInput(
    input: CreateReviewInput
  ): Promise<Result<void>> {
    return asyncResult(async () => {
      // Check if booking exists and belongs to the client
      const bookingResult = await repositories.findBookingsByUserId(
        input.client_id
      );
      if (!bookingResult.success) {
        throw bookingResult.error;
      }

      const booking = bookingResult.data.find(
        (b: any) => b.id === input.booking_id
      );
      if (!booking) {
        throw new NotFoundError("Booking", input.booking_id);
      }

      if (booking.status !== "completed") {
        throw new ValidationError("Can only review completed bookings");
      }

      if (booking.person_id !== input.person_id) {
        throw new ValidationError("Person ID does not match booking");
      }

      // Check if review already exists for this booking
      // This would require additional repository method in real implementation
    });
  }
}

// Service instances (Dependency Injection ready)
export const profileService = new ProfileService();
export const peopleService = new PeopleService();
export const bookingService = new BookingService();
export const reviewService = new ReviewService();
