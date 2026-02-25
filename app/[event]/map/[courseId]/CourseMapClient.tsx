"use client";

import { useEffect, useState } from "react";
import { NaverMap } from "@/components/NaverMap";
import { fetchGpxAsLatLngs } from "@/lib/gpx";

type CourseMapClientProps = {
  gpxBlobUrl: string;
};

export function CourseMapClient({ gpxBlobUrl }: CourseMapClientProps) {
  const [polylines, setPolylines] = useState<[number, number][][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGpxAsLatLngs(gpxBlobUrl)
      .then((points) => {
        if (!cancelled && points.length > 0) {
          setPolylines([points]);
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

  return (
    <div className="w-full h-full min-h-[70vh]">
      <NaverMap polylines={polylines} width="100%" height="100%" />
    </div>
  );
}
