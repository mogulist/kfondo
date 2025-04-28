import type { Event, EventYearData, EventYearStats } from "./types"
import { parseCSV, generateTimeDistributionFromRecords, type RaceRecord } from "./csv-parser"

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

// 홍천 그란폰도 실제 데이터
const hongcheonRealData: Record<
  number,
  {
    granFondoRegistered: number
    granFondoParticipants: number
    granFondoDNF: number
    medioFondoRegistered: number
    medioFondoParticipants: number
    medioFondoDNF: number
  }
> = {
  2025: {
    granFondoRegistered: 1876,
    granFondoParticipants: 1202,
    granFondoDNF: 82,
    medioFondoRegistered: 1204,
    medioFondoParticipants: 1051,
    medioFondoDNF: 27,
  },
  2024: {
    granFondoRegistered: 1986,
    granFondoParticipants: 1607,
    granFondoDNF: 67,
    medioFondoRegistered: 1178,
    medioFondoParticipants: 1026,
    medioFondoDNF: 38,
  },
  2023: {
    granFondoRegistered: 2580,
    granFondoParticipants: 2230,
    granFondoDNF: 144,
    medioFondoRegistered: 1350,
    medioFondoParticipants: 1204,
    medioFondoDNF: 38,
  },
  2022: {
    granFondoRegistered: 3228,
    granFondoParticipants: 730,
    granFondoDNF: 113,
    medioFondoRegistered: 772,
    medioFondoParticipants: 161,
    medioFondoDNF: 23,
  },
}

// 양양 그란폰도 실제 데이터
const yangyangRealData: Record<
  number,
  {
    granFondoRegistered: number
    granFondoParticipants: number
    granFondoDNF: number
    medioFondoRegistered: number
    medioFondoParticipants: number
    medioFondoDNF: number
  }
> = {
  2025: {
    granFondoRegistered: 1241,
    granFondoParticipants: 1011,
    granFondoDNF: 190,
    medioFondoRegistered: 809,
    medioFondoParticipants: 672,
    medioFondoDNF: 76,
  },
  2024: {
    granFondoRegistered: 1200,
    granFondoParticipants: 975,
    granFondoDNF: 172,
    medioFondoRegistered: 700,
    medioFondoParticipants: 576,
    medioFondoDNF: 143,
  },
}

// CSV 데이터 캐시
const csvDataCache: Record<string, RaceRecord[]> = {}

// CSV 파일에서 데이터 로드
async function loadCSVData(eventId: string, year: number): Promise<RaceRecord[]> {
  const cacheKey = `${eventId}_${year}`

  // 캐시에 데이터가 있으면 반환
  if (csvDataCache[cacheKey]) {
    return csvDataCache[cacheKey]
  }

  try {
    const response = await fetch(`/data/${eventId}_${year}.csv`)
    if (!response.ok) {
      console.error(`Failed to load CSV data for ${eventId} ${year}: ${response.statusText}`)
      return []
    }

    const csvText = await response.text()
    const records = await parseCSV(csvText)

    // 캐시에 저장
    csvDataCache[cacheKey] = records

    return records
  } catch (error) {
    console.error(`Error loading CSV data for ${eventId} ${year}:`, error)
    return []
  }
}

// 연도별 참가자 데이터 생성 함수
export function getEventData(eventId: string): EventYearData[] {
  const event = events.find((e) => e.id === eventId)
  if (!event) return []

  // 홍천 그란폰도의 경우 실제 데이터 사용
  if (eventId === "hongcheon") {
    return event.years.map((year) => {
      const yearData = hongcheonRealData[year]

      if (!yearData) {
        return {
          year,
          granFondoRegistered: 0,
          granFondoParticipants: 0,
          medioFondoRegistered: 0,
          medioFondoParticipants: 0,
          granFondoDNF: 0,
          medioFondoDNF: 0,
        }
      }

      return {
        year,
        granFondoRegistered: yearData.granFondoRegistered,
        granFondoParticipants: yearData.granFondoParticipants,
        medioFondoRegistered: yearData.medioFondoRegistered,
        medioFondoParticipants: yearData.medioFondoParticipants,
        granFondoDNF: yearData.granFondoDNF,
        medioFondoDNF: yearData.medioFondoDNF,
      }
    })
  }

  // 양양 그란폰도의 경우 실제 데이터 사용
  if (eventId === "yangyang") {
    return event.years.map((year) => {
      const yearData = yangyangRealData[year]

      if (!yearData) {
        return {
          year,
          granFondoRegistered: 0,
          granFondoParticipants: 0,
          medioFondoRegistered: 0,
          medioFondoParticipants: 0,
          granFondoDNF: 0,
          medioFondoDNF: 0,
        }
      }

      return {
        year,
        granFondoRegistered: yearData.granFondoRegistered,
        granFondoParticipants: yearData.granFondoParticipants,
        medioFondoRegistered: yearData.medioFondoRegistered,
        medioFondoParticipants: yearData.medioFondoParticipants,
        granFondoDNF: yearData.granFondoDNF,
        medioFondoDNF: yearData.medioFondoDNF,
      }
    })
  }

  // 다른 이벤트는 가상 데이터 생성
  return event.years.map((year) => {
    return {
      year,
      granFondoRegistered: 0,
      granFondoParticipants: 0,
      medioFondoRegistered: 0,
      medioFondoParticipants: 0,
      granFondoDNF: 0,
      medioFondoDNF: 0,
    }
  })
}

