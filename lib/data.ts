import type {
  Event,
  EventYearStats,
  EventYear,
  EventYearInitial,
} from "./types";
import {
  parseCSV,
  generateTimeDistributionFromRecords,
  type RaceRecord,
} from "./csv-parser";

// 그란폰도 이벤트 목록
export const events: Event[] = [
  {
    id: "hongcheon",
    location: "홍천",
    years: [2022, 2023, 2024, 2025],
    color: {
      from: "#f43f5e", // 선명한 핑크
      to: "#e11d48", // 진한 핑크
    },
    latestEvent: {
      date: "2025.4.19",
      granFondo: {
        distance: 122,
        elevation: 1594,
      },
      medioFondo: {
        distance: 79,
        elevation: 1144,
      },
    },
    status: "ready",
    meta: {
      title: "홍천 그란폰도 | FondoScope",
      description:
        "홍천 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2022년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/hongcheon-og.jpg", // 홍천 그란폰도 대표 이미지
    },
  },
  {
    id: "yangyang",
    location: "양양",
    years: [2024, 2025],
    color: {
      from: "#0ea5e9",
      to: "#0369a1",
    },
    latestEvent: {
      date: "2025.4.26",
      granFondo: {
        distance: 151,
        elevation: 2380,
      },
      medioFondo: {
        distance: 68,
        elevation: 630,
      },
    },
    status: "ready",
    meta: {
      title: "양양 그란폰도 | FondoScope",
      description:
        "양양 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2024년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/yangyang-og.jpg", // 양양 그란폰도 대표 이미지
    },
  },
  {
    id: "yeongsan",
    location: "영산강",
    years: [2023, 2024, 2025],
    color: {
      from: "#0ea5e9",
      to: "#0369a1",
    },
    latestEvent: {
      date: "2025.4.26",
      granFondo: {
        distance: 121,
        elevation: 1000,
      },
      medioFondo: {
        distance: 104,
        elevation: 757,
      },
    },
    meta: {
      title: "영산 그란폰도 | FondoScope",
      description:
        "영산 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2023년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/yeongsan-og.jpg", // 영산 그란폰도 대표 이미지
    },
  },
  {
    id: "samcheok",
    location: "삼척",
    years: [2020, 2021, 2022, 2023, 2024],
    color: {
      from: "#10b981",
      to: "#047857",
    },
    latestEvent: {
      date: "2024",
      granFondo: {
        distance: 128,
        elevation: 1668,
      },
      medioFondo: {
        distance: 102,
        elevation: 1201,
      },
    },
    meta: {
      title: "삼척 그란폰도 | FondoScope",
      description:
        "삼척 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2020년부터 2024년까지의 데이터를 제공합니다.",
      image: "/images/samcheok-og.jpg", // 삼척 그란폰도 대표 이미지
    },
  },
  {
    id: "seorak",
    location: "설악",
    years: [2020, 2021, 2022, 2023, 2024],
    color: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    latestEvent: {
      date: "2024.5.18",
      granFondo: {
        distance: 208,
        elevation: 3800,
      },
      medioFondo: {
        distance: 105,
        elevation: 1700,
      },
    },
    meta: {
      title: "설악 그란폰도 | FondoScope",
      description:
        "설악 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2020년부터 2024년까지의 데이터를 제공합니다.",
      image: "/images/seorak-og.jpg", // 설악 그란폰도 대표 이미지
    },
  },
];

// CSV 데이터 캐시
const csvDataCache: Record<string, RaceRecord[]> = {};

// CSV 파일에서 데이터 로드
async function loadCSVData(
  eventId: string,
  year: number
): Promise<RaceRecord[]> {
  const cacheKey = `${eventId}_${year}`;

  // 캐시에 데이터가 있으면 반환
  if (csvDataCache[cacheKey]) {
    return csvDataCache[cacheKey];
  }

  try {
    const response = await fetch(`/data/${eventId}_${year}.csv`);
    if (!response.ok) {
      console.error(
        `Failed to load CSV data for ${eventId} ${year}: ${response.statusText}`
      );
      return [];
    }

    const csvText = await response.text();
    const records = await parseCSV(csvText);

    // 캐시에 저장
    csvDataCache[cacheKey] = records;

    return records;
  } catch (error) {
    console.error(`Error loading CSV data for ${eventId} ${year}:`, error);
    return [];
  }
}

// 연도별 참가자 데이터 생성 함수
export function getEventData(eventId: string): EventYear[] {
  const event = events.find((e) => e.id === eventId);
  if (!event) return [];

  return event.years.map((year) => {
    const yearlyData = realDataMap[eventId].find((d) => d.year === year);

    if (!yearlyData) {
      return {
        year,
        registered: {
          granfondo: 0,
          mediofondo: 0,
        },
        participants: {
          granfondo: 0,
          mediofondo: 0,
        },
        dnf: {
          granfondo: 0,
          mediofondo: 0,
        },
      };
    }

    return yearlyData;
  });
}

