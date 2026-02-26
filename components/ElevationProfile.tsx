"use client";

import { useRef, useCallback } from "react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { GpxPointWithDistance } from "@/lib/gpx";

type ElevationProfileProps = {
  data: GpxPointWithDistance[];
  onPositionChange: (index: number | null) => void;
};

function findNearestIndex(
  data: GpxPointWithDistance[],
  distanceKm: number
): number {
  if (data.length === 0) return 0;
  let low = 0;
  let high = data.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid].distanceKm <= distanceKm) low = mid;
    else high = mid;
  }
  const dl = Math.abs(data[low].distanceKm - distanceKm);
  const dh = Math.abs(data[high].distanceKm - distanceKm);
  return dl <= dh ? low : high;
}

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

export function ElevationProfile({ data, onPositionChange }: ElevationProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el || data.length === 0) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      if (width <= 0) return;
      const minKm = data[0].distanceKm;
      const maxKm = data[data.length - 1].distanceKm;
      const t = Math.max(0, Math.min(1, x / width));
      const distanceKm = minKm + t * (maxKm - minKm);
      const index = findNearestIndex(data, distanceKm);
      onPositionChange(index);
    },
    [data, onPositionChange]
  );

  const handleMouseLeave = useCallback(() => {
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
    <div
      ref={containerRef}
      className="w-full h-full min-h-[120px] flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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
                light: "oklch(0.646 0.222 41.116)",
                dark: "oklch(0.7 0.2 264)",
              },
            },
          }}
          className="h-full w-full aspect-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