// 시간 분포 데이터 생성 함수 (가상 데이터용)
function generateTimeDistribution(minHours: number, maxHours: number, intervalMinutes: number) {
  const distribution = []
  const totalParticipants = 500 + Math.floor(Math.random() * 300)

  // 정규 분포와 유사하게 참가자 분포 생성
  const intervals = Math.ceil(((maxHours - minHours) * 60) / intervalMinutes)
  const midPoint = intervals / 2

  // 실제 데이터 범위 (정규 분포의 중심을 기준으로)
  const actualMinHours = minHours + 0.25 // 실제 데이터는 최소 시간보다 15분 뒤에 시작
  const actualMaxHours = maxHours - 0.25 // 실제 데이터는 최대 시간보다 15분 전에 끝남

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
    const currentHour = startMinutes / 60

    // 실제 데이터 범위 밖의 시간대는 참가자 수를 0 또는 매우 적게 설정
    let participants = 0

    if (currentHour >= actualMinHours && currentHour <= actualMaxHours) {
      const normalizedPosition = (i - midPoint) / (midPoint / 2.5)
      const normalValue = Math.exp(-0.5 * Math.pow(normalizedPosition, 2))
      participants = Math.round(totalParticipants * normalValue * 0.25)

      // 최소 참가자 수 보장 (그래프가 0으로 떨어지지 않도록)
      participants = Math.max(participants, 3)
    } else {
      // 실제 데이터 범위 밖의 시간대는 매우 적은 참가자 수 (0~2명)
      participants = Math.floor(Math.random() * 3)
    }

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

// 특정 연도의 기록 분포 데이터 생성 함수
export async function getEventYearStats(eventId: string, year?: number): Promise<EventYearStats | null> {
  const event = events.find((e) => e.id === eventId)
  if (!event) return null

  // 연도가 지정되지 않은 경우 가장 최근 연도 사용
  const targetYear = year || Math.max(...event.years)

  if (!event.years.includes(targetYear)) return null

  // CSV 파일에서 데이터 로드 시도
  try {
    const records = await loadCSVData(eventId, targetYear)

    if (records.length > 0) {
      // CSV 데이터가 있으면 실제 데이터로 분포 생성
      const granFondoDistribution = generateTimeDistributionFromRecords(records, "그란폰도", 5) // 5분 간격으로 변경
      const medioFondoDistribution = generateTimeDistributionFromRecords(records, "메디오폰도", 5) // 5분 간격으로 변경

      return {
        year: targetYear,
        granFondoDistribution,
        medioFondoDistribution,
      }
    }
  } catch (error) {
    console.error(`Error generating stats from CSV for ${eventId} ${targetYear}:`, error)
  }

  // CSV 데이터가 없거나 오류 발생 시 가상 데이터 생성
  // 그란폰도 기록 분포 (가상 데이터)
  const granFondoDistribution = generateTimeDistribution(3.5, 8.5, 5) // 5분 간격으로 변경

  // 메디오폰도 기록 분포 (가상 데이터)
  const medioFondoDistribution = generateTimeDistribution(2, 5.5, 5) // 5분 간격으로 변경

  return {
    year: targetYear,
    granFondoDistribution,
    medioFondoDistribution,
  }
}
