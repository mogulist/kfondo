import { ParticipantTrendSection } from "./components/ParticipantTrendSection";
import { StatsSection } from "./components/StatsSection";
import { DisqusComments } from "@/components/disqus-comments";
import { events } from "@/events.config";
import { calculateParticipants, calculateDNF } from "@/lib/participants";
import path from "path";
import fs from "fs";
import { generateTimeDistributionFromRecords } from "@/lib/record-stats";
import type { RaceRecord } from "@/lib/types";
import { timeToSeconds } from "@/lib/utils";
import type { EventYearStats } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Event } from "@/lib/types";
import FondoScopeHeader from "@/components/FondoScopeHeader";

type EventPageProps = {
  params: {
    event: string;
  };
};

export default async function EventPage({ params }: EventPageProps) {
  const { event: eventId } = await params;
  const event = events.find((e) => e.id === eventId) as Event | undefined;

  if (!event) {
    notFound();
  }

  // 연도별 데이터 생성
  const eventData = event.years.map((year) => {
    const detail = event.yearDetails[year];
    // granfondo/mediofondo registered 추출
    const gran = detail.courses.find((c) => c.id === "granfondo");
    const medio = detail.courses.find((c) => c.id === "mediofondo");
    return {
      year,
      registered: {
        granfondo: gran?.registered ?? 0,
        mediofondo: medio?.registered ?? 0,
      },
      participants: calculateParticipants(eventId, year),
      dnf: calculateDNF(eventId, year),
    };
  });

  // 실제 기록 분포 차트 제공
  let yearStats: EventYearStats[] = [];
  const dataDir = path.join(process.cwd(), "data");
  const yearsWithData = event.years.filter((year) => {
    const filePath = path.join(dataDir, `${eventId}_${year}.json`);
    return fs.existsSync(filePath);
  });

  yearStats = yearsWithData.map((year) => {
    const filePath = path.join(dataDir, `${eventId}_${year}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const records: RaceRecord[] = JSON.parse(raw).map((r: any) => ({
      bibNo: String(r.BIB_NO),
      gender: r.Gender,
      event: r.Event,
      time: r.Time,
      status: r.Status,
      timeInSeconds: r.Time ? timeToSeconds(r.Time) : undefined,
    }));

    const yearData = eventData.find((d) => d.year === year);
    if (!yearData) {
      throw new Error(`No data found for year ${year}`);
    }

    // granfondo 코스의 comment만 추출
    const gran = event.yearDetails[year]?.courses.find(
      (c) => c.id === "granfondo"
    );
    const granfondoComment = gran?.comment;

    return {
      year,
      granFondoDistribution: generateTimeDistributionFromRecords(
        records,
        "그란폰도",
        2, // 2분 간격
        year,
        yearData.participants.granfondo
      ),
      medioFondoDistribution: generateTimeDistributionFromRecords(
        records,
        "메디오폰도",
        2, // 2분 간격
        year,
        yearData.participants.mediofondo
      ),
      comment: granfondoComment,
    };
  });
  yearStats.sort((a, b) => b.year - a.year);

  return (
    <>
      <FondoScopeHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12 max-w-full">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {event.location} 그란폰도
            </h1>
            <p className="text-xl text-muted-foreground">
              {event.years[0]}년부터 {event.years[event.years.length - 1]}
              년까지의 통계 데이터
            </p>
          </div>

          <div className="space-y-16 md:space-y-20">
            <ParticipantTrendSection event={event} />
            <StatsSection event={event} />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">댓글</h2>
              <DisqusComments
                eventId={eventId}
                eventTitle={`${event.location} 그란폰도`}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { event: eventId } = await params;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return {
      title: "페이지를 찾을 수 없습니다 | FondoScope",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  return {
    title: event.meta.title,
    description: event.meta.description,
    openGraph: {
      title: event.meta.title,
      description: event.meta.description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: event.meta.title,
      description: event.meta.description,
    },
  };
}
