"use client";

import { useEffect, useState } from "react";
import { NaverMap } from "@/components/NaverMap";
import { ElevationProfile } from "@/components/ElevationProfile";
import { fetchGpxAsPointsWithDistance } from "@/lib/gpx";
import type { GpxPointWithDistance } from "@/lib/gpx";

type CourseMapClientProps = {
  gpxBlobUrl: string;
};

export function CourseMapClient({ gpxBlobUrl }: CourseMapClientProps) {
  const [routePoints, setRoutePoints] = useState<GpxPointWithDistance[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGpxAsPointsWithDistance(gpxBlobUrl)
      .then((points) => {
        if (!cancelled && points.length > 0) {
          setRoutePoints(points);
        } else if (!cancelled) {
          setError("경로 포인트를 찾을 수 없습니다.");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "경로 로드 실패");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gpxBlobUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100">
        <span className="text-gray-600">경로를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const polylines: [number, number][][] = [
    routePoints.map((p) => [p.lat, p.lng] as [number, number]),
  ];
  const highlightPosition: [number, number] | null =
    highlightedIndex != null && routePoints[highlightedIndex]
      ? [routePoints[highlightedIndex].lat, routePoints[highlightedIndex].lng]
      : null;

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex-1 min-h-0 w-full">
        <NaverMap
          polylines={polylines}
          highlightPosition={highlightPosition}
          width="100%"
          height="100%"
        />
      </div>
      <div className="shrink-0 border-t border-border bg-card px-3 py-2 min-h-[140px] h-[22dvh] max-h-[200px]">
        <ElevationProfile
          data={routePoints}
          onPositionChange={setHighlightedIndex}
        />
      </div>
    </div>
  );
}
