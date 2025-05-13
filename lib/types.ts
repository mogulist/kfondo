export type Event = {
  id: string;
  location: string;
  years: number[];
  color?: {
    from: string;
    to: string;
  };
  latestEvent?: {
    date: string;
    granFondo: {
      distance: number;
      elevation: number;
    };
    medioFondo: {
      distance: number;
      elevation: number;
    };
  };
  status?: "ready";
  meta: {
    title: string;
    description: string;
    image: string;
  };
  registered: {
    [year: number]: GranMedio;
  };
};

export type EventYearData = {
  year: number;
  granFondoRegistered: number;
  granFondoParticipants: number;
  medioFondoRegistered: number;
  medioFondoParticipants: number;
  granFondoDNF?: number;
  medioFondoDNF?: number;
};

export type GranMedio = {
  granfondo: number;
  mediofondo: number;
};

export type EventYearInitial = {
  year: number;
  registered: GranMedio;
  participants?: GranMedio;
  dnf?: GranMedio;
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
};

export type EventYearStats = {
  year: number;
  granFondoDistribution: TimeDistribution[];
  medioFondoDistribution: TimeDistribution[];
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
  elevation: number; // 고도
  registered?: number; // 등록자 수
};

// 연도별 대회 정보
export type EventYearDetail = {
  year: number;
  date: string;
  categories: RaceCategory[];
  totalRegistered: number;
};

// 대회 기본 정보 (새로운 구조)
export type EventV2 = {
  id: string;
  location: string;
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
  // 연도별 상세 정보
  yearDetails: Record<number, EventYearDetail>;
};
