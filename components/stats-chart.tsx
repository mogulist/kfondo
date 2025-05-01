"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import type { EventYearStats } from "@/lib/types";

interface StatsChartProps {
  yearStats: EventYearStats[];
}

// 커스텀 범례 렌더러
const CustomLegend = (props: any) => {
  const { payload } = props;
  const isMobile = useMobile();

  if (!payload || payload.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap ${
        isMobile
          ? "justify-start gap-2 text-xs"
          : "justify-center gap-4 text-sm"
      } mt-2`}
    >
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timeRange = label; // 시간 범위
    const participants = payload[0].value; // 참가자 수
    const percentile = payload[0].payload.percentile; // 백분위

    return (
      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
        <div className="space-y-1">
          <div className="text-foreground font-medium">{timeRange}</div>
          <div className="text-foreground">{participants}명</div>
          <div className="text-foreground">{percentile}%</div>
        </div>
      </div>
    );
  }

  return null;
};

function getTickInterval(distributionLength: number, chartWidth: number = 600) {
  // 한 레이블당 최소 40px 필요하다고 가정
  const maxTicks = Math.floor(chartWidth / 40);
  if (distributionLength <= maxTicks) return 10; // 10분 단위
  if (distributionLength <= maxTicks * 1.5) return 15; // 15분 단위
  return 20; // 20분 단위
}

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

export function StatsChart({ yearStats }: StatsChartProps) {
  const isMobile = useMobile();
  const isTablet = useMobile(1024);
  const chartWidth = 600; // 고정값, 필요시 useRef로 측정 가능

  if (!yearStats || yearStats.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {yearStats.map((stats) => {
        const maxLen = Math.max(
          stats.granFondoDistribution.length,
          stats.medioFondoDistribution.length
        );
        const intervalMinutes = getTickInterval(maxLen, chartWidth);
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
              <div
                className={`${
                  isMobile ? "h-[350px]" : "h-full"
                } w-full border-r-0 sm:border-r sm:pr-4 border-border/30`}
              >
                <h3 className="text-lg font-medium mb-4">
                  그란폰도 ({stats.year}년)
                </h3>
                <div
                  className={`h-[calc(100%-2rem)] w-full${
                    isMobile
                      ? " overflow-x-auto overscroll-contain touch-pan-x"
                      : ""
                  }`}
                >
                  <ChartContainer
                    config={{
                      participants: {
                        label: "참가자 수",
                        color: "hsl(215, 90%, 50%)",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.granFondoDistribution}
                        margin={{
                          top: 10,
                          right: isMobile ? 10 : 30,
                          left: isMobile ? 0 : 0,
                          bottom: isMobile ? 10 : 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timeRange"
                          angle={-45}
                          textAnchor="end"
                          height={isMobile ? 80 : 70}
                          tick={{ fontSize: isMobile ? 11 : 12 }}
                          tickFormatter={(value) =>
                            formatXAxisTick(value, isMobile, intervalMinutes)
                          }
                          interval={0}
                          minTickGap={0}
                          label={{
                            value: "기록",
                            position: "insideBottom",
                            offset: 20,
                            style: { textAnchor: "middle" },
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: isMobile ? 11 : 12 }}
                          width={isMobile ? 40 : 40}
                          label={{
                            value: "인원",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          name="참가자 수"
                          dataKey="participants"
                          stroke="var(--color-participants)"
                          fill="var(--color-participants)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div
                className={`${
                  isMobile ? "h-[350px]" : "h-full"
                } w-full sm:pl-4`}
              >
                <h3 className="text-lg font-medium mb-4">
                  메디오폰도 ({stats.year}년)
                </h3>
                <div
                  className={`h-[calc(100%-2rem)] w-full${
                    isMobile
                      ? " overflow-x-auto overscroll-contain touch-pan-x"
                      : ""
                  }`}
                >
                  <ChartContainer
                    config={{
                      participants: {
                        label: "참가자 수",
                        color: "hsl(150, 80%, 40%)",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.medioFondoDistribution}
                        margin={{
                          top: 10,
                          right: isMobile ? 10 : 30,
                          left: isMobile ? 0 : 0,
                          bottom: isMobile ? 10 : 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timeRange"
                          angle={-45}
                          textAnchor="end"
                          height={isMobile ? 80 : 70}
                          tick={{ fontSize: isMobile ? 11 : 12 }}
                          tickFormatter={(value) =>
                            formatXAxisTick(value, isMobile, intervalMinutes)
                          }
                          interval={0}
                          minTickGap={0}
                          label={{
                            value: "기록",
                            position: "insideBottom",
                            offset: 20,
                            style: { textAnchor: "middle" },
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: isMobile ? 11 : 12 }}
                          width={isMobile ? 40 : 40}
                          label={{
                            value: "인원",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          name="참가자 수"
                          dataKey="participants"
                          stroke="var(--color-participants)"
                          fill="var(--color-participants)"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
