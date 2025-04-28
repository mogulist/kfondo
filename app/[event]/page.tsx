import { ParticipantTrend } from "@/components/participant-trend";
import { StatsChart } from "@/components/stats-chart";
import { events, getEventData } from "@/lib/data";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import {
  generateTimeDistributionFromRecords,
  type RaceRecord,
} from "@/lib/csv-parser";
import type { EventYearStats } from "@/lib/types";

interface EventPageProps {
  params: {
    event: string;
  };
}

// 서버 컴포넌트 (SSG)
export default async function EventPage({ params }: EventPageProps) {
  const { event: eventId } = await params;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    notFound();
  }

  const eventData = getEventData(eventId);

  // 홍천만 실제 기록 분포 차트 제공
  let yearStats: EventYearStats[] = [];
  if (eventId === "hongcheon") {
    // years 배열 기준으로 실제 데이터 파일이 있는 연도만 추림
    const dataDir = path.join(process.cwd(), "data");
    const yearsWithData = event.years.filter((year) => {
      const filePath = path.join(dataDir, `hongcheon_${year}.json`);
      return fs.existsSync(filePath);
    });

    // 각 연도별로 실제 기록 데이터 읽어서 분포 데이터로 가공
    yearStats = yearsWithData.map((year) => {
      const filePath = path.join(dataDir, `hongcheon_${year}.json`);
      const raw = fs.readFileSync(filePath, "utf-8");
      const records: RaceRecord[] = JSON.parse(raw).map((r: any) => ({
        bibNo: String(r.BIB_NO),
        gender: r.Gender,
        event: r.Event,
        time: r.Time,
        status: r.Status,
        timeInSeconds: r.Time ? timeToSeconds(r.Time) : undefined,
      }));
      return {
        year,
        granFondoDistribution: generateTimeDistributionFromRecords(
          records,
          "그란폰도",
          5
        ),
        medioFondoDistribution: generateTimeDistributionFromRecords(
          records,
          "메디오폰도",
          5
        ),
      };
    });
    // 최신 연도부터 내림차순 정렬
    yearStats.sort((a, b) => b.year - a.year);
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="space-y-12 max-w-full">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {event.location} 그란폰도
          </h1>
          <p className="text-xl text-muted-foreground">
            {event.years[0]}년부터 {event.years[event.years.length - 1]}년까지의
            통계 데이터
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">연도별 참가자 추세</h2>
            <div className="h-[700px] md:h-[500px] w-full">
              <ParticipantTrend eventData={eventData} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">기록 분포</h2>
            <div className="w-full">
              <StatsChart yearStats={yearStats} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// 시간 문자열을 초로 변환 (csv-parser.ts와 동일)
function timeToSeconds(timeStr: string): number {
  if (!timeStr || timeStr === "DNF" || timeStr === "DNS") return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 3) return 0;
  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  const seconds = Number.parseInt(parts[2], 10);
  return hours * 3600 + minutes * 60 + seconds;
}
