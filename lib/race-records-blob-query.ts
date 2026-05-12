import { parseJsonRecordsToRaceRecords } from "./race-records-parse";
import type { RaceRecord } from "./types";

export const raceRecordsBlobQueryKey = (eventId: string, year: number) =>
  ["race-records-blob", eventId, year] as const;

export async function fetchRaceRecordsBlob(
  blobUrl: string,
  signal?: AbortSignal,
): Promise<RaceRecord[]> {
  const res = await fetch(blobUrl, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const raw = await res.json();
  return parseJsonRecordsToRaceRecords(Array.isArray(raw) ? raw : []);
}
