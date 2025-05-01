import type { Event, EventYear, EventYearInitial } from "./types";

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
    registered: {
      2025: {
        granfondo: 1876,
        mediofondo: 1204,
      },
      2024: {
        granfondo: 1986,
        mediofondo: 1178,
      },
      2023: {
        granfondo: 2580,
        mediofondo: 1350,
      },
      2022: {
        granfondo: 3228,
        mediofondo: 772,
      },
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
    registered: {
      2025: {
        granfondo: 1241,
        mediofondo: 809,
      },
      2024: {
        granfondo: 1200,
        mediofondo: 700,
      },
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
    registered: {
      2025: {
        granfondo: 1241,
        mediofondo: 809,
      },
      2024: {
        granfondo: 1200,
        mediofondo: 700,
      },
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
    registered: {
      2024: {
        granfondo: 0,
        mediofondo: 0,
      },
      2023: {
        granfondo: 0,
        mediofondo: 0,
      },
      2022: {
        granfondo: 0,
        mediofondo: 0,
      },
      2021: {
        granfondo: 0,
        mediofondo: 0,
      },
      2020: {
        granfondo: 0,
        mediofondo: 0,
      },
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
    registered: {
      2024: {
        granfondo: 0,
        mediofondo: 0,
      },
      2023: {
        granfondo: 0,
        mediofondo: 0,
      },
      2022: {
        granfondo: 0,
        mediofondo: 0,
      },
      2021: {
        granfondo: 0,
        mediofondo: 0,
      },
      2020: {
        granfondo: 0,
        mediofondo: 0,
      },
    },
  },
];

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
