import type { Event, EventYearData, EventYearStats } from "./types"

// 그란폰도 이벤트 목록
export const events: Event[] = [
  {
    id: "hongcheon",
    location: "홍천",
    years: [2022, 2023, 2024, 2025],
    color: {
      from: "#2563eb",
      to: "#1e40af",
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
  },
  {
    id: "yangyang",
    location: "양양",
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
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
  },
]

// 연도별 참가자 데이터 생성 함수
export function getEventData(eventId: string): EventYearData[] {
  const event = events.find((e) => e.id === eventId)
  if (!event) return []

  return event.years.map((year) => {
    // 실제로는 웹스크래핑 데이터를 사용하겠지만, 여기서는 가상 데이터 생성
    const baseGranRegistered = 400 + Math.floor(Math.random() * 200)
    const baseMedioRegistered = 250 + Math.floor(Math.random() * 150)

    // 연도가 최근일수록 참가자가 더 많은 경향
    const yearFactor = (year - 2018) * 20

    // 등록자 중 약 85-95%가 실제 참가
    const granParticipationRate = 0.85 + Math.random() * 0.1
    const medioParticipationRate = 0.85 + Math.random() * 0.1

    const granFondoRegistered = baseGranRegistered + yearFactor
    const medioFondoRegistered = baseMedioRegistered + yearFactor

    return {
      year,
      granFondoRegistered,
      granFondoParticipants: Math.floor(granFondoRegistered * granParticipationRate),
      medioFondoRegistered,
      medioFondoParticipants: Math.floor(medioFondoRegistered * medioParticipationRate),
    }
  })
}

// 특정 연도의 기록 분포 데이터 생성 함수
export function getEventYearStats(eventId: string, year?: number): EventYearStats | null {
  const event = events.find((e) => e.id === eventId)
  if (!event) return null

  // 연도가 지정되지 않은 경우 가장 최근 연도 사용
  const targetYear = year || Math.max(...event.years)

  if (!event.years.includes(targetYear)) return null

  // 그란폰도 기록 분포 (가상 데이터)
  const granFondoDistribution = generateTimeDistribution(4, 8, 30)

  // 메디오폰도 기록 분포 (가상 데이터)
  const medioFondoDistribution = generateTimeDistribution(2.5, 5, 25)

  return {
    year: targetYear,
    granFondoDistribution,
    medioFondoDistribution,
  }
}

// 시간 분포 데이터 생성 함수
function generateTimeDistribution(minHours: number, maxHours: number, intervalMinutes: number) {
  const distribution = []
  const totalParticipants = 500 + Math.floor(Math.random() * 300)

  // 정규 분포와 유사하게 참가자 분포 생성
  const intervals = Math.ceil(((maxHours - minHours) * 60) / intervalMinutes)
  const midPoint = intervals / 2

  let cumulativeParticipants = 0

  for (let i = 0; i < intervals; i++) {
    const startMinutes = minHours * 60 + i * intervalMinutes
    const endMinutes = startMinutes + intervalMinutes

    const startHour = Math.floor(startMinutes / 60)
    const startMin = startMinutes % 60
    const endHour = Math.floor(endMinutes / 60)
    const endMin = endMinutes % 60

    const timeRange = `${startHour}:${startMin.toString().padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`

    // 정규 분포 계산 (더 부드러운 곡선을 위해 표준편차 조정)
    const distanceFromMid = (i - midPoint) / (midPoint / 2.5)
    const normalValue = Math.exp(-0.5 * Math.pow(distanceFromMid, 2))

    // 총 참가자 수에 정규분포 값을 곱하여 해당 구간의 참가자 수 계산
    let participants = Math.round(totalParticipants * normalValue * 0.25)

    // 최소 참가자 수 보장 (그래프가 0으로 떨어지지 않도록)
    participants = Math.max(participants, 3)

    cumulativeParticipants += participants

    // 상위 몇 % 인지 계산
    const percentile = Math.round(100 - (cumulativeParticipants / totalParticipants) * 100)

    distribution.push({
      timeRange,
      participants,
      percentile: Math.max(percentile, 0), // 음수 백분위 방지
    })
  }

  return distribution
}
