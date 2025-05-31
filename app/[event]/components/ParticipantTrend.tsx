"use client";

import type { EventYear } from "@/lib/types";
import { useRef, useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChartIcon, TableIcon } from "lucide-react";
import { CourseTrendSection } from "@/components/CourseTrendSection";

type Props = {
  eventData: EventYear[];
};

export function ParticipantTrend({ eventData }: Props) {
  const isMobile = useMobile();
  const isTablet = useMobile(1024); // 1024px 미만을 태블릿으로 간주
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewType, setViewType] = useState<"chart" | "table">("chart");

  const data = eventData.map((d) => ({
    year: d.year,
    granFondoRegistered: d.registered.granfondo,
    granFondoParticipants: d.participants.granfondo,
    granFondoDNF: d.dnf.granfondo,
    granFondoRate: (
      (d.participants.granfondo / d.registered.granfondo) *
      100
    ).toFixed(1),
    granFondoCompletionRate: d.dnf.granfondo
      ? (
          ((d.participants.granfondo - d.dnf.granfondo) /
            d.participants.granfondo) *
          100
        ).toFixed(1)
      : "100.0",
    medioFondoRegistered: d.registered.mediofondo,
    medioFondoParticipants: d.participants.mediofondo,
    medioFondoDNF: d.dnf.mediofondo,
    medioFondoRate: (
      (d.participants.mediofondo / d.registered.mediofondo) *
      100
    ).toFixed(1),
    medioFondoCompletionRate: d.dnf.mediofondo
      ? (
          ((d.participants.mediofondo - d.dnf.mediofondo) /
            d.participants.mediofondo) *
          100
        ).toFixed(1)
      : "100.0",
  }));

  // 연도 데이터를 내림차순으로 정렬 (최신 연도가 먼저 오도록)
  const sortedData = [...data].sort((a, b) => b.year - a.year);

  // 모바일에서의 차트 너비 계산
  const chartWidth = isMobile ? 100 : 120; // 각 연도별 차트의 너비 (간격 좁힘)
  const candidateWidth = sortedData.length * chartWidth;
  const totalWidth = candidateWidth < 360 ? 360 : candidateWidth; // 전체 스크롤 영역 너비

  return (
    <div className="h-full w-full">
      <div className="flex justify-end mb-4">
        <Tabs
          defaultValue="chart"
          className="w-[180px]"
          onValueChange={(value) => setViewType(value as "chart" | "table")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">
              <BarChartIcon className="h-4 w-4 mr-1" />
              <span>차트</span>
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-1" />
              <span>테이블</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className={`${
          isTablet ? "flex flex-col space-y-6" : "grid grid-cols-2 gap-8"
        } px-4`}
      >
        <CourseTrendSection
          title="그란폰도"
          data={sortedData.map((d) => ({
            year: d.year,
            registered: d.granFondoRegistered,
            participants: d.granFondoParticipants,
            dnf: d.granFondoDNF,
            rate: d.granFondoRate,
            completionRate: d.granFondoCompletionRate,
          }))}
          viewType={viewType}
          isMobile={isMobile}
          isTablet={isTablet}
          scrollRef={scrollRef}
          totalWidth={totalWidth}
          config={{
            registered: { label: "등록자", color: "hsl(215, 90%, 80%)" },
            participants: { label: "참가자", color: "hsl(215, 90%, 50%)" },
            dnf: { label: "DNF", color: "hsl(0, 80%, 60%)" },
          }}
        />

        <CourseTrendSection
          title="메디오폰도"
          data={sortedData.map((d) => ({
            year: d.year,
            registered: d.medioFondoRegistered,
            participants: d.medioFondoParticipants,
            dnf: d.medioFondoDNF,
            rate: d.medioFondoRate,
            completionRate: d.medioFondoCompletionRate,
          }))}
          viewType={viewType}
          isMobile={isMobile}
          isTablet={isTablet}
          scrollRef={scrollRef}
          totalWidth={totalWidth}
          config={{
            registered: { label: "등록자", color: "hsl(150, 80%, 80%)" },
            participants: { label: "참가자", color: "hsl(150, 80%, 40%)" },
            dnf: { label: "DNF", color: "hsl(0, 80%, 60%)" },
          }}
        />
      </div>
    </div>
  );
}
