"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import posthog from "posthog-js";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import dayjs from "dayjs";
import { useMobile } from "@/hooks/use-mobile";
import {
  filterRaceRecordsByGender,
  type GenderSegment,
} from "@/lib/record-gender-filter";
import { generateTimeDistributionFromRecords } from "@/lib/record-stats";
import type {
  Event,
  EventYearStatsWithCourses,
  RaceCategory,
  RaceRecord,
  TimeDistribution,
} from "@/lib/types";
import { DistributionChart } from "../../../components/distribution-chart";
import { CourseViewSelect } from "./course-view-select";

const colors = ["hsl(215, 90%, 50%)", "hsl(150, 80%, 40%)", "hsl(0, 80%, 60%)"];

export type RaceRecordsClientState =
  | { status: "pending" }
  | { status: "loading" }
  | { status: "loaded"; records: RaceRecord[] }
  | { status: "no_blob" }
  | { status: "error" };

type Props = {
  statistics: EventYearStatsWithCourses[];
  event: Event;
  eventId: string;
  courses?: RaceCategory[];
  getRaceRecordsState: (year: number) => RaceRecordsClientState;
};

function formatCourseStatsLine(
  course: RaceCategory | undefined,
): string | null {
  if (!course) return null;
  const parts: string[] = [];
  if (typeof course.distance === "number" && course.distance > 0)
    parts.push(`${course.distance}km`);
  if (typeof course.elevation === "number" && course.elevation > 0)
    parts.push(
      `${course.elevation.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}m`,
    );
  return parts.length > 0 ? parts.join(" · ") : null;
}

const SEGMENT_ITEMS: readonly { segment: GenderSegment; label: string }[] = [
  { segment: "open", label: "통합" },
  { segment: "male", label: "남" },
  { segment: "female", label: "여" },
] as const;

type YearChartsSectionProps = {
  yearData: EventYearStatsWithCourses;
  eventId: string;
  event: Event;
  courses?: RaceCategory[];
  raceRecordsState: RaceRecordsClientState;
  isMobile: boolean;
};

