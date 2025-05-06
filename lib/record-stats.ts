// 레코드 배열에서 시간 분포 데이터를 생성하는 함수
import type { RaceRecord } from "./types";

// 시간 분포 + 누적 명수 타입 정의
export type TimeDistributionWithCumulative = {
  timeRange: string;
  participants: number;
  percentile: number;
  cumulativeCount: number;
};

export function generateTimeDistributionFromRecords(
  records: RaceRecord[],
  eventType: string,
  intervalMinutes = 5, // 기본값을 5분으로 변경
  year?: number, // 연도 정보 추가
  totalParticipants?: number // 참가자 수를 외부에서 받을 수 있게 추가
): TimeDistributionWithCumulative[] {
  // 해당 이벤트 타입의 완주 기록만 필터링
  const filteredRecords = records.filter(
    (r) =>
      r.event === eventType &&
      r.status !== "DNF" &&
      r.status !== "DNS" &&
      r.timeInSeconds &&
      r.timeInSeconds > 0
  );

  if (filteredRecords.length === 0) return [];

  // 최소 및 최대 시간 찾기
  let minTime = Number.MAX_SAFE_INTEGER;
  let maxTime = 0;

  filteredRecords.forEach((record) => {
    if (record.timeInSeconds) {
      minTime = Math.min(minTime, record.timeInSeconds);
      maxTime = Math.max(maxTime, record.timeInSeconds);
    }
  });

  // 시간 범위를 약간 확장하여 여유 공간 확보 (앞뒤로 5분)
  const paddingTime = 5 * 60; // 5분의 여유 공간
  minTime = Math.max(0, minTime - paddingTime);
  maxTime = maxTime + paddingTime;

  // minTime을 항상 짝수분(0,2,4,...)으로 보정
  const minMinutes = Math.floor(minTime / 60);
  if (minMinutes % 2 !== 0) {
    minTime += 60; // 1분 추가해서 짝수분으로 맞춤
  }

  // 시간을 시간 단위로 변환
  const minHours = minTime / 3600;
  const maxHours = maxTime / 3600;

  // 구간 수 계산
  const intervals = Math.ceil(((maxHours - minHours) * 60) / intervalMinutes);

  // 각 구간별 참가자 수 카운트
  const distribution: TimeDistributionWithCumulative[] = [];
  const intervalSeconds = intervalMinutes * 60;

  for (let i = 0; i < intervals; i++) {
    const startSeconds = minTime + i * intervalSeconds;
    const endSeconds = startSeconds + intervalSeconds;

    const startHour = Math.floor(startSeconds / 3600);
    const startMin = Math.floor((startSeconds % 3600) / 60);
    const endHour = Math.floor(endSeconds / 3600);
    const endMin = Math.floor((endSeconds % 3600) / 60);

    const timeRange = `${startHour}:${startMin
      .toString()
      .padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`;

    // 해당 구간에 속하는 참가자 수 계산
    const participants = filteredRecords.filter(
      (r) =>
        r.timeInSeconds &&
        r.timeInSeconds >= startSeconds &&
        r.timeInSeconds < endSeconds
    ).length;

    distribution.push({
      timeRange,
      participants,
      percentile: 0, // 나중에 계산
      cumulativeCount: 0, // 초기값 0
    });
  }

  // 누적 참가자 수 및 백분위 계산
  let cumulativeParticipants = 0;
  // 전체 참가자 수(완주+DNF, DNS 제외)
  const allParticipants =
    typeof totalParticipants === "number"
      ? totalParticipants
      : records.filter(
          (r) => r.event === eventType && r.status !== "DNS" && r.time !== ""
        ).length;
  console.log(
    `[분포] eventType: ${eventType}, year: ${year}, allParticipants:`,
    allParticipants
  );

  for (const item of distribution) {
    cumulativeParticipants += item.participants;
    item.cumulativeCount = cumulativeParticipants; // 누적 명수 할당
    item.percentile =
      allParticipants > 0
        ? Math.round((cumulativeParticipants / allParticipants) * 100)
        : 0;
    item.percentile = Math.min(item.percentile, 100); // 100% 초과 방지
  }

  return distribution;
}
