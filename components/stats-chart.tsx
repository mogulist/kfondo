"use client";

import { motion } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import type { EventYearStats } from "@/lib/types";
import { DistributionChart } from "./distribution-chart";
import dayjs from "dayjs";

type StatsChartProps = {
  yearStats: EventYearStats[];
};

export const StatsChart = ({ yearStats }: StatsChartProps) => {
  const isMobile = useMobile();
  const isTablet = useMobile(1024);

  if (!yearStats || yearStats.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {yearStats.map((stats) => {
        // granFondo 분포의 시작~끝 시간
        const granStart =
          stats.granFondoDistribution[0]?.timeRange.split(" - ")[0];

        const granEnd = stats.granFondoDistribution
          .at(-1)
          ?.timeRange.split(" - ")[0];

        const granInterval =
          granStart && granEnd
            ? getTickIntervalByRange(granStart, granEnd)
            : 10;

        // medioFondo 분포의 시작~끝 시간
        const medioStart =
          stats.medioFondoDistribution[0]?.timeRange.split(" - ")[0];

        const medioEnd = stats.medioFondoDistribution
          .at(-1)
          ?.timeRange.split(" - ")[0];

        const medioInterval =
          medioStart && medioEnd
            ? getTickIntervalByRange(medioStart, medioEnd)
            : 10;

        return (
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            key={stats.year}
          >
            <div
              className={`${
                isTablet ? "flex flex-col gap-8" : "grid grid-cols-2 gap-12"
              } h-full`}
            >
              <DistributionChart
                title={`그란폰도 (${stats.year}년)`}
                data={stats.granFondoDistribution}
                color="hsl(215, 90%, 50%)"
                interval={granInterval}
                isMobile={isMobile}
                formatXAxisTick={formatXAxisTick}
                CustomTooltip={CustomTooltip}
              />
              <DistributionChart
                title={`메디오폰도 (${stats.year}년)`}
                data={stats.medioFondoDistribution}
                color="hsl(150, 80%, 40%)"
                interval={medioInterval}
                isMobile={isMobile}
                formatXAxisTick={formatXAxisTick}
                CustomTooltip={CustomTooltip}
              />
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
