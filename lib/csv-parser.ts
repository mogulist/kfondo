// CSV 파일을 파싱하는 유틸리티 함수

export interface RaceRecord {
  bibNo: string
  gender: string
  event: string
  time: string
  status: string
  timeInSeconds?: number // 시간을 초 단위로 변환한 값
}

// HH:MM:SS 형식의 시간 문자열을 초 단위로 변환하는 함수
export function timeToSeconds(timeStr: string): number {
  if (!timeStr || timeStr === "DNF" || timeStr === "DNS") return 0

  const parts = timeStr.split(":")
  if (parts.length !== 3) return 0

  const hours = Number.parseInt(parts[0], 10)
  const minutes = Number.parseInt(parts[1], 10)
  const seconds = Number.parseInt(parts[2], 10)

  return hours * 3600 + minutes * 60 + seconds
}

// CSV 문자열을 파싱하여 레코드 배열로 변환하는 함수
export async function parseCSV(csvText: string): Promise<RaceRecord[]> {
  const lines = csvText.trim().split("\n")
  if (lines.length <= 1) return []

  const headers = lines[0].split(",")
  const records: RaceRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",")
    if (values.length !== headers.length) continue

    const record: RaceRecord = {
      bibNo: values[0],
      gender: values[1],
      event: values[2],
      time: values[3],
      status: values[4],
    }

    // 시간을 초 단위로 변환
    if (record.time && record.status !== "DNF" && record.status !== "DNS") {
      record.timeInSeconds = timeToSeconds(record.time)
    }

    records.push(record)
  }

  return records
}

// 레코드 배열에서 시간 분포 데이터를 생성하는 함수
export function generateTimeDistributionFromRecords(
  records: RaceRecord[],
  eventType: string,
  intervalMinutes = 5, // 기본값을 5분으로 변경
): { timeRange: string; participants: number; percentile: number }[] {
  // 해당 이벤트 타입의 완주 기록만 필터링
  const filteredRecords = records.filter(
    (r) => r.event === eventType && r.status !== "DNF" && r.status !== "DNS" && r.timeInSeconds && r.timeInSeconds > 0,
  )

  if (filteredRecords.length === 0) return []

  // 최소 및 최대 시간 찾기
  let minTime = Number.MAX_SAFE_INTEGER
  let maxTime = 0

  filteredRecords.forEach((record) => {
    if (record.timeInSeconds) {
      minTime = Math.min(minTime, record.timeInSeconds)
      maxTime = Math.max(maxTime, record.timeInSeconds)
    }
  })

  // 시간 범위를 약간 확장하여 여유 공간 확보 (앞뒤로 5분)
  const paddingTime = 5 * 60 // 5분의 여유 공간
  minTime = Math.max(0, minTime - paddingTime)
  maxTime = maxTime + paddingTime

  // 시간을 시간 단위로 변환
  const minHours = minTime / 3600
  const maxHours = maxTime / 3600

  // 구간 수 계산
  const intervals = Math.ceil(((maxHours - minHours) * 60) / intervalMinutes)

  // 각 구간별 참가자 수 카운트
  const distribution: { timeRange: string; participants: number; percentile: number }[] = []
  const intervalSeconds = intervalMinutes * 60

  for (let i = 0; i < intervals; i++) {
    const startSeconds = minTime + i * intervalSeconds
    const endSeconds = startSeconds + intervalSeconds

    const startHour = Math.floor(startSeconds / 3600)
    const startMin = Math.floor((startSeconds % 3600) / 60)
    const endHour = Math.floor(endSeconds / 3600)
    const endMin = Math.floor((endSeconds % 3600) / 60)

    const timeRange = `${startHour}:${startMin.toString().padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`

    // 해당 구간에 속하는 참가자 수 계산
    const participants = filteredRecords.filter(
      (r) => r.timeInSeconds && r.timeInSeconds >= startSeconds && r.timeInSeconds < endSeconds,
    ).length

    distribution.push({
      timeRange,
      participants,
      percentile: 0, // 나중에 계산
    })
  }

  // 누적 참가자 수 및 백분위 계산
  let cumulativeParticipants = 0
  const totalParticipants = filteredRecords.length

  for (const item of distribution) {
    cumulativeParticipants += item.participants
    item.percentile = Math.round(100 - (cumulativeParticipants / totalParticipants) * 100)
    item.percentile = Math.max(item.percentile, 0) // 음수 백분위 방지
  }

  return distribution
}
