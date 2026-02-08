import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StackNavBar from "@/components/StackNavBar";
import { Badge } from "@/components/ui/badge";
import { generateFindRecordMetadata } from "@/lib/metadata";
import {
  getFindByRecordData,
  msecToTimeString,
} from "@/lib/find-by-record-data";
import ShareRecordMenu from "./ShareRecordMenu";

type Props = {
  params: { event: string; courseId: string; year: string; time: string };
};

const ResultPage = async (props: Props) => {
  const awaitedParams = await props.params;
  const { event: eventId, courseId, year, time } = awaitedParams;

  const data = await getFindByRecordData(eventId, courseId, year, time);
  if (!data) notFound();

  const {
    event,
    parsedTime,
    rank,
    percentile,
    percentileByParticipants,
    totalParticipants,
    finishers,
    courseInfo,
    recordsAround,
    eventDate,
  } = data;

  const eventName = event.name || `${event.location} 그란폰도`;
  const certificateProps = {
    year,
    eventName,
    category: courseInfo?.name ?? "",
    distance: courseInfo ? `${courseInfo.distance}km` : "",
    elevation: courseInfo ? `${courseInfo.elevation}m` : "",
    parsedTime,
    rankStr: rank != null ? `${rank}` : "-",
    participantPct:
      percentileByParticipants != null
        ? percentileByParticipants.toFixed(1)
        : "-",
    finisherPct: percentile != null ? percentile.toFixed(1) : "-",
    totalParticipants,
    finishers,
    eventDate,
  };

  const resultMsg =
    rank === null ? (
      <div className="text-lg text-red-500 mb-4">
        해당 코스 완주자 데이터가 없습니다.
      </div>
    ) : null;

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <div className="max-w-full px-4 py-4">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-2xl mx-auto mb-2">
            <div className="text-2xl sm:text-3xl text-muted-foreground font-semibold">
              {year}년 {event.name || `${event.location} 그란폰도`}
            </div>
            <ShareRecordMenu
              eventId={eventId}
              courseId={courseId}
              year={year}
              time={time}
              title={`${year}년 ${eventName} 기록 인증`}
              description={`완주 기록 ${parsedTime}, 순위 ${rank ?? "-"}위`}
              certificateProps={certificateProps}
            />
          </div>
          {courseInfo && (
            <div className="flex gap-2">
              <Badge className="bg-blue-600 text-white">
                {courseInfo.name}
              </Badge>
              <Badge className="bg-green-600 text-white">
                {courseInfo.distance}km
              </Badge>
              <Badge className="bg-orange-500 text-white">
                {courseInfo.elevation}m
              </Badge>
            </div>
          )}
        </div>
        <div className="w-full max-w-2xl mx-auto mb-4">
          {/* 모바일: 4개 세로, PC: 입력기록 한 줄, 아래 3개 가로 */}
          <div className="flex flex-col gap-4 w-full">
            {/* 입력 기록 카드: PC에서는 한 줄 전체, 모바일에서는 첫 번째 카드 */}
            <div className="sm:w-full">
              <Card main={parsedTime} label="입력 기록" />
            </div>
            {/* 3개 카드: PC에서는 가로, 모바일에서는 세로 */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Card main={`${rank ?? "-"}위`} label="순위" testId="rank" />
              <Card
                main={`${
                  percentileByParticipants !== null
                    ? percentileByParticipants.toFixed(1)
                    : "-"
                }%`}
                label="참가자 기준"
                subLabel={`${totalParticipants.toLocaleString()}명 기준`}
                testId="participant"
              />
              <Card
                main={`${percentile !== null ? percentile.toFixed(1) : "-"}%`}
                label="완주자 기준"
                subLabel={`${finishers.toLocaleString()}명 기준`}
                testId="finisher"
              />
            </div>
          </div>
        </div>
        {resultMsg ? (
          resultMsg
        ) : (
          <>
            <div className="w-full border-t border-muted-foreground/20 my-8" />
            <div className="flex flex-col items-center gap-1">
              {recordsAround.map((rec, idx) => (
                <div
                  key={idx}
                  className={
                    rec.isInput
                      ? "font-bold bg-primary/10 border border-primary rounded px-2 py-1 text-primary text-lg"
                      : "text-sm text-foreground px-2 py-1"
                  }
                >
                  {msecToTimeString(rec.msec)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

type CardProps = {
  main: React.ReactNode;
  label: string;
  subLabel?: string;
  className?: string;
  testId?: string;
};

const Card = ({
  main,
  label,
  subLabel,
  className = "",
  testId = "",
}: CardProps) => (
  <div
    className={`flex-1 bg-card shadow-md rounded-xl p-5 flex flex-col items-center border border-primary/30 dark:border-primary/40 ${className}`}
  >
    <div
      className="text-3xl font-extrabold text-primary mb-1"
      data-testid={`${testId}-main`}
    >
      {main}
    </div>
    <div
      className="text-base font-medium text-muted-foreground mb-1"
      data-testid={`${testId}-label`}
    >
      {label}
    </div>
    {subLabel && (
      <div
        className="text-xs text-gray-500 dark:text-gray-400"
        data-testid={`${testId}-subLabel`}
      >
        {subLabel}
      </div>
    )}
  </div>
);

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { event: eventId, courseId, year, time } = await params;
  const base = await generateFindRecordMetadata({
    eventId,
    courseId,
    year,
  });

  // OG 이미지 URL을 명시적으로 설정하여 Facebook 등에서 올바른 이미지를 표시하도록 함
  const ogImageUrl = `https://www.kfondo.cc/find-by-record/${eventId}/${courseId}/${year}/${time}/opengraph-image`;

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: base.title as string,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image" as const,
      images: [ogImageUrl],
    },
  };
};

export default ResultPage;
export { generateMetadata };
