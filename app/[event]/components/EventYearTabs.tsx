"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event, EventYearStatsWithCourses, RaceRecord } from "@/lib/types";
import { parseJsonRecordsToRaceRecords } from "@/lib/race-records-parse";
import { StatsChart, type RaceRecordsClientState } from "./StatsChart";

type Props = {
  event: Event;
  yearlyStats: EventYearStatsWithCourses[];
};

export function EventYearTabs({ event, yearlyStats }: Props) {
  const defaultYearStr = String(yearlyStats[0].year);
  const [tab, setTab] = React.useState(defaultYearStr);

  const activeYear = Number(tab);
  const activeBlobUrl =
    event.yearDetails[activeYear]?.recordsBlobUrl?.trim() ?? "";

  const [recordsByYear, setRecordsByYear] = React.useState<
    Partial<Record<number, RaceRecordsClientState>>
  >({});

  const recordsByYearRef = React.useRef(recordsByYear);
  recordsByYearRef.current = recordsByYear;

  React.useEffect(() => {
    let cancelled = false;
    const year = activeYear;
    const blobUrl = activeBlobUrl;

    const existing = recordsByYearRef.current[year];
    if (existing?.status === "loaded") return;

    if (!blobUrl) {
      setRecordsByYear((prev) => {
        if (prev[year]?.status === "loaded") return prev;
        return { ...prev, [year]: { status: "no_blob" } };
      });
      return;
    }

    setRecordsByYear((prev) => {
      const cur = prev[year];
      if (cur?.status === "loaded") return prev;
      if (cur?.status === "loading") return prev;
      return { ...prev, [year]: { status: "loading" } };
    });

    fetch(blobUrl)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((raw) => {
        if (cancelled) return;
        const records: RaceRecord[] = parseJsonRecordsToRaceRecords(
          Array.isArray(raw) ? raw : [],
        );
        setRecordsByYear((prev) => ({
          ...prev,
          [year]: { status: "loaded", records },
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setRecordsByYear((prev) => ({ ...prev, [year]: { status: "error" } }));
      });

    return () => {
      cancelled = true;
    };
  }, [activeYear, activeBlobUrl, event.id]);

  if (yearlyStats.length === 0) return null;

  const getRaceRecordsState = React.useCallback(
    (year: number): RaceRecordsClientState =>
      recordsByYear[year] ?? { status: "pending" },
    [recordsByYear],
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="sticky top-12 z-40 -mx-4 border-b border-border bg-background px-4 py-2 sm:mx-0 sm:px-0">
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex h-auto min-h-10 w-max max-w-full flex-nowrap justify-start gap-1">
            {yearlyStats.map(({ year }) => (
              <TabsTrigger key={year} value={String(year)} className="shrink-0">
                {year}년
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      {yearlyStats.map((yearData) => {
        const courses = event.yearDetails[yearData.year]?.courses;
        return (
          <TabsContent
            key={yearData.year}
            value={String(yearData.year)}
            className="mt-6"
          >
            <StatsChart
              statistics={[yearData]}
              event={event}
              eventId={event.id}
              courses={courses}
              getRaceRecordsState={getRaceRecordsState}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