const YearChartsSection = ({
  yearData,
  eventId,
  event,
  courses,
  raceRecordsState,
  isMobile,
}: YearChartsSectionProps) => {
  const [genderSegment, setGenderSegment] =
    React.useState<GenderSegment>("open");

  React.useEffect(() => {
    if (
      genderSegment !== "open" &&
      (raceRecordsState.status === "error" ||
        raceRecordsState.status === "no_blob")
    )
      setGenderSegment("open");
  }, [genderSegment, raceRecordsState.status]);

  const canFilterByGender =
    raceRecordsState.status === "loaded" &&
    Boolean(event.yearDetails[yearData.year]?.recordsBlobUrl?.trim());

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      key={yearData.year}
    >
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {yearData.distributions.map((distribution, index) => {
          let chartData: TimeDistribution[];

          if (genderSegment === "open") {
            chartData = distribution.distribution;
          } else if (raceRecordsState.status === "loaded") {
            const filtered = filterRaceRecordsByGender(
              raceRecordsState.records,
              genderSegment,
            );
            chartData = generateTimeDistributionFromRecords(
              filtered,
              distribution.courseName,
              2,
              yearData.year,
            );
          } else {
            chartData = distribution.distribution;
          }

          const start = chartData[0]?.timeRange.split(" - ")[0];
          const end = chartData.at(-1)?.timeRange.split(" - ")[0];
          const interval =
            start && end ? getTickIntervalByRange(start, end) : 10;
          const color = colors[index];
          const courseMeta = courses?.find(
            (c) => c.id === distribution.courseId,
          );
          const statsLine = formatCourseStatsLine(courseMeta);
          const findByRecordHref = `/find-by-record/${eventId}/${distribution.courseId}/${yearData.year}`;

          const toolbar = (
            <>
              <div className="flex flex-row items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1 space-y-0.5 pr-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {distribution.courseName}
                  </h3>
                  {statsLine ? (
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {statsLine}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-nowrap items-center gap-2">
                  {courseMeta ? (
                    <CourseViewSelect
                      course={courseMeta}
                      eventSlug={eventId}
                      year={yearData.year}
                    />
                  ) : null}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs font-normal sm:text-sm"
                  >
                    <Link
                      href={findByRecordHref}
                      onClick={() =>
                        posthog.capture("find_by_record_entry_clicked", {
                          event_id: eventId,
                          course_id: distribution.courseId,
                          year: String(yearData.year),
                          is_past_year:
                            yearData.year !== new Date().getFullYear(),
                        })
                      }
                    >
                      기록 찾기
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex justify-start">
                <ToggleGroup
                  type="single"
                  value={genderSegment}
                  onValueChange={(value) => {
                    if (value) setGenderSegment(value as GenderSegment);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-fit justify-start gap-0 overflow-hidden rounded-md border border-input bg-background p-0 shadow-sm"
                  aria-label="기록 분포 성별"
                >
                  {SEGMENT_ITEMS.map(({ segment, label }) => {
                    const disableNonOpen =
                      segment !== "open" && !canFilterByGender;
                    const titleHint = disableNonOpen
                      ? "기록 원본을 불러올 수 없을 때는 통합만 볼 수 있습니다."
                      : undefined;
                    return (
                      <ToggleGroupItem
                        key={`${distribution.courseId}-${segment}`}
                        value={segment}
                        disabled={disableNonOpen}
                        title={titleHint}
                        className="h-8 py-0 leading-none rounded-none border-0 border-r border-input shadow-none ring-offset-0 last:border-r-0 focus-visible:z-10"
                      >
                        {label}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>
            </>
          );

          return (
            <DistributionChart
              key={distribution.courseId}
              ariaLabel={`${distribution.courseName} ${yearData.year}년 기록 분포`}
              toolbar={toolbar}
              data={chartData}
              color={color}
              interval={interval}
              isMobile={isMobile}
              comment={index === 0 ? yearData.comment : undefined}
              formatXAxisTick={formatXAxisTick}
              CustomTooltip={CustomTooltip}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export const StatsChart = ({
  statistics,
  event,
  eventId,
  courses,
  getRaceRecordsState,
}: Props) => {
  const isMobile = useMobile();

  if (!statistics || statistics.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {statistics.map((yearData) => (
        <YearChartsSection
          key={yearData.year}
          yearData={yearData}
          eventId={eventId}
          event={event}
          courses={courses}
          raceRecordsState={getRaceRecordsState(yearData.year)}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

const formatTooltipTimeRange = (timeRange: string, intervalMinutes = 2) => {
  const [start, end] = timeRange.split(" - ");
  const startTime = dayjs(`2000-01-01 ${start.padStart(5, "0")}:00`);
  let interval = intervalMinutes;
  if (start && end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    interval = eh * 60 + em - (sh * 60 + sm);
    if (interval <= 0) interval = intervalMinutes;
  }
  const endTime = startTime.add(interval, "minute").subtract(1, "second");
  return `${startTime.format("HH:mm:00")} - ${endTime.format("HH:mm:ss")}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timeRange = formatTooltipTimeRange(
      label,
      payload[0]?.payload?.interval || 2,
    );
    const participants = payload[0].value;
    const percentile = payload[0].payload.percentile;
    const cumulativeCount = payload[0].payload.cumulativeCount;

    return (
      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
        <div className="space-y-1 min-w-[110px]">
          <div className="font-medium">{timeRange}</div>
          <div className="border-t my-1" />
          <div>{participants}명</div>
          <div>
            {cumulativeCount}명, {percentile}%
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const timeStringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getTickIntervalByRange = (start: string, end: string) => {
  const startMin = timeStringToMinutes(start);
  const endMin = timeStringToMinutes(end);
  const diff = endMin - startMin;
  if (diff >= 600) return 60;
  if (diff >= 360) return 30;
  if (diff >= 240) return 20;
  if (diff >= 180) return 12;
  return 10;
};

const formatXAxisTick = (
  value: string,
  isMobile: boolean,
  intervalMinutes: number,
) => {
  const parts = value.split(" - ");
  const time = parts[0];
  const [, minutes] = time.split(":");
  if (parseInt(minutes, 10) % intervalMinutes === 0) {
    return time;
  }
  return "";
};
