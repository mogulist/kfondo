"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event, EventYearStatsWithCourses } from "@/lib/types";
import { StatsChart } from "./StatsChart";

type Props = {
  event: Event;
  yearlyStats: EventYearStatsWithCourses[];
};

export function EventYearTabs({ event, yearlyStats }: Props) {
  if (yearlyStats.length === 0) return null;

  const defaultYear = String(yearlyStats[0].year);

  return (
    <Tabs defaultValue={defaultYear} className="w-full">
      <div className="sticky top-16 z-40 -mx-4 border-b border-border bg-background px-4 py-2 sm:mx-0 sm:px-0">
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
              eventId={event.id}
              courses={courses}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
