// Supabase Database 타입 정의
// Phase 1: events 테이블만 포함

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          location: string;
          name: string | null;
          years: number[];
          color_from: string;
          color_to: string;
          status: "ready" | "upcoming" | "completed";
          meta_title: string;
          meta_description: string;
          meta_image: string;
          comment: string | null;
          data_source: string | null;
          year_details: Record<number, EventYearDetailDB>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          location: string;
          name?: string | null;
          years: number[];
          color_from: string;
          color_to: string;
          status?: "ready" | "upcoming" | "completed";
          meta_title: string;
          meta_description: string;
          meta_image: string;
          comment?: string | null;
          data_source?: string | null;
          year_details: Record<number, EventYearDetailDB>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location?: string;
          name?: string | null;
          years?: number[];
          color_from?: string;
          color_to?: string;
          status?: "ready" | "upcoming" | "completed";
          meta_title?: string;
          meta_description?: string;
          meta_image?: string;
          comment?: string | null;
          data_source?: string | null;
          year_details?: Record<number, EventYearDetailDB>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// yearDetails를 JSONB로 저장하기 위한 타입
export type EventYearDetailDB = {
  year: number;
  date: string;
  status?: "completed" | "upcoming" | "preparing";
  courses: {
    id: string;
    name: string;
    distance: number;
    elevation?: number;
    registered?: number;
    comment?: string;
  }[];
  totalRegistered: number;
  url?: string;
};

// DB Row를 기존 Event 타입으로 변환하는 헬퍼 타입
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
