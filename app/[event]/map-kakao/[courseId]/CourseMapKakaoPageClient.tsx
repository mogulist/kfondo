"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import Header from "@/components/Header";

type CourseMapKakaoPageClientProps = {
  eventSlug: string;
  eventName: string;
  courseName: string;
  distanceLabel: string;
};

export function CourseMapKakaoPageClient({
  eventSlug,
  eventName,
  courseName,
  distanceLabel,
}: CourseMapKakaoPageClientProps) {
  const [fullscreen, setFullscreen] = useState(false);

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

            <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-[#fff9d9] px-6 text-center">
              <div className="max-w-md space-y-2">
                <p className="text-lg font-semibold text-slate-900">카카오맵 준비 중</p>
                <p className="text-sm text-slate-700">
                  Phase 1에서는 진입 페이지와 레이아웃만 먼저 연결했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
