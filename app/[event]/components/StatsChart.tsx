"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import posthog from "posthog-js";
import { useMobile } from "@/hooks/use-mobile";
import type { EventYearStatsWithCourses, RaceCategory } from "@/lib/types";
import { DistributionChart } from "../../../components/distribution-chart";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { CourseViewSelect } from "./course-view-select";

const colors = ["hsl(215, 90%, 50%)", "hsl(150, 80%, 40%)", "hsl(0, 80%, 60%)"];

type Props = {
  statistics: EventYearStatsWithCourses[];
  eventId: string;
  courses?: RaceCategory[];
};

function formatCourseStatsLine(course: RaceCategory | undefined): string | null {
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

export const StatsChart = ({ statistics, eventId, courses }: Props) => {
  const isMobile = useMobile();

  if (!statistics || statistics.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {statistics.map((yearData) => {
        return (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            key={yearData.year}
          >
            <div className="flex w-full flex-col gap-12">
              {yearData.distributions.map((distribution, index) => {
                const start =
                  distribution.distribution[0]?.timeRange.split(" - ")[0];
                const end = distribution.distribution
                  .at(-1)
                  ?.timeRange.split(" - ")[0];
                const interval =
                  start && end ? getTickIntervalByRange(start, end) : 10;
                const color = colors[index];
                const courseMeta = courses?.find(
                  (c) => c.id === distribution.courseId,
                );
                const statsLine = formatCourseStatsLine(courseMeta);
                const findByRecordHref = `/find-by-record/${eventId}/${distribution.courseId}/${yearData.year}`;

                const toolbar = (
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
                );

                return (
                  <DistributionChart
                    key={distribution.courseId}
                    ariaLabel={`${distribution.courseName} ${yearData.year}년 기록 분포`}
                    toolbar={toolbar}
                    data={distribution.distribution}
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
      })}
    </div>
  );
};

// 툴팁 시간 범위를 명확하게 포맷팅하는 함수
const formatTooltipTimeRange = (timeRange: string, intervalMinutes = 2) => {
  // timeRange: "4:30 - 4:32" 형태
  const [start, end] = timeRange.split(" - ");
  // 시작 시간 파싱
  const startTime = dayjs(`2000-01-01 ${start.padStart(5, "0")}:00`);
  // interval 계산 (기존 구간의 분 차이, 기본값 2분)
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

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // label이 timeRange임
    const timeRange = formatTooltipTimeRange(
      label,
      payload[0]?.payload?.interval || 2
    );
    const participants = payload[0].value;
    const percentile = payload[0].payload.percentile; // 누적 %
    const cumulativeCount = payload[0].payload.cumulativeCount; // 누적 명수

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

// 시간 문자열("4:00" 등)을 분 단위로 변환
const timeStringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 분포의 시작~끝 시간 차이에 따라 interval 결정
const getTickIntervalByRange = (start: string, end: string) => {
  const startMin = timeStringToMinutes(start);
  const endMin = timeStringToMinutes(end);
  const diff = endMin - startMin;
  if (diff >= 600) return 60; // 10시간 이상
  if (diff >= 360) return 30; // 6시간 이상
  if (diff >= 240) return 20; // 4시간 이상
  if (diff >= 180) return 12; // 3시간 이상
  return 10; // 그 외
};

const formatXAxisTick = (
  value: string,
  isMobile: boolean,
  intervalMinutes: number
) => {
  const parts = value.split(" - ");
  const time = parts[0];
  const [hours, minutes] = time.split(":");
  if (parseInt(minutes, 10) % intervalMinutes === 0) {
    return time;
  }
  return "";
};
