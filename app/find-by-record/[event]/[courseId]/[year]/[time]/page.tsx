import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event } from "@/lib/types";
import type { Metadata } from "next";
import StackNavBar from "@/components/StackNavBar";
import fs from "fs";
import path from "path";
import { calculateParticipants, calculateDNF } from "@/lib/participants";
import { getCourseInfoById } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateFindRecordMetadata } from "@/lib/metadata";

type Props = {
  params: { event: string; courseId: string; year: string; time: string };
};

const ResultPage = async (props: Props) => {
  const awaitedParams = await props.params;
  const { event: eventId, courseId, year, time } = awaitedParams;
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  if (!event) notFound();

  // digit string(05082735) → HH:mm:ss.SS로 변환
  const parsedTime = parseDigitTime(time);
  if (!parsedTime) notFound();

  const participants = calculateParticipants(eventId, Number(year));
  const dnf = calculateDNF(eventId, Number(year));
  const totalParticipants = participants[courseId];

  console.log("courseId", courseId);
  console.log("participants", participants);
  console.log("dnf", dnf);

  const totalDNF = dnf[courseId];
  const finishers = totalParticipants - totalDNF;

  console.log("totalParticipants", totalParticipants);
  console.log("totalDNF", totalDNF);
  console.log("finishers", finishers);

  // 파일 경로
  const sortedFile = path.join(
    process.cwd(),
    "data",
    "sorted-msec",
    `${eventId}_${year}.json`
  );
  if (!fs.existsSync(sortedFile)) notFound();
  const sortedRaw = fs.readFileSync(sortedFile, "utf-8");
  const sortedData = JSON.parse(sortedRaw);

  // course 영문 → 한글 매핑
  // TODO: 확장성 있게 수정하기. getCourseNameById 사용하면 될 듯
  const courseMap: Record<string, string> = {
    granfondo: "그란폰도",
    mediofondo: "메디오폰도",
    "challenge-a": "Challenge A",
    "challenge-b": "Challenge B",
  };

  const courseKey = courseMap[courseId] || courseId;
  const courseArr: number[] = sortedData[courseKey] || [];
  const inputMsec = timeToMilliseconds(parsedTime);
  if (inputMsec < 0) notFound();

  // inputMsec와 가장 가까운 위치 찾기
  const closestIdx = courseArr.findIndex((msec) => msec > inputMsec);
  const start = Math.max(0, closestIdx - 10);
  const end = Math.min(courseArr.length, closestIdx + 10);

  let rank: number | null = null;
  let percentile: number | null = null;
  let percentileByParticipants: number | null = null;
  let resultMsg = null;

  // 주변 기록 배열 준비
  let recordsAround: { msec: number; isInput: boolean }[] = [];
  if (courseArr.length > 0 && inputMsec >= 0) {
    const faster = courseArr.slice(Math.max(0, closestIdx - 10), closestIdx);
    const slower = courseArr.slice(closestIdx, closestIdx + 10);
    recordsAround = [
      ...faster.map((msec) => ({ msec, isInput: false })),
      { msec: inputMsec, isInput: true },
      ...slower.map((msec) => ({ msec, isInput: false })),
    ];
  }

  if (courseArr.length === 0) {
    resultMsg = (
      <div className="text-lg text-red-500 mb-4">
        해당 코스 완주자 데이터가 없습니다.
      </div>
    );
  } else {
    // 입력 기록보다 빠른 사람 수 + 1 (동일 기록은 같은 순위)
    rank = courseArr.filter((msec) => msec < inputMsec).length + 1;
    // 상위 % (완주자 기준)
    if (courseArr.length > 0) {
      percentile = ((rank - 1) / courseArr.length) * 100;
    }
    // 상위 % (참가자 기준)
    if (totalParticipants > 0) {
      percentileByParticipants = ((rank - 1) / totalParticipants) * 100;
    }
  }

  const courseInfo = getCourseInfoById(eventId, year, courseId);

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <div className="max-w-full px-4 py-4">
        <div className="flex flex-col items-center mb-6">
          <div className="text-3xl text-muted-foreground font-semibold mb-2">
            {year}년 {event.location} 그란폰도
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

// digit string(05082735) → HH:mm:ss.SS로 변환
const parseDigitTime = (digit: string): string | null => {
  if (!/^\d{6,8}$/.test(digit)) return null;
  if (digit.length === 6) {
    return `${digit.slice(0, 2)}:${digit.slice(2, 4)}:${digit.slice(4, 6)}`;
  }
  if (digit.length === 8) {
    return `${digit.slice(0, 2)}:${digit.slice(2, 4)}:${digit.slice(
      4,
      6
    )}.${digit.slice(6, 8)}`;
  }
  return null;
};

// HH:mm:ss(.SS) → msec
const timeToMilliseconds = (time: string): number => {
  if (!time || time === "DNF" || time === "DNS") return -1;
  const [h, m, s] = time.split(":");
  if (!h || !m || !s) return -1;
  let sec = 0,
    ms = 0;
  if (s.includes(".")) {
    const [secStr, msStr] = s.split(".");
    sec = parseInt(secStr, 10);
    ms = parseInt((msStr + "00").slice(0, 3), 10);
  } else {
    sec = parseInt(s, 10);
  }
  return (
    parseInt(h, 10) * 3600 * 1000 +
    parseInt(m, 10) * 60 * 1000 +
    sec * 1000 +
    ms
  );
};

// msec → HH:mm:ss.SS 변환 함수
const msecToTimeString = (msec: number): string => {
  if (msec < 0) return "-";
  const h = Math.floor(msec / 3600000);
  const m = Math.floor((msec % 3600000) / 60000);
  const s = Math.floor((msec % 60000) / 1000);
  const ms = Math.floor((msec % 1000) / 10);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { event: eventId, courseId, year } = await params;
  return generateFindRecordMetadata({ eventId, courseId, year });
};

export default ResultPage;
export { generateMetadata };
