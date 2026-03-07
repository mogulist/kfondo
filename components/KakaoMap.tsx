"use client";

import { useEffect, useRef, useState } from "react";

type KakaoMapProps = {
  width?: string;
  height?: string;
  /** 각 polyline은 [lat, lng][] 배열 */
  polylines?: [number, number][][];
};

const DEFAULT_CENTER = { lat: 35.9, lng: 128.0 };
const DEFAULT_LEVEL = 8;
const SCRIPT_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
const STROKE_COLOR = "#fb7185";
const STROKE_WEIGHT = 4;
export function KakaoMap({
  width = "100%",
  height = "100%",
  polylines,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const polylineInstancesRef = useRef<{ setMap: (m: null) => void }[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const appKey =
      process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "";

    const initMap = () => {
      if (!containerRef.current || !window.kakao?.maps) return;
      try {
        window.kakao.maps.load(() => {
          if (!containerRef.current || !window.kakao?.maps) return;
          const options = {
            center: new window.kakao.maps.LatLng(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
            ),
            level: DEFAULT_LEVEL,
          };
          const map = new window.kakao.maps.Map(
            containerRef.current,
            options,
          );
          mapRef.current = map;
          setIsMapLoaded(true);
        });
      } catch (error) {
        console.error("카카오맵 초기화 실패:", error);
      }
    };

    if (typeof window !== "undefined" && window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `${SCRIPT_URL}?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => initMap();
    script.onerror = () => {
      console.error("카카오맵 API 스크립트 로드 실패");
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !window.kakao?.maps || !mapRef.current) return;
    const map = mapRef.current as { setMap?: unknown };
    polylineInstancesRef.current.forEach((p) => p.setMap(null));
    polylineInstancesRef.current = [];

    if (polylines?.length) {
      const { maps } = window.kakao;
      polylines.forEach((path) => {
        if (path.length === 0) return;
        const latlngs = path.map(
          ([lat, lng]) => new maps.LatLng(lat, lng),
        );
        const polyline = new maps.Polyline({
          path: latlngs,
          strokeWeight: STROKE_WEIGHT,
          strokeColor: STROKE_COLOR,
          strokeOpacity: 1,
          strokeStyle: "solid",
        });
        polyline.setMap(map as Parameters<typeof polyline.setMap>[0]);
        polylineInstancesRef.current.push(polyline);
      });
    }
  }, [isMapLoaded, polylines]);

  useEffect(() => {
    if (!isMapLoaded || !window.kakao?.maps || !mapRef.current) return;
    if (!polylines?.length) return;
    const map = mapRef.current as { setBounds?: (b: unknown, p?: unknown) => void };
    const { maps } = window.kakao;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    polylines.forEach((path) => {
      path.forEach(([lat, lng]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
    });
    if (minLat === Infinity) return;
    const bounds = new maps.LatLngBounds();
    bounds.extend(new maps.LatLng(minLat, minLng));
    bounds.extend(new maps.LatLng(maxLat, maxLng));
    if (typeof map.setBounds === "function") {
      map.setBounds(bounds);
    }
  }, [isMapLoaded, polylines]);

  return (
    <div className="relative w-full h-full" style={{ width, height }}>
      <div ref={containerRef} className="w-full h-full min-h-0" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-600">지도를 로딩 중...</span>
        </div>
      )}
    </div>
  );
}
