import type {
  Event,
  EventYear,
  EventYearInitial,
  GranMedio,
} from "./lib/types";

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
      from: "#a855f7", // 보라색 계열 (예: purple-500)
      to: "#6d28d9", // 더 진한 보라색 (예: purple-700)
    },
    status: "ready",
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
    id: "seorak",
    location: "설악",
    years: [2022, 2023, 2024],
    color: {
      from: "#0d9488", // teal-600
      to: "#0f766e", // teal-700
    },
    status: "ready",
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
        granfondo: 3370,
        mediofondo: 2470,
      },
      2023: {
        granfondo: 2926,
        mediofondo: 2995,
      },
      2022: {
        granfondo: 2125,
        mediofondo: 2175,
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
  // 공룡나라는 컷오프가 많은데 컷오프된 사람들 기록을 따로 "컷오프"로 분류했다
  // 그리고 메디오가 없다
  // 특이한 경우라 뭔가 더 기능을 추가해야 한다
  // {
  //   id: "dino",
  //   location: "공룡나라",
  //   years: [2024, 2025],
  //   color: {
  //     from: "#8b5cf6",
  //     to: "#6d28d9",
  //   },
  //   latestEvent: {
  //     date: "2025.3.29",
  //     granFondo: {
  //       distance: 119,
  //       elevation: 1320,
  //     },
  //     medioFondo: {
  //       distance: 0,
  //       elevation: 0,
  //     },
  //   },
  //   meta: {
  //     title: "공룡나라 그란폰도 | FondoScope",
  //     description:
  //       "공룡나라 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2024년부터 2025년까지의 데이터를 제공합니다.",
  //     image: "/images/dino-og.jpg", // 공룡나라 그란폰도 대표 이미지
  //   },
  //   registered: {
  //     2025: {
  //       granfondo: 0,
  //       mediofondo: 0,
  //     },
  //     2024: {
  //       granfondo: 0,
  //       mediofondo: 0,
  //     },
  //   },
  // },
  {
    id: "samcheok",
    location: "삼척",
    years: [2022, 2023, 2024],
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
    },
  },
];
