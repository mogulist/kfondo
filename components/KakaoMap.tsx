"use client";

import { useEffect, useRef, useState } from "react";

type KakaoMapProps = {
  width?: string;
  height?: string;
};

const DEFAULT_CENTER = { lat: 35.9, lng: 128.0 };
const DEFAULT_LEVEL = 8;
const SCRIPT_URL = "https://dapi.kakao.com/v2/maps/sdk.js";

export function KakaoMap({
  width = "100%",
  height = "100%",
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
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
