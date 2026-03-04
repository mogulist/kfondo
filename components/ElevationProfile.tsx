"use client";

import { useCallback } from "react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import type { GpxPointWithDistance } from "@/lib/gpx";

type ElevationProfileProps = {
  data: GpxPointWithDistance[];
  onPositionChange: (index: number | null) => void;
  /** 부모에서 제어하는 현재 위치 인덱스 (슬라이더 등 터치 조작 시 사용) */
  positionIndex?: number | null;
};


function computeElevationStats(
  data: GpxPointWithDistance[]
): { gain: number; loss: number } | null {
  let gain = 0;
  let loss = 0;
  let prev: number | null = null;
  for (const p of data) {
    if (p.ele == null) continue;
    if (prev != null) {
      const d = p.ele - prev;
      if (d > 0) gain += d;
      else loss += -d;
    }
    prev = p.ele;
  }
  return prev != null ? { gain, loss } : null;
}

export function ElevationProfile({
  data,
  onPositionChange,
  positionIndex = null,
}: ElevationProfileProps) {
  const handleChartMouseMove = useCallback(
    (state: { activeTooltipIndex?: number }) => {
      if (state.activeTooltipIndex != null) {
        onPositionChange(state.activeTooltipIndex);
      }
    },
    [onPositionChange]
  );

  const handleChartMouseLeave = useCallback(() => {
    onPositionChange(null);
  }, [onPositionChange]);

  if (data.length === 0) return null;

  const chartData = data.map((p) => ({
    distanceKm: Math.round(p.distanceKm * 100) / 100,
    ele: p.ele ?? 0,
  }));

  const totalKm = data[data.length - 1].distanceKm;
  const stats = computeElevationStats(data);
  const hasElevation = data.some((p) => p.ele != null);

  return (
    <div className="w-full h-full min-h-[120px] flex flex-col">
      {stats && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
          <span>{totalKm.toFixed(1)} km</span>
          <span>+{Math.round(stats.gain)} m</span>
          <span>-{Math.round(stats.loss)} m</span>
        </div>
      )}
      {!hasElevation && (
        <p className="text-xs text-muted-foreground mb-1">고도 데이터 없음 (거리 기준 위치만 연동)</p>
      )}
      <div className="flex-1 min-h-0 w-full">
        <ChartContainer
          config={{
            ele: {
              label: "고도 (m)",
              theme: {
                light: "oklch(0.65 0.15 165)",
                dark: "oklch(0.7 0.14 165)",
              },
            },
          }}
          className="h-full w-full aspect-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="distanceKm"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => `${v} km`}
                fontSize={11}
              />
              <YAxis
                dataKey="ele"
                type="number"
                tickFormatter={(v) => `${v}`}
                fontSize={11}
                width={36}
                label={{ value: "m", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="text-foreground"
                    formatter={(value: unknown) =>
                      typeof value === "number"
                        ? [`${value} m`, "고도"]
                        : ["—", "고도"]
                    }
                    labelFormatter={(_value, payload) => {
                      const km =
                      (payload?.[0] as { payload?: { distanceKm?: number } })
                        ?.payload?.distanceKm;
                      return km != null
                        ? `${Number(km).toFixed(2)} km`
                        : "";
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="ele"
                stroke="var(--color-ele)"
                fill="var(--color-ele)"
                fillOpacity={0.35}
                isAnimationActive={false}
                activeDot={false}
              />
              {positionIndex != null &&
                chartData[positionIndex] != null && (
                  <>
                    <ReferenceLine
                      x={chartData[positionIndex].distanceKm}
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                    />
                    <ReferenceDot
                      x={chartData[positionIndex].distanceKm}
                      y={chartData[positionIndex].ele}
                      r={5}
                      fill="hsl(var(--primary))"
                      stroke="white"
                      strokeWidth={2}
                    />
                  </>
                )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
