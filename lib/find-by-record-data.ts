/**
 * 기록으로 찾기 결과 페이지 / OG 이미지 공통 데이터 로직
 */

import { getEventById } from "@/lib/db/events";
import { calculateParticipants, calculateDNF } from "@/lib/participants";
import { getCourseInfoById } from "@/lib/utils";
import type { Event } from "@/lib/types";

const COURSE_MAP: Record<string, string> = {
  granfondo: "그란폰도",
  mediofondo: "메디오폰도",
  "challenge-a": "Challenge A",
  "challenge-b": "Challenge B",
  rally: "랠리",
};

export function parseDigitTime(digit: string): string | null {
  if (!/^\d{6,8}$/.test(digit)) return null;
  if (digit.length === 6) {
    return `${digit.slice(0, 2)}:${digit.slice(2, 4)}:${digit.slice(4, 6)}`;
  }
  if (digit.length === 8) {
    return `${digit.slice(0, 2)}:${digit.slice(2, 4)}:${digit.slice(4, 6)}.${digit.slice(6, 8)}`;
  }
  return null;
}

export function timeToMilliseconds(time: string): number {
  if (!time || time === "DNF" || time === "DNS") return -1;
  const [h, m, s] = time.split(":");
  if (!h || !m || !s) return -1;
  let sec = 0,
    ms = 0;
  if (s.includes(".")) {
    const [secStr, msStr] = s.split(".");
    sec = parseInt(secStr, 10);
    ms = parseInt((msStr + "00").slice(0, 3), 10);
  } else {
    sec = parseInt(s, 10);
  }
  return (
    parseInt(h, 10) * 3600 * 1000 +
    parseInt(m, 10) * 60 * 1000 +
    sec * 1000 +
    ms
  );
}

export function msecToTimeString(msec: number): string {
  if (msec < 0) return "-";
  const h = Math.floor(msec / 3600000);
  const m = Math.floor((msec % 3600000) / 60000);
  const s = Math.floor((msec % 60000) / 1000);
  const ms = Math.floor((msec % 1000) / 10);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export type FindByRecordData = {
  event: Event;
  parsedTime: string;
  rank: number | null;
  percentile: number | null;
  percentileByParticipants: number | null;
  rankMale: number | null;
  rankFemale: number | null;
  percentileMale: number | null;
  percentileFemale: number | null;
  finishersMale: number;
  finishersFemale: number;
  totalParticipants: number;
  finishers: number;
  courseInfo: { name: string; distance: number; elevation: number } | undefined;
  recordsAround: { msec: number; isInput: boolean }[];
  eventDate: string;
};

export async function getFindByRecordData(
  eventId: string,
  courseId: string,
  year: string,
  timeDigit: string
): Promise<FindByRecordData | null> {
  const event = await getEventById(eventId);
  if (!event) return null;

  const parsedTime = parseDigitTime(timeDigit);
  if (!parsedTime) return null;

  const participants = await calculateParticipants(event, Number(year));
  const dnf = await calculateDNF(event, Number(year));
  const totalParticipants = participants[courseId] ?? 0;
  const totalDNF = dnf[courseId] ?? 0;
  const finishers = totalParticipants - totalDNF;

  const yearDetail = event.yearDetails[Number(year)];
  const sortedBlobUrl = yearDetail?.sortedRecordsBlobUrl;
  if (!sortedBlobUrl) return null;

  let sortedData: Record<string, number[]> = {};
  try {
    const response = await fetch(sortedBlobUrl, {
      next: { revalidate: 3600, tags: [`event-${eventId}`] },
    });
    if (!response.ok) return null;
    sortedData = await response.json();
  } catch {
    return null;
  }

  const courseRow = yearDetail?.courses?.find((c) => c.id === courseId);
  const courseKey =
    courseRow?.name ?? COURSE_MAP[courseId] ?? courseId;
  const courseArr: number[] = sortedData[courseKey] || [];
  const maleArr: number[] = sortedData[`${courseKey}_M`] || [];
  const femaleArr: number[] = sortedData[`${courseKey}_F`] || [];
  const inputMsec = timeToMilliseconds(parsedTime);
  if (inputMsec < 0) return null;

  const maleStats = rankAndPercentileFromSorted(maleArr, inputMsec);
  const femaleStats = rankAndPercentileFromSorted(femaleArr, inputMsec);

  const closestIdx = courseArr.findIndex((msec) => msec > inputMsec);
  let rank: number | null = null;
  let percentile: number | null = null;
  let percentileByParticipants: number | null = null;
  let recordsAround: { msec: number; isInput: boolean }[] = [];

  if (courseArr.length > 0) {
    const combined = rankAndPercentileFromSorted(courseArr, inputMsec);
    if (combined) {
      rank = combined.rank;
      percentile = combined.percentile;
    }
    if (totalParticipants > 0 && rank != null) {
      percentileByParticipants = ((rank - 1) / totalParticipants) * 100;
    }
    const faster = courseArr.slice(Math.max(0, closestIdx - 10), closestIdx);
    const slower = courseArr.slice(closestIdx, closestIdx + 10);
    recordsAround = [
      ...faster.map((msec) => ({ msec, isInput: false })),
      { msec: inputMsec, isInput: true },
      ...slower.map((msec) => ({ msec, isInput: false })),
    ];
  }

  const courseInfo = getCourseInfoById(eventId, year, courseId);
  const eventDate =
    yearDetail.date && /^\d{4}\.\d{1,2}\.\d{1,2}$/.test(yearDetail.date)
      ? (() => {
          const [y, m, d] = yearDetail.date.split(".");
          return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
        })()
      : "";

  return {
    event,
    parsedTime,
    rank,
    percentile,
    percentileByParticipants,
    rankMale: maleStats?.rank ?? null,
    rankFemale: femaleStats?.rank ?? null,
    percentileMale: maleStats?.percentile ?? null,
    percentileFemale: femaleStats?.percentile ?? null,
    finishersMale: maleArr.length,
    finishersFemale: femaleArr.length,
    totalParticipants,
    finishers,
    courseInfo,
    recordsAround,
    eventDate,
  };
}

function rankAndPercentileFromSorted(
  sortedMs: number[],
  inputMsec: number
): { rank: number; percentile: number } | null {
  if (sortedMs.length === 0) return null;
  const rank = sortedMs.filter((msec) => msec < inputMsec).length + 1;
  const percentile = ((rank - 1) / sortedMs.length) * 100;
  return { rank, percentile };
}
