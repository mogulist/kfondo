import { ParticipantTrend } from "@/components/participant-trend";
import { StatsChart } from "@/components/stats-chart";
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
import type { Event, EventV2, EventYearDetail } from "@/lib/types";
import FondoScopeHeader from "@/components/FondoScopeHeader";

type EventPageProps = {
  params: {
    event: string;
  };
};

export default async function EventPage({ params }: EventPageProps) {
  const { event: eventId } = await params;
  const event = events.find((e) => e.id === eventId) as
    | Event
    | EventV2
    | undefined;

  if (!event) {
    notFound();
  }

  // 타입 가드
  const isV2 = (e: any): e is EventV2 => "yearDetails" in e;

  // 연도별 데이터 생성
  let eventData: any[] = [];
  if (isV2(event)) {
    eventData = event.years.map((year) => {
      const detail = event.yearDetails[year];
      // granfondo/mediofondo registered 추출 (기존 차트 호환 위해)
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
  } else {
    eventData = event.years.map((year) => ({
      year,
      registered: event.registered[year] || { granfondo: 0, mediofondo: 0 },
      participants: calculateParticipants(eventId, year),
      dnf: calculateDNF(eventId, year),
    }));
  }

  // 실제 기록 분포 차트 제공 (확장성 개선)
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
    let granfondoComment: string | undefined = undefined;
    if (isV2(event)) {
      const gran = event.yearDetails[year]?.courses.find(
        (c) => c.id === "granfondo"
      );
      granfondoComment = gran?.comment;
    }

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
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">연도별 참가자 추세</h2>
              <div className="w-full">
                <ParticipantTrend eventData={eventData} />
              </div>
              {isV2(event) && event.comment && (
                <div className="mb-4 px-4 py-3 rounded-md bg-blue-50 border border-blue-200 text-blue-900 flex items-start">
                  <svg
                    className="w-5 h-5 mt-0.5 text-blue-400 shrink-0 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                  <span className="text-sm font-medium">{event.comment}</span>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">기록 분포</h2>
              <div className="w-full">
                <StatsChart yearStats={yearStats} eventId={eventId} />
              </div>
            </section>

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
      // 이미지가 준비되면 주석 해제
      // images: [
      //   {
      //     url: event.meta.image,
      //     width: 1200,
      //     height: 630,
      //     alt: `${event.location} 그란폰도`,
      //   },
      // ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.meta.title,
      description: event.meta.description,
      // 이미지가 준비되면 주석 해제
      // images: [event.meta.image],
    },
  };
}
