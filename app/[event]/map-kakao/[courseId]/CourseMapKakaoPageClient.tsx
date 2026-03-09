"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Maximize2, Minimize2, Mountain, Route } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  KakaoMap,
  type KakaoMapPoi,
  type KakaoMapViewBounds,
} from "@/components/KakaoMap";
import { ElevationProfile } from "@/components/ElevationProfile";
import { Slider } from "@/components/ui/slider";
import { useMobile } from "@/hooks/use-mobile";
import {
  fetchGpxAsPointsWithDistance,
  findNearestIndexByDistance,
} from "@/lib/gpx";
import type { GpxPointWithDistance } from "@/lib/gpx";
import type { KakaoLocalPlace } from "@/lib/kakao-local";

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
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<KakaoLocalPlace[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<KakaoMapViewBounds | null>(null);
  const isMobile = useMobile();

  /** 기본 줌 8에서 +3 줌인 = 5. 이 레벨 이상(숫자 이하)일 때만 숙소 찾기 활성화 */
  const LODGING_SEARCH_MIN_ZOOM_LEVEL = 6;
  const canSearchLodging =
    mapZoomLevel != null &&
    mapZoomLevel <= LODGING_SEARCH_MIN_ZOOM_LEVEL &&
    routePoints.length > 0;

  const handleMapStateChange = useCallback(
    (zoomLevel: number, bounds: KakaoMapViewBounds | null) => {
      setMapZoomLevel(zoomLevel);
      setMapBounds(bounds);
    },
    []
  );

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
  const pois: KakaoMapPoi[] =
    nearbyPlaces?.map((p) => ({
      id: p.id,
      name: p.place_name,
      lat: Number.parseFloat(p.y),
      lng: Number.parseFloat(p.x),
      category: p.category_group_code,
      address: p.address_name || undefined,
    })) ?? [];
  const highlightPosition: [number, number] | null =
    highlightedIndex != null && routePoints[highlightedIndex]
      ? [routePoints[highlightedIndex].lat, routePoints[highlightedIndex].lng]
      : null;

  const minKm = routePoints[0]?.distanceKm ?? 0;
  const maxKm = routePoints[routePoints.length - 1]?.distanceKm ?? 0;
  const sliderValue =
    highlightedIndex != null && routePoints[highlightedIndex]
      ? ((routePoints[highlightedIndex].distanceKm - minKm) / (maxKm - minKm || 1)) * 100
      : 0;

  const handleSliderChange = (value: number[]) => {
    const ratio = Math.max(0, Math.min(1, value[0] / 100));
    const distanceKm = minKm + ratio * (maxKm - minKm);
    const index = findNearestIndexByDistance(routePoints, distanceKm);
    setHighlightedIndex(index);
  };

  const handleSearchNearby = async () => {
    setNearbyLoading(true);
    setNearbyError(null);
    try {
      const body: { routePoints: typeof routePoints; bounds?: KakaoMapViewBounds } =
        { routePoints };
      if (mapBounds) body.bounds = mapBounds;
      const res = await fetch("/api/nearby-pois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        places?: KakaoLocalPlace[];
        error?: string;
        message?: string;
      };
      if (res.status === 429) {
        toast.error(data.message ?? "API 쿼터 제한에 걸렸습니다. 잠시 후 다시 시도해 주세요.");
        setNearbyPlaces(null);
        setNearbyError(null);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? data.message ?? "검색 실패");
      setNearbyPlaces(data.places ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "검색 실패";
      setNearbyError(msg);
      setNearbyPlaces(null);
      console.error("[보급소·숙소 검색]", e);
    } finally {
      setNearbyLoading(false);
    }
  };

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
              <div className="flex flex-col h-full min-h-0 w-full">
                <div className="flex-1 min-h-0 w-full">
                  <KakaoMap
                    width="100%"
                    height="100%"
                    polylines={polylines}
                    highlightPosition={highlightPosition}
                    pois={pois}
                    onMapStateChange={handleMapStateChange}
                  />
                </div>
                <div className="shrink-0 border-t border-border bg-card px-3 py-2 min-h-[140px] h-[22dvh] max-h-[200px] flex flex-col min-h-0">
                  <div className="shrink-0 mb-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground" aria-hidden>
                      줌 {mapZoomLevel ?? "—"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchNearby}
                      disabled={nearbyLoading || !canSearchLodging}
                      className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {nearbyLoading ? "검색 중..." : "숙소 찾기"}
                    </button>
                    {nearbyError && (
                      <span className="text-sm text-red-600">{nearbyError}</span>
                    )}
                    {nearbyPlaces != null && (
                      <span className="text-sm text-muted-foreground">
                        숙박 {nearbyPlaces.length}개
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ElevationProfile
                      data={routePoints}
                      onPositionChange={setHighlightedIndex}
                      positionIndex={highlightedIndex}
                      isMobile={isMobile}
                    />
                  </div>
                  {isMobile && (
                    <div className="shrink-0 mt-2 flex w-full">
                      <div className="w-9 shrink-0" />
                      <div className="flex-1 min-w-0 pr-2 flex flex-col gap-1">
                        {highlightedIndex != null && routePoints[highlightedIndex] != null && (
                          <p className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Route className="size-3.5 shrink-0" aria-hidden />
                              <span>{routePoints[highlightedIndex].distanceKm.toFixed(2)} km</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Mountain className="size-3.5 shrink-0" aria-hidden />
                              <span>{routePoints[highlightedIndex].ele ?? 0} m</span>
                            </span>
                          </p>
                        )}
                        <Slider
                          value={[sliderValue]}
                          onValueChange={handleSliderChange}
                          max={100}
                          step={100 / Math.max(100, Math.min(routePoints.length, 2000))}
                          aria-label="코스 구간 위치 선택"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
