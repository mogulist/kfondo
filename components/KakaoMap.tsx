"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Expand, Locate } from "lucide-react";

export type KakaoMapPoi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
};

/** 지도 뷰포트 범위 (남·서·북·동). API 검색 시 사용 */
export type KakaoMapViewBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type KakaoMapProps = {
  width?: string;
  height?: string;
  /** 각 polyline은 [lat, lng][] 배열 */
  polylines?: [number, number][][];
  /** 고도 그래프 등에서 하이라이트할 위치. [lat, lng] 또는 null */
  highlightPosition?: [number, number] | null;
  /** 보급소·숙소 등 POI 마커 (편의점 CS2, 숙박 AD5) */
  pois?: KakaoMapPoi[];
  /** 줌 레벨·뷰포트 변경 시 호출 (줌 레벨 1~14, 작을수록 줌인) */
  onMapStateChange?: (zoomLevel: number, bounds: KakaoMapViewBounds | null) => void;
};

const DEFAULT_CENTER = { lat: 35.9, lng: 128.0 };
const HIGHLIGHT_MARKER_SIZE = 16;
const HIGHLIGHT_MARKER_COLOR = "#10b981";

function highlightCircleMarkerHtml(size: number): string {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${HIGHLIGHT_MARKER_COLOR};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`;
}

const DEFAULT_LEVEL = 8;
const SCRIPT_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
const STROKE_COLOR = "#fb7185";
const STROKE_WEIGHT = 4;

/** 카카오맵 공식 예제 이미지: 편의점/주차장/커피 등 카테고리 스프라이트 */
const POI_IMAGE_CATEGORY =
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png";
/** 카카오맵 공식 예제: 빨간 핀 (숙박 등 구분용) */
const POI_IMAGE_MARKER_RED =
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png";

function poiInfowindowHtml(name: string, address: string): string {
  return `<div style="padding:8px 10px;min-width:120px;max-width:220px;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;line-height:1.4;">
  <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(name)}</div>
  <div style="color:#6b7280;">${escapeHtml(address)}</div>
