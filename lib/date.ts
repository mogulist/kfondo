import dayjs from "dayjs";

/** YYYY.MM.DD → YYYY-MM-DD (Safari 호환용) */
export function normalizeEventDate(dateStr: string): string {
  return dateStr.replace(/\./g, "-");
}

/** 이벤트 날짜까지 남은 일수. 오늘 기준 day 단위 diff. */
export function getDaysUntilEvent(dateStr: string): number {
  const normalized = normalizeEventDate(dateStr);
  return dayjs(normalized).diff(dayjs(), "day");
}
