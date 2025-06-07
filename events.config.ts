import type { Event } from "./lib/types";

// 그란폰도 이벤트 목록
export const events: Event[] = [
  {
    id: "gapyeong",
    location: "가평",
    years: [2025],
    color: {
      from: "#eab308",
      to: "#a16207",
    },
    status: "ready",
    meta: {
      title: "트렉가평자라섬 그란폰도 통계 | FondoScope",
      description:
        "트렉가평자라섬 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2025년의 데이터를 제공합니다.",
      image: "/images/gapyeong-og.jpg",
    },
    comment:
      "그란폰도 참가자 중 78km 하오재 계측 기록이 없는 244명은 DNF로 분류하였습니다. 기록 업데이트: 5.25 15:50",
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.5.24",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 118,
            elevation: 2441,
            registered: 806,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 75,
            elevation: 1393,
            registered: 392,
          },
        ],
        totalRegistered: 0,
      },
    },
  },
  {
    id: "seorak",
    location: "설악",
    years: [2022, 2023, 2024, 2025],
    color: {
      from: "#0d9488",
      to: "#0f766e",
    },
    status: "ready",
    meta: {
      title: "설악 그란폰도 통계 | FondoScope",
      description:
        "설악 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2020년부터 2024년까지의 데이터를 제공합니다.",
      image: "/images/seorak-og.jpg",
    },
    comment:
      "2025년 코스제외자 551명은 그란폰도 DNF로 분류하였습니다. 기록 업데이트: 5.20 21:00",
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.5.17",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 208,
            elevation: 3800,
            registered: 0,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 105,
            elevation: 1700,
            registered: 0,
          },
        ],
        totalRegistered: 0,
      },
      2024: {
        year: 2024,
        date: "2024.5.18",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 208,
            elevation: 3800,
            registered: 3370,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 105,
            elevation: 1700,
            registered: 2470,
          },
        ],
        totalRegistered: 5840,
      },
      2023: {
        year: 2023,
        date: "2023.5.18",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 208,
            elevation: 3800,
            registered: 2926,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 105,
            elevation: 1700,
            registered: 2995,
          },
        ],
        totalRegistered: 5921,
      },
      2022: {
        year: 2022,
        date: "2022.5.18",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 208,
            elevation: 3800,
            registered: 2125,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 105,
            elevation: 1700,
            registered: 2175,
          },
        ],
        totalRegistered: 4300,
      },
    },
  },
  // 홍천 (이미 변환됨)
  {
    id: "hongcheon",
    location: "홍천",
    years: [2022, 2023, 2024, 2025],
    color: {
      from: "#f43f5e",
      to: "#e11d48",
    },
    status: "ready",
    meta: {
      title: "홍천 그란폰도 통계 | FondoScope",
      description:
        "홍천 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2022년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/hongcheon-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.4.19",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 122,
            elevation: 1594,
            registered: 1876,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 79,
            elevation: 1144,
            registered: 1204,
          },
        ],
        totalRegistered: 3080,
      },
      2024: {
        year: 2024,
        date: "2024.4.19",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 122,
            elevation: 1594,
            registered: 1986,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 79,
            elevation: 1144,
            registered: 1178,
          },
        ],
        totalRegistered: 3164,
      },
      2023: {
        year: 2023,
        date: "2023.4.19",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 122,
            elevation: 1594,
            registered: 2580,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 79,
            elevation: 1144,
            registered: 1350,
          },
        ],
        totalRegistered: 3930,
      },
      2022: {
        year: 2022,
        date: "2022.4.19",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 122,
            elevation: 1594,
            registered: 3228,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 79,
            elevation: 1144,
            registered: 772,
          },
        ],
        totalRegistered: 4000,
      },
    },
  },
  // 양양
  {
    id: "yangyang",
    location: "양양",
    years: [2024, 2025],
    color: {
      from: "#0ea5e9",
      to: "#0369a1",
    },
    status: "ready",
    meta: {
      title: "양양 그란폰도 통계 | FondoScope",
      description:
        "양양 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2024년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/yangyang-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.4.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 151,
            elevation: 2380,
            registered: 1241,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 68,
            elevation: 630,
            registered: 809,
          },
        ],
        totalRegistered: 2050,
      },
      2024: {
        year: 2024,
        date: "2024.4.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 151,
            elevation: 2380,
            registered: 1200,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 68,
            elevation: 630,
            registered: 700,
          },
        ],
        totalRegistered: 1900,
      },
    },
  },
  // 영산강
  {
    id: "yeongsan",
    location: "영산강",
    years: [2023, 2024, 2025],
    color: {
      from: "#a855f7",
      to: "#6d28d9",
    },
    status: "ready",
    meta: {
      title: "영산 그란폰도 통계 | FondoScope",
      description:
        "영산 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2023년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/yeongsan-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.4.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 121,
            elevation: 1000,
            registered: 1241,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 104,
            elevation: 757,
            registered: 809,
          },
        ],
        totalRegistered: 2050,
      },
      2024: {
        year: 2024,
        date: "2024.4.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 121,
            elevation: 1000,
            registered: 1200,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 104,
            elevation: 757,
            registered: 700,
          },
        ],
        totalRegistered: 1900,
      },
      2023: {
        year: 2023,
        date: "2023.4.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 121,
            elevation: 1000,
            registered: 0,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 104,
            elevation: 757,
            registered: 0,
          },
        ],
        totalRegistered: 0,
      },
    },
  },
  // 문경새재
  {
    id: "mungyeong",
    location: "문경새재",
    years: [2023, 2024],
    color: {
      from: "#22c55e",
      to: "#15803d",
    },
    status: "ready",
    meta: {
      title: "문경새재 그란폰도 통계 | FondoScope",
      description:
        "문경새재 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2023년부터 2024년까지의 데이터를 제공합니다.",
      image: "/images/mungyeong-og.jpg",
    },
    yearDetails: {
      2024: {
        year: 2024,
        date: "2024.9.1",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 152.5,
            elevation: 2025,
            registered: 1099,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 110.4,
            elevation: 1817,
            registered: 1429,
          },
        ],
        totalRegistered: 2528,
      },
      2023: {
        year: 2023,
        date: "2023.9.1",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 152.5,
            elevation: 2025,
            registered: 1196,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 110.4,
            elevation: 1817,
            registered: 1110,
          },
        ],
        totalRegistered: 2306,
      },
    },
  },
  // 정읍내장산
  {
    id: "jeongeup",
    location: "정읍내장산",
    years: [2023, 2024, 2025],
    color: {
      from: "#f59e42",
      to: "#ea580c",
    },
    status: "ready",
    meta: {
      title: "정읍내장산 그란폰도 통계 | FondoScope",
      description:
        "정읍내장산 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2023년부터 2024년까지의 데이터를 제공합니다.",
      image: "/images/jeongeup-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.6.1",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 139,
            elevation: 2076,
            registered: 930,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 96,
            elevation: 1489,
            registered: 635,
          },
        ],
        totalRegistered: 1565,
      },
      2024: {
        year: 2024,
        date: "2024.5.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 139,
            elevation: 2076,
            registered: 809,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 96,
            elevation: 1489,
            registered: 630,
          },
        ],
        totalRegistered: 1439,
      },
      2023: {
        year: 2023,
        date: "2023.5.26",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 139,
            elevation: 2076,
            registered: 731,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 96,
            elevation: 1489,
            registered: 426,
          },
        ],
        totalRegistered: 1157,
      },
    },
  },
  // 삼척 (등록자 수 없음)
  {
    id: "samcheok",
    location: "삼척",
    years: [2024, 2025],
    color: {
      from: "#10b981",
      to: "#047857",
    },
    status: "ready",
    meta: {
      title: "삼척 그란폰도 통계 | FondoScope",
      description:
        "삼척 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요.",
      image: "/images/samcheok-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.6.7",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 128,
            elevation: 1668,
            registered: 750,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 102,
            elevation: 1201,
            registered: 660,
          },
        ],
        totalRegistered: 1410,
      },
      2024: {
        year: 2024,
        date: "2024.6.9",
        courses: [
          {
            id: "granfondo",
            name: "그란폰도",
            distance: 128,
            elevation: 1668,
            registered: 1003,
          },
          {
            id: "mediofondo",
            name: "메디오폰도",
            distance: 102,
            elevation: 1201,
            registered: 317,
          },
        ],
        totalRegistered: 1320,
      },
    },
  },
  // 화천 DMZ 랠리
  {
    id: "hwacheon",
    location: "화천",
    years: [2022, 2023, 2025],
    color: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    status: "ready",
    meta: {
      title: "화천 DMZ 랠리 통계 | FondoScope",
      description:
        "화천 DMZ 랠리의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2022년부터 2025년까지의 데이터를 제공합니다.",
      image: "/images/hwacheon-og.jpg",
    },
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.5.11",
        courses: [
          {
            id: "single",
            name: "DMZ 랠리",
            distance: 71.35,
            elevation: 1244,
            registered: 0,
          },
        ],
        totalRegistered: 0,
      },
      2023: {
        year: 2023,
        date: "2023",
        courses: [
          {
            id: "single",
            name: "DMZ 랠리",
            distance: 0,
            elevation: 0,
            registered: 0,
          },
        ],
        totalRegistered: 0,
      },
      2022: {
        year: 2022,
        date: "2022",
        courses: [
          {
            id: "single",
            name: "DMZ 랠리",
            distance: 0,
            elevation: 0,
            registered: 0,
          },
        ],
        totalRegistered: 0,
      },
    },
  },
  {
    id: "jeosu",
    location: "예천저수령",
    years: [2025],
    color: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    status: "ready",
    meta: {
      title: "예천저수령 그란폰도 통계 | FondoScope",
      description:
        "예천저수령 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요. 2025년의 데이터를 제공합니다.",
      image: "/images/jeosu-og.jpg",
    },
    comment:
      "Challenge A 참가자 중 5번째 체크포인트 기록이 없는 302명은 DNF로 분류하였습니다.",
    yearDetails: {
      2025: {
        year: 2025,
        date: "2025.5.31",
        courses: [
          {
            id: "challenge-a",
            name: "Challenge A",
            distance: 103.6,
            elevation: 2020,
            registered: 2109,
          },
          {
            id: "challenge-b",
            name: "Challenge B",
            distance: 93.3,
            elevation: 1754,
            registered: 191,
          },
        ],
        totalRegistered: 0,
      },
    },
  },
];
