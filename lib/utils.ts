import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { events } from "../events.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// HH:MM:SS 형식의 시간 문자열을 초 단위로 변환하는 함수
export function timeToSeconds(timeStr: string): number {
  if (!timeStr || timeStr === "DNF" || timeStr === "DNS") return 0;

  const parts = timeStr.split(":");
  if (parts.length !== 3) return 0;

  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  const seconds = Number.parseInt(parts[2], 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// eventId, year, courseId로 course 이름 반환
export const getCourseNameById = (
  eventId: string,
  year: string | number,
  courseId: string
): string | undefined => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return undefined;

  const yearDetail = event.yearDetails?.[Number(year)];
  if (!yearDetail) return undefined;

  const course = yearDetail.courses.find((c) => c.id === courseId);
  return course?.name;
};

// eventId, year, courseId로 코스 정보 반환
export const getCourseInfoById = (
  eventId: string,
  year: string | number,
  courseId: string
): { name: string; distance: number; elevation: number } | undefined => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return undefined;

  const yearDetail = event.yearDetails?.[Number(year)];
  if (!yearDetail) return undefined;

  const course = yearDetail.courses.find((c) => c.id === courseId);
  if (!course) return undefined;

  return {
    name: course.name,
    distance: course.distance,
    elevation: course.elevation,
  };
};
