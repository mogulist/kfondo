"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import type {
  Event,
  EventV2,
  EventYearDetail,
  RaceCategory,
} from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Mountain, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type EventCardProps = {
  event: Event | EventV2;
};

export function EventCard({ event }: EventCardProps) {
  // 타입 가드
  const isV2 = (e: any): e is EventV2 => "yearDetails" in e;
  const isReady = event.status === "ready";

  // V2용 최신 연도 정보 추출
  let latestYearDetail: EventYearDetail | undefined = undefined;
  if (isV2(event)) {
    const years = event.years;
    const latestYear = Math.max(...years);
    latestYearDetail = event.yearDetails[latestYear];
  }

  const hasLatestEventInfo = !isV2(event)
    ? !!event.latestEvent
    : !!latestYearDetail;

  // 상세 페이지로 이동 가능한지 여부에 따라 다른 컴포넌트 사용
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isReady) {
      return <Link href={`/${event.id}`}>{children}</Link>;
    }
    return <div>{children}</div>;
  };

  return (
    <CardWrapper>
      <motion.div
        whileHover={isReady ? { y: -5 } : undefined}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className={`overflow-hidden h-auto ${
            isReady ? "cursor-pointer" : ""
          }`}
        >
          <CardContent className="p-0 h-full">
            <div
              className={`h-full flex flex-col text-white ${
                hasLatestEventInfo ? "pb-4" : ""
              } relative`}
              style={{
                backgroundImage: isReady
                  ? event.color
                    ? `linear-gradient(to bottom right, ${event.color.from}, ${event.color.to})`
                    : undefined
                  : "linear-gradient(to bottom right, #94a3b8, #64748b)",
              }}
            >
              {!isReady && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    variant="outline"
                    className="bg-background/30 text-white border-white/20 text-xs"
                  >
                    준비중
                  </Badge>
                </div>
              )}

              <div className="flex-1 flex items-center justify-center py-8">
                <h2 className="text-4xl font-bold tracking-tight">
                  {event.location}
                </h2>
              </div>

              {hasLatestEventInfo && (
                <div className="border-t border-white/20 pt-4 px-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {!isV2(event)
                          ? event.latestEvent?.date
                          : latestYearDetail?.date}
                      </span>
                    </div>
                    <div className="text-xs opacity-80">
                      {event.years.length}년 데이터
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {!isV2(event) ? (
                      <>
                        <div className="bg-white/10 p-2 rounded text-xs">
                          <div className="font-medium">그란폰도</div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span>
                              {event.latestEvent?.granFondo.distance}km
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mountain className="h-3.5 w-3.5" />
                            <span>
                              {event.latestEvent?.granFondo.elevation}m
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded text-xs">
                          <div className="font-medium">메디오폰도</div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span>
                              {event.latestEvent?.medioFondo.distance}km
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mountain className="h-3.5 w-3.5" />
                            <span>
                              {event.latestEvent?.medioFondo.elevation}m
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      latestYearDetail?.courses.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-white/10 p-2 rounded text-xs"
                        >
                          <div className="font-medium">{cat.name}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span>{cat.distance}km</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mountain className="h-3.5 w-3.5" />
                            <span>{cat.elevation}m</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {!hasLatestEventInfo && (
                <div className="absolute bottom-4 right-4 text-sm opacity-80">
                  {event.years.length}년 데이터
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </CardWrapper>
  );
}
