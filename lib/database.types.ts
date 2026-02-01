export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          location: string;
          color_from: string;
          color_to: string;
          meta_title: string;
          meta_description: string;
          meta_image: string;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          location: string;
          color_from: string;
          color_to: string;
          meta_title: string;
          meta_description: string;
          meta_image: string;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          location?: string;
          color_from?: string;
          color_to?: string;
          meta_title?: string;
          meta_description?: string;
          meta_image?: string;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_editions: {
        Row: {
          id: string;
          event_id: string;
          year: number;
          date: string;
          status: "upcoming" | "completed" | "ready" | "preparing";
          url: string | null;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          year: number;
          date: string;
          status?: "upcoming" | "completed" | "ready" | "preparing";
          url?: string | null;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          year?: number;
          date?: string;
          status?: "upcoming" | "completed" | "ready" | "preparing";
          url?: string | null;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          edition_id: string;
          course_type: string;
          name: string;
          distance: number;
          elevation: number;
          registered_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          course_type: string;
          name: string;
          distance: number;
          elevation: number;
          registered_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          course_type?: string;
          name?: string;
          distance?: number;
          elevation?: number;
          registered_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      records: {
        Row: {
          id: string;
          event_edition_id: string;
          course_id: string | null;
          bib_no: string;
          gender: string | null;
          record_time: string | null;
          rank: number | null;
          status: string;
          start_time: string | null;
          finish_time: string | null;
          extra_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_edition_id: string;
          course_id?: string | null;
          bib_no: string;
          gender?: string | null;
          record_time?: string | null;
          rank?: number | null;
          status?: string;
          start_time?: string | null;
          finish_time?: string | null;
          extra_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_edition_id?: string;
          course_id?: string | null;
          bib_no?: string;
          gender?: string | null;
          record_time?: string | null;
          rank?: number | null;
          status?: string;
          start_time?: string | null;
          finish_time?: string | null;
          extra_data?: Json;
          created_at?: string;
        };
      };
    };
  };
};

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventEditionRow = Database["public"]["Tables"]["event_editions"]["Row"];
export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type RecordRow = Database["public"]["Tables"]["records"]["Row"];