// 시간 분포 데이터 생성 함수 (가상 데이터용)
function generateTimeDistribution(
  minHours: number,
  maxHours: number,
  intervalMinutes: number
) {
  const distribution = [];
  const totalParticipants = 500 + Math.floor(Math.random() * 300);

  // 정규 분포와 유사하게 참가자 분포 생성
  const intervals = Math.ceil(((maxHours - minHours) * 60) / intervalMinutes);
  const midPoint = intervals / 2;

  // 실제 데이터 범위 (정규 분포의 중심을 기준으로)
  const actualMinHours = minHours + 0.25; // 실제 데이터는 최소 시간보다 15분 뒤에 시작
  const actualMaxHours = maxHours - 0.25; // 실제 데이터는 최대 시간보다 15분 전에 끝남

  let cumulativeParticipants = 0;

  for (let i = 0; i < intervals; i++) {
    const startMinutes = minHours * 60 + i * intervalMinutes;
    const endMinutes = startMinutes + intervalMinutes;

    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const timeRange = `${startHour}:${startMin
      .toString()
      .padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`;

    // 정규 분포 계산 (더 부드러운 곡선을 위해 표준편차 조정)
    const currentHour = startMinutes / 60;

    // 실제 데이터 범위 밖의 시간대는 참가자 수를 0 또는 매우 적게 설정
    let participants = 0;

    if (currentHour >= actualMinHours && currentHour <= actualMaxHours) {
      const normalizedPosition = (i - midPoint) / (midPoint / 2.5);
      const normalValue = Math.exp(-0.5 * Math.pow(normalizedPosition, 2));
      participants = Math.round(totalParticipants * normalValue * 0.25);

      // 최소 참가자 수 보장 (그래프가 0으로 떨어지지 않도록)
      participants = Math.max(participants, 3);
    } else {
      // 실제 데이터 범위 밖의 시간대는 매우 적은 참가자 수 (0~2명)
      participants = Math.floor(Math.random() * 3);
    }

    cumulativeParticipants += participants;

    // 상위 몇 % 인지 계산
    const percentile = Math.round(
      100 - (cumulativeParticipants / totalParticipants) * 100
    );

    distribution.push({
      timeRange,
      participants,
      percentile: Math.max(percentile, 0), // 음수 백분위 방지
    });
  }

  return distribution;
}

// 특정 연도의 기록 분포 데이터 생성 함수
export async function getEventYearStats(
  eventId: string,
  year?: number
): Promise<EventYearStats | null> {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;

  // 연도가 지정되지 않은 경우 가장 최근 연도 사용
  const targetYear = year || Math.max(...event.years);

  if (!event.years.includes(targetYear)) return null;

  // CSV 파일에서 데이터 로드 시도
  try {
    const records = await loadCSVData(eventId, targetYear);

    if (records.length > 0) {
      // CSV 데이터가 있으면 실제 데이터로 분포 생성
      const granFondoDistribution = generateTimeDistributionFromRecords(
        records,
        "그란폰도",
        5
      ); // 5분 간격으로 변경
      const medioFondoDistribution = generateTimeDistributionFromRecords(
        records,
        "메디오폰도",
        5
      ); // 5분 간격으로 변경

      return {
        year: targetYear,
        granFondoDistribution,
        medioFondoDistribution,
      };
    }
  } catch (error) {
    console.error(
      `Error generating stats from CSV for ${eventId} ${targetYear}:`,
      error
    );
  }

  // 데이터가 없거나 오류 발생 시 null 반환
  return null;
}

// 모든 연도의 통계 데이터를 가져오는 함수
export async function getAllEventYearStats(
  eventId: string
): Promise<EventYearStats[]> {
  const event = events.find((e) => e.id === eventId);
  if (!event) return [];

  const statsPromises = event.years.map((year) =>
    getEventYearStats(eventId, year)
  );
  const stats = await Promise.all(statsPromises);

  // null이 아닌 데이터만 필터링하고 연도순으로 정렬
  return stats
    .filter((stat): stat is EventYearStats => stat !== null)
    .sort((a, b) => b.year - a.year); // 최신 연도순으로 정렬
}

// 홍천 그란폰도 실제 데이터
const hongcheonBase: EventYear[] = [
  {
    year: 2025,
    registered: {
      granfondo: 1876,
      mediofondo: 1204,
    },
    participants: {
      granfondo: 1202,
      mediofondo: 1051,
    },
    dnf: {
      granfondo: 82,
      mediofondo: 27,
    },
  },
  {
    year: 2024,
    registered: {
      granfondo: 1986,
      mediofondo: 1178,
    },
    participants: {
      granfondo: 1607,
      mediofondo: 1026,
    },
    dnf: {
      granfondo: 67,
      mediofondo: 38,
    },
  },
  {
    year: 2023,
    registered: {
      granfondo: 2580,
      mediofondo: 1350,
    },
    participants: {
      granfondo: 2230,
      mediofondo: 1204,
    },
    dnf: {
      granfondo: 144,
      mediofondo: 38,
    },
  },
  {
    year: 2022,
    registered: {
      granfondo: 3228,
      mediofondo: 772,
    },
    participants: {
      granfondo: 730,
      mediofondo: 161,
    },
    dnf: {
      granfondo: 113,
      mediofondo: 23,
    },
  },
];

// 양양 그란폰도 실제 데이터
const yangyangBase: EventYear[] = [
  {
    year: 2025,
    registered: {
      granfondo: 1241,
      mediofondo: 809,
    },
    participants: {
      granfondo: 1011,
      mediofondo: 672,
    },
    dnf: {
      granfondo: 190,
      mediofondo: 76,
    },
  },
  {
    year: 2024,
    registered: {
      granfondo: 1200,
      mediofondo: 700,
    },
    participants: {
      granfondo: 975,
      mediofondo: 576,
    },
    dnf: {
      granfondo: 172,
      mediofondo: 143,
    },
  },
];

const yeongsanBase: EventYearInitial[] = [
  {
    year: 2025,
    registered: {
      granfondo: 1241,
      mediofondo: 809,
    },
  },
  {
    year: 2024,
    registered: {
      granfondo: 1200,
      mediofondo: 700,
    },
  },
];

export const realDataMap: Record<string, EventYear[]> = {
  hongcheon: hongcheonBase,
  yangyang: yangyangBase,
  // yeongsan: yeongsanBase,
  // 추후 이벤트 추가 시 여기에만 추가
};
