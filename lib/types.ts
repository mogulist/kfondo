export type Event = {
  id: string;
  location: string;
  name?: string;
  years: number[];
  color: {
    from: string;
    to: string;
  };
  status: "ready" | "upcoming" | "completed";
  meta: {
    title: string;
    description: string;
    image: string;
  };
  comment?: string;
  // 연도별 상세 정보
  yearDetails: Record<number, EventYearDetail>;
  dataSource?: "Marazone" | "SPTC" | "스마트칩" | "my.raceresult.com";
};

export type GranMedio = {
  [key: string]: number;
};

export type EventYear = {
  year: number;
  registered: GranMedio;
  participants: GranMedio;
  dnf: GranMedio;
};

export type TimeDistribution = {
  timeRange: string;
  participants: number;
  percentile: number;
  cumulativeCount?: number;
};

export type EventYearStats = {
  year: number;
  granFondoDistribution: TimeDistribution[];
  medioFondoDistribution: TimeDistribution[];
  comment?: string;
};

export type EventYearStatsWithCourses = {
  year: number;
  distributions: {
    courseId: string;
    courseName: string;
    distribution: TimeDistribution[];
  }[];
  comment?: string;
};

export type RaceRecord = {
  bibNo: string;
  gender: string;
  event: string;
  time: string;
  status: string;
  timeInSeconds?: number;
};

// 대회 종목 타입
export type RaceCategory = {
  id: string; // 종목 고유 ID (예: "granfondo", "mediofondo", "kom")
  name: string; // 종목 이름 (예: "그란폰도", "메디오폰도", "KOM")
  distance: number; // 거리
  elevation?: number; // 고도
  registered?: number; // 등록자 수
  comment?: string;
};

// 연도별 대회 정보
export type EventYearDetail = {
  year: number;
  date: string;
  status?: "completed" | "upcoming" | "preparing";
  courses: RaceCategory[];
  totalRegistered: number;
  url?: string;
  recordsBlobUrl?: string; // Phase 3: Vercel Blob URL (원본 기록)
  sortedRecordsBlobUrl?: string; // Phase 3: Vercel Blob URL (정렬된 기록)
};
