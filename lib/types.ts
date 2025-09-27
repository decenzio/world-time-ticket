// Simplified Database types for Hackathon (Kids gotta eat! 🍕)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          world_id_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          world_id_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          world_id_verified?: boolean;
          created_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          user_id: string;
          is_active: boolean;
          hourly_rate: number;
          currency: "WLD" | "USDC";
          calendly_url: string | null;
          skills: string[];
          availability_status: string;
          average_rating: number;
          total_reviews: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_active?: boolean;
          hourly_rate: number;
          currency?: "WLD" | "USDC";
          calendly_url?: string | null;
          skills?: string[];
          availability_status?: string;
          average_rating?: number;
          total_reviews?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_active?: boolean;
          hourly_rate?: number;
          currency?: "WLD" | "USDC";
          calendly_url?: string | null;
          skills?: string[];
          availability_status?: string;
          average_rating?: number;
          total_reviews?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          person_id: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          session_notes: string | null;
          scheduled_date: string | null;
          hourly_rate: number;
          currency: "WLD" | "USDC";
          total_amount: number;
          calendly_event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          person_id: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          session_notes?: string | null;
          scheduled_date?: string | null;
          hourly_rate: number;
          currency: "WLD" | "USDC";
          total_amount: number;
          calendly_event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          person_id?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          session_notes?: string | null;
          scheduled_date?: string | null;
          hourly_rate?: number;
          currency?: "WLD" | "USDC";
          total_amount?: number;
          calendly_event_id?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          client_id: string;
          person_id: string;
          rating: number;
          comment: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          client_id: string;
          person_id: string;
          rating: number;
          comment?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          client_id?: string;
          person_id?: string;
          rating?: number;
          comment?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status: "pending" | "confirmed" | "completed" | "cancelled";
      currency_type: "WLD" | "USDC";
    };
  };
}

// Simplified utility types
export type Person = Database["public"]["Tables"]["people"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

export type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  person?: Person;
  profiles?: Database["public"]["Tables"]["profiles"]["Row"];
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