</div>`;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function KakaoMap({
  width = "100%",
  height = "100%",
  polylines,
  highlightPosition = null,
  pois,
  onMapStateChange,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const polylineInstancesRef = useRef<{ setMap: (m: null) => void }[]>([]);
  const highlightOverlayRef = useRef<{ setMap: (m: null) => void } | null>(null);
  const poiMarkersRef = useRef<{ setMap: (m: null) => void }[]>([]);
  const poiInfowindowsRef = useRef<unknown[]>([]);
  const poiInfowindowOpenRef = useRef<{ close: () => void } | null>(null);
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

  useEffect(() => {
    if (!isMapLoaded || !window.kakao?.maps || !mapRef.current) return;
    const map = mapRef.current as unknown;
    const prev = highlightOverlayRef.current;
    if (prev?.setMap) prev.setMap(null);
    highlightOverlayRef.current = null;
    if (highlightPosition) {
      const [lat, lng] = highlightPosition;
      const { maps } = window.kakao;
      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(lat, lng),
        content: highlightCircleMarkerHtml(HIGHLIGHT_MARKER_SIZE),
        xAnchor: 0.5,
        yAnchor: 0.5,
      });
      overlay.setMap(map as Parameters<typeof overlay.setMap>[0]);
      highlightOverlayRef.current = overlay;
    }
  }, [isMapLoaded, highlightPosition]);

  useEffect(() => {
    poiInfowindowOpenRef.current?.close();
    poiInfowindowOpenRef.current = null;
    poiMarkersRef.current.forEach((m) => m.setMap(null));
    poiMarkersRef.current = [];
    poiInfowindowsRef.current = [];

    if (!isMapLoaded || !window.kakao?.maps || !mapRef.current || !pois?.length) return;

    const map = mapRef.current as unknown;
    const { maps } = window.kakao;

    pois.forEach((poi) => {
      const latlng = new maps.LatLng(poi.lat, poi.lng);

      const isConvenience = poi.category === "CS2";
      const isLodging = poi.category === "AD5";

      let markerImage: unknown;
      if (isConvenience) {
        const imageSize = new maps.Size(22, 26);
        const imageOptions = {
          spriteOrigin: new maps.Point(10, 36),
          spriteSize: new maps.Size(36, 98),
        };
        markerImage = new maps.MarkerImage(POI_IMAGE_CATEGORY, imageSize, imageOptions);
      } else if (isLodging) {
        const imageSize = new maps.Size(64, 69);
        const imageOptions = { offset: new maps.Point(27, 69) };
        markerImage = new maps.MarkerImage(POI_IMAGE_MARKER_RED, imageSize, imageOptions);
      } else {
        const imageSize = new maps.Size(22, 26);
        markerImage = new maps.MarkerImage(POI_IMAGE_CATEGORY, imageSize, {
          spriteOrigin: new maps.Point(10, 36),
          spriteSize: new maps.Size(36, 98),
        });
      }

      const marker = new maps.Marker({
        position: latlng,
        image: markerImage,
      });
      marker.setMap(map as Parameters<typeof marker.setMap>[0]);
      poiMarkersRef.current.push(marker);

      const iwContent = poiInfowindowHtml(poi.name, poi.address ?? "");
      const infowindow = new maps.InfoWindow({
        position: latlng,
        content: iwContent,
      });
      poiInfowindowsRef.current.push(infowindow);

      maps.event.addListener(marker, "click", () => {
        poiInfowindowOpenRef.current?.close();
        (infowindow as { open: (m: unknown, marker?: unknown) => void }).open(map, marker);
        poiInfowindowOpenRef.current = infowindow;
      });
    });
  }, [isMapLoaded, pois]);

  useEffect(() => {
    if (!isMapLoaded || !containerRef.current || !mapRef.current) return;
    const map = mapRef.current as { relayout?: () => void };
    if (typeof map.relayout !== "function") return;
    const observer = new ResizeObserver(() => {
      map.relayout?.();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMapLoaded]);

  useEffect(() => {
    if (!isMapLoaded || !onMapStateChange || !window.kakao?.maps || !mapRef.current) return;
    const map = mapRef.current as {
      getLevel?: () => number;
      getBounds?: () => {
        getSouthWest?: () => { getLat: () => number; getLng: () => number };
        getNorthEast?: () => { getLat: () => number; getLng: () => number };
      };
    };
    const sync = () => {
      const level = map.getLevel?.() ?? DEFAULT_LEVEL;
      const b = map.getBounds?.();
      if (!b?.getSouthWest?.() || !b?.getNorthEast?.()) {
        onMapStateChange(level, null);
        return;
      }
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      onMapStateChange(level, {
        south: sw.getLat(),
        west: sw.getLng(),
        north: ne.getLat(),
        east: ne.getLng(),
      });
    };
    sync();
    const { event } = window.kakao.maps;
    event.addListener(map, "idle", sync);
    return () => {
      window.kakao?.maps?.event.removeListener(map, "idle", sync);
    };
  }, [isMapLoaded, onMapStateChange]);

  const computeBounds = useCallback(() => {
    if (!polylines?.length || !window.kakao?.maps) return null;
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
    if (minLat === Infinity) return null;
    const bounds = new maps.LatLngBounds();
    bounds.extend(new maps.LatLng(minLat, minLng));
    bounds.extend(new maps.LatLng(maxLat, maxLng));
    return bounds;
  }, [polylines]);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current as { getLevel?: () => number; setLevel?: (n: number) => void } | null;
    if (!map?.getLevel || !map?.setLevel) return;
    const level = map.getLevel();
    map.setLevel(Math.max(1, level - 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current as { getLevel?: () => number; setLevel?: (n: number) => void } | null;
    if (!map?.getLevel || !map?.setLevel) return;
    const level = map.getLevel();
    map.setLevel(Math.min(14, level + 1));
  }, []);

  const handleCenterOnMarker = useCallback(() => {
    const map = mapRef.current as { setCenter?: (l: unknown) => void } | null;
    const maps = window.kakao?.maps;
    if (!map?.setCenter || !highlightPosition || !maps) return;
    const [lat, lng] = highlightPosition;
    map.setCenter(new maps.LatLng(lat, lng));
  }, [highlightPosition]);

  const handleFitCourse = useCallback(() => {
    const map = mapRef.current as { setBounds?: (b: unknown) => void } | null;
    const bounds = computeBounds();
    if (!map?.setBounds || !bounds) return;
    map.setBounds(bounds);
  }, [computeBounds]);

  return (
    <div className="relative w-full h-full" style={{ width, height }}>
      <div ref={containerRef} className="w-full h-full min-h-0" />
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
          <button
            type="button"
            onClick={handleCenterOnMarker}
            disabled={!highlightPosition}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            aria-label="마커로 이동"
          >
            <Locate className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleFitCourse}
            disabled={!polylines?.length}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded shadow hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            aria-label="전체 코스 보기"
          >
            <Expand className="size-4" />
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
