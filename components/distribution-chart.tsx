import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type DistributionChartProps = {
  title: string;
  data: any[];
  color: string;
  interval: number;
  isMobile: boolean;
  comment?: string;
  formatXAxisTick: (
    value: string,
    isMobile: boolean,
    interval: number
  ) => string;
  CustomTooltip: React.FC<any>;
  eventId: string;
  course: string;
  year: number;
};

export function DistributionChart({
  title,
  data,
  color,
  interval,
  isMobile,
  comment,
  formatXAxisTick,
  CustomTooltip,
  eventId,
  course,
  year,
}: DistributionChartProps) {
  const findByRecordHref = `/find-by-record/${eventId}/${course}/${year}`;

  return (
    <div className={isMobile ? "h-[350px]" : "h-full w-full"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button asChild variant="outline" size="sm" className="ml-2 text-xs font-normal">
          <Link href={findByRecordHref}>
            기록 찾기
          </Link>
        </Button>
      </div>
      <div
        className={`h-[calc(100%-2rem)] w-full${
          isMobile ? " overflow-x-auto overscroll-contain touch-pan-x" : ""
        }`}
      >
        <ChartContainer
          config={{
            participants: {
              label: "참가자 수",
              color,
            },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 0,
                bottom: 20,
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
                  formatXAxisTick(value, isMobile, interval)
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
                stroke={color}
                fill={color}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        {comment && (
          <p className="text-xs text-muted-foreground mt-1 mb-8 text-center">
            {comment}
          </p>
        )}
      </div>
    </div>
  );
}
