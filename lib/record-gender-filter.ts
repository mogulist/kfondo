import type { RaceRecord } from "./types";

export type GenderSegment = "open" | "male" | "female";

type NormalizedGender = "male" | "female" | null;

const normalizeRaceGender = (raw: string): NormalizedGender => {
  const s = raw.trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower === "m" || lower === "male" || s === "남") return "male";
  if (
    lower === "f" ||
    lower === "w" ||
    lower === "female" ||
    s === "여"
  )
    return "female";
  return null;
};

/** `open`: 전체 레코드(필터 없음). 그 외: 해당 성별만(미분류는 제외). */
export const filterRaceRecordsByGender = (
  records: RaceRecord[],
  segment: GenderSegment
): RaceRecord[] => {
  if (segment === "open") return records;

  const want: NormalizedGender = segment;
  return records.filter((r) => normalizeRaceGender(r.gender) === want);
};
