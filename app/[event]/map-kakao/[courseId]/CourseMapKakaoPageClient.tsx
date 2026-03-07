"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import Header from "@/components/Header";
import { KakaoMap } from "@/components/KakaoMap";
import { fetchGpxAsPointsWithDistance } from "@/lib/gpx";
import type { GpxPointWithDistance } from "@/lib/gpx";

type CourseMapKakaoPageClientProps = {
  eventSlug: string;
  eventName: string;
  courseName: string;
  distanceLabel: string;
  gpxBlobUrl: string;
};

export function CourseMapKakaoPageClient({
  eventSlug,
  eventName,
  courseName,
  distanceLabel,
  gpxBlobUrl,
}: CourseMapKakaoPageClientProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [routePoints, setRoutePoints] = useState<GpxPointWithDistance[]>([]);
  const polylinesRef = useRef<[number, number][][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGpxAsPointsWithDistance(gpxBlobUrl)
      .then((points) => {
        if (!cancelled && points.length > 0) {
          setRoutePoints(points);
          polylinesRef.current = [
            points.map((p) => [p.lat, p.lng] as [number, number]),
          ];
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

  const polylines: [number, number][][] =
    routePoints.length > 0 ? polylinesRef.current ?? [] : [];

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  const mapWrapperNormal =
    "flex-1 min-h-0 w-full rounded-none md:rounded-xl border border-border overflow-hidden bg-card shadow-sm flex flex-col relative";
  const mapWrapperFullscreen =
    "fixed inset-0 z-50 overflow-hidden bg-background flex flex-col";
  const mapWrapperClassName = fullscreen ? mapWrapperFullscreen : mapWrapperNormal;

  return (
    <div className="flex flex-col h-dvh w-full">
      {!fullscreen && <Header />}
      <main className="flex-1 min-h-0 w-full max-w-full mx-auto flex flex-col py-4 px-0 md:px-4">
        {!fullscreen && (
          <div className="shrink-0 mb-3 flex items-center gap-3 px-4 md:px-0">
            <Link
              href={`/${eventSlug}`}
              className="inline-flex items-center justify-center size-9 rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground shrink-0"
              aria-label={`${eventName}(으)로 돌아가기`}
            >
              <ChevronLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">{eventName}</p>
              <h1 className="text-xl font-bold text-foreground truncate">
                {courseName}
                {distanceLabel}
              </h1>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 w-full flex flex-col">
          <div className={mapWrapperClassName}>
            {fullscreen ? (
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="absolute top-3 left-4 z-10 inline-flex items-center justify-center min-w-9 min-h-9 px-2.5 py-2 rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground shrink-0"
                aria-label="풀스크린 종료"
              >
                <Minimize2 className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="absolute top-3 left-4 z-10 inline-flex items-center justify-center min-w-9 min-h-9 px-2.5 py-2 rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground shrink-0"
                aria-label="풀스크린"
              >
                <Maximize2 className="size-4" />
              </button>
            )}

            {loading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100">
                <span className="text-gray-600">경로를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <KakaoMap width="100%" height="100%" polylines={polylines} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
