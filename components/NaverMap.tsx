"use client";

import { useEffect, useRef, useState } from "react";
import type { NaverMapInstance } from "@/types/naver-maps";

type NaverMapProps = {
  width?: string;
  height?: string;
  /** 각 polyline은 [lat, lng][] 배열. 그리기 후 fitBounds 적용 */
  polylines?: [number, number][][];
};

const DEFAULT_CENTER = { lat: 35.9, lng: 128.0 };
const DEFAULT_ZOOM = 8;
const STROKE_COLOR = "#3388ff";
const STROKE_WEIGHT = 4;
const BOUNDS_PADDING_FACTOR = 1.2;

export function NaverMap({
  width = "100%",
  height = "100%",
  polylines,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);
  const polylineInstancesRef = useRef<unknown[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const clientId =
      process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "YOUR_NAVER_CLIENT_ID";

    if (typeof window !== "undefined" && window.naver?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => initMap();
    script.onerror = () => {
      console.error("네이버맵 API 스크립트 로드 실패");
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  function initMap() {
    if (!mapRef.current || !window.naver?.maps) return;
    try {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng
        ),
        zoom: DEFAULT_ZOOM,
      } as Record<string, unknown>) as unknown as NaverMapInstance;
      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    } catch (error) {
      console.error("네이버맵 초기화 실패:", error);
    }
  }

  useEffect(() => {
    if (!isMapLoaded || !window.naver?.maps || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const maps = window.naver.maps;

    polylineInstancesRef.current.forEach((p) => {
      const poly = p as { setMap: (m: null) => void };
      if (poly?.setMap) poly.setMap(null);
    });
    polylineInstancesRef.current = [];

    if (polylines?.length) {
      polylines.forEach((path) => {
        if (path.length === 0) return;
        const latlngs = path.map(
          ([lat, lng]) => new maps.LatLng(lat, lng) as unknown
        );
        const polyline = new maps.Polyline({
          path: latlngs,
          map: map as unknown,
          strokeColor: STROKE_COLOR,
          strokeWeight: STROKE_WEIGHT,
        });
        polylineInstancesRef.current.push(polyline);
      });
    }
  }, [isMapLoaded, polylines]);

  useEffect(() => {
    if (!isMapLoaded || !window.naver?.maps || !mapInstanceRef.current) return;
    if (!polylines?.length) return;
    const map = mapInstanceRef.current;
    const maps = window.naver.maps;
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
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const spanLat = Math.max(maxLat - minLat, 0.001);
    const spanLng = Math.max(maxLng - minLng, 0.001);
    const padLat = (spanLat * BOUNDS_PADDING_FACTOR) / 2;
    const padLng = (spanLng * BOUNDS_PADDING_FACTOR) / 2;
    const paddedBounds = new maps.LatLngBounds();
    paddedBounds.extend(
      new maps.LatLng(centerLat - padLat, centerLng - padLng) as unknown
    );
    paddedBounds.extend(
      new maps.LatLng(centerLat + padLat, centerLng + padLng) as unknown
    );
    map.fitBounds(paddedBounds);
  }, [isMapLoaded, polylines]);

  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (!map?.getZoom || !map?.setZoom) return;
    map.setZoom(Math.min(21, map.getZoom() + 1));
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (!map?.getZoom || !map?.setZoom) return;
    map.setZoom(Math.max(1, map.getZoom() - 1));
  };

  return (
    <div className="relative w-full h-full" style={{ width, height }}>
      <div ref={mapRef} className="w-full h-full min-h-0" />
      {isMapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-gray-700"
            aria-label="줌 인"
          >
            <span className="text-lg font-medium leading-none">+</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-gray-700"
            aria-label="줌 아웃"
          >
            <span className="text-lg font-medium leading-none">−</span>
          </button>
        </div>
      )}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-600">지도를 로딩 중...</span>
        </div>
      )}
    </div>
  );
}
