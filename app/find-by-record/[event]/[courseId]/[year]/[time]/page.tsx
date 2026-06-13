import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { EventHeader } from "@/components/EventHeader";
import { FindByRecordNav } from "@/components/FindByRecordNav";
import { generateFindRecordMetadata } from "@/lib/metadata";
import {
  getFindByRecordData,
  type FindByRecordScope,
  msecToTimeString,
} from "@/lib/find-by-record-data";
import RecordResultHero from "./RecordResultHero";
import ShareRecordMenu from "./ShareRecordMenu";
import TrackResultViewed from "./TrackResultViewed";

type Props = {
  params: { event: string; courseId: string; year: string; time: string };
  searchParams: Promise<{ scope?: string }>;
};

const parseScope = (scope?: string): FindByRecordScope =>
  scope === "kom" ? "kom" : "full";

const ResultPage = async (props: Props) => {
  const awaitedParams = await props.params;
  const awaitedSearchParams = await props.searchParams;
  const { event: eventId, courseId, year, time } = awaitedParams;
  const requestedScope = parseScope(awaitedSearchParams.scope);

  const data = await getFindByRecordData(
    eventId,
    courseId,
    year,
    time,
    requestedScope,
  );
  if (!data) notFound();

  const {
    event,
    recordScope,
    parsedTime,
    rank,
    percentile,
    percentileByParticipants,
    rankMale,
    rankFemale,
    finishersMale,
    finishersFemale,
    totalParticipants,
    finishers,
    courseInfo,
    recordsAround,
    eventDate,
  } = data;

  const eventName = event.name || `${event.location} 그란폰도`;
  const isKomScope = recordScope === "kom";
  const scopeLabel = isKomScope ? "KOM" : "완주";
  const scopeRecordLabel = isKomScope ? "KOM 기록" : "완주 기록";
  const scopeRankLabel = isKomScope ? "KOM 통합 순위" : "완주 통합 순위";
  const scopePeoplePrefix = isKomScope ? "KOM " : "";
  const backToInputHref = `/find-by-record/${eventId}/${courseId}/${year}?scope=${recordScope}`;
  const toFullResultHref = `/find-by-record/${eventId}/${courseId}/${year}/${time}`;

  const resultMsg =
    rank === null ? (
      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="text-lg text-red-500">
          {isKomScope
            ? "해당 코스의 KOM 완주자 데이터가 없습니다."
            : "해당 코스 완주자 데이터가 없습니다."}
        </div>
        {isKomScope ? (
          <Link className="text-sm text-primary underline" href={toFullResultHref}>
            완주 기록으로 다시 보기
          </Link>
        ) : null}
      </div>
    ) : null;

  return (
    <>
      <TrackResultViewed
        eventId={eventId}
        courseId={courseId}
        year={year}
        time={time}
        recordScope={recordScope}
      />
      <EventHeader eventTitle={eventName} />
      <FindByRecordNav
        backHref={backToInputHref}
        backLabel="기록으로 찾기"
        breadcrumbs={[
          { label: eventName, href: `/${eventId}` },
          { label: "기록으로 찾기", href: backToInputHref },
          { label: "결과" },
        ]}
        trailing={
          <ShareRecordMenu
            eventId={eventId}
            courseId={courseId}
            year={year}
            time={time}
            recordScope={recordScope}
            title={`${year}년 ${eventName} 기록 인증`}
            description={`${scopeRecordLabel} ${parsedTime}, 순위 ${rank ?? "-"}위`}
          />
        }
      />
      <main className="container mx-auto px-0 py-0">
        <div className="max-w-full px-4 py-4">
        <div className="mx-auto w-full max-w-2xl">
          <RecordResultHero
            year={year}
            eventName={eventName}
            eventDate={eventDate}
            parsedTime={parsedTime}
            scopeRecordLabel={scopeRecordLabel}
            scopeRankLabel={scopeRankLabel}
            scopeLabel={scopeLabel}
            isKomScope={isKomScope}
            scopePeoplePrefix={scopePeoplePrefix}
            courseInfo={courseInfo}
            rank={rank}
            percentile={percentile}
            percentileByParticipants={percentileByParticipants}
            totalParticipants={totalParticipants}
            finishers={finishers}
            rankMale={rankMale}
            rankFemale={rankFemale}
            finishersMale={finishersMale}
            finishersFemale={finishersFemale}
          />
        </div>

        <div className="mx-auto w-full max-w-2xl">
          {resultMsg ? (
            <div className="mt-6">{resultMsg}</div>
          ) : (
            <>
              <div className="my-8 w-full border-t border-muted-foreground/20" />
              <div className="mb-2 text-center text-sm text-muted-foreground">
                {scopeRecordLabel} 주변 기록
              </div>
              <div className="flex flex-col items-center gap-1">
                {recordsAround.map((rec, idx) => (
                  <div
                    key={idx}
                    className={
                        rec.isInput
                        ? "rounded border border-emerald-500 bg-emerald-500/10 px-2 py-1 text-lg font-bold text-emerald-600 dark:text-emerald-400"
                        : "px-2 py-1 text-sm text-foreground"
                    }
                  >
                    {msecToTimeString(rec.msec)}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-8 text-center">
            <Link
              className="text-sm text-primary underline"
              href={backToInputHref}
            >
              다른 기록으로 찾기
            </Link>
          </div>
        </div>
        </div>
      </main>
    </>
  );
};

const generateMetadata = async ({
  params,
  searchParams,
}: Props): Promise<Metadata> => {
  const { event: eventId, courseId, year, time } = await params;
  const { scope } = await searchParams;
  const recordScope = parseScope(scope);
  const base = await generateFindRecordMetadata({
    eventId,
    courseId,
    year,
  });

  // 페이지별 URL 설정 (Facebook이 og:url을 기준으로 OG 이미지를 가져옴)
  const pageUrl = new URL(
    `https://www.kfondo.cc/find-by-record/${eventId}/${courseId}/${year}/${time}`,
  );
  if (recordScope === "kom") {
    pageUrl.searchParams.set("scope", "kom");
  }
  const ogImageUrl = new URL(
    `https://www.kfondo.cc/find-by-record/${eventId}/${courseId}/${year}/${time}/opengraph-image`,
  );
  if (recordScope === "kom") {
    ogImageUrl.searchParams.set("scope", "kom");
  }

  return {
    ...base,
    alternates: {
      canonical: pageUrl.toString(),
    },
    openGraph: {
      ...base.openGraph,
      url: pageUrl.toString(),
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: base.title as string,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image" as const,
      images: [ogImageUrl.toString()],
    },
  };
};

export default ResultPage;
export { generateMetadata };
