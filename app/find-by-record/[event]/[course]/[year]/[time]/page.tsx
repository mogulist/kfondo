import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event, EventV2 } from "@/lib/types";
import StackNavBar from "@/components/StackNavBar";
import fs from "fs";
import path from "path";

type Props = {
  params: { event: string; course: string; year: string; digit: string };
};

const ResultPage = async (props: Props) => {
  const awaitedParams = await props.params;
  const { event: eventId, course, year, digit } = awaitedParams;
  const event = events.find((e) => e.id === eventId) as
    | Event
    | EventV2
    | undefined;
  if (!event) notFound();

  // digit string(05082735) → HH:mm:ss.SS로 변환
  const parsedTime = parseDigitTime(digit);
  if (!parsedTime) notFound();

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
  const courseMap: Record<string, string> = {
    granfondo: "그란폰도",
    mediofondo: "메디오폰도",
  };
  const courseKey = courseMap[course] || course;
  const courseArr: number[] = sortedData[courseKey] || [];
  const inputMsec = timeToMilliseconds(parsedTime);
  if (inputMsec < 0) notFound();

  // 디버깅용 로그
  console.log("[DEBUG] inputMsec:", inputMsec);
  console.log(
    "[DEBUG] courseArr.includes(inputMsec):",
    courseArr.includes(inputMsec)
  );
  console.log(
    "[DEBUG] 동일 기록 수:",
    courseArr.filter((msec) => msec === inputMsec).length
  );
  // inputMsec와 가장 가까운 위치 찾기
  const closestIdx = courseArr.findIndex((msec) => msec > inputMsec);
  const start = Math.max(0, closestIdx - 10);
  const end = Math.min(courseArr.length, closestIdx + 10);
  console.log(
    "[DEBUG] courseArr 앞 10개:",
    courseArr.slice(start, closestIdx).map(msecToTimeString)
  );
  console.log(
    "[DEBUG] courseArr 뒤 10개:",
    courseArr.slice(closestIdx, end).map(msecToTimeString)
  );

  let rank: number | null = null;
  let percentile: number | null = null;
  let resultMsg = null;

  if (courseArr.length === 0) {
    resultMsg = (
      <div className="text-lg text-red-500 mb-4">
        해당 코스 완주자 데이터가 없습니다.
      </div>
    );
  } else {
    // 입력 기록보다 빠른 사람 수 + 1 (동일 기록은 같은 순위)
    rank = courseArr.filter((msec) => msec < inputMsec).length + 1;
    // 상위 %
    if (courseArr.length > 0) {
      percentile = ((rank - 1) / courseArr.length) * 100;
    }
  }

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <div className="max-w-full px-4 py-4">
        <div className="text-xl text-muted-foreground font-semibold mb-8">
          입력 기록: {parsedTime}
        </div>
        {resultMsg ? (
          resultMsg
        ) : (
          <>
            <div className="text-2xl font-bold mb-4">순위: {rank}위</div>
            <div className="text-lg mb-2">
              상위 {percentile !== null ? percentile.toFixed(1) : "-"}%
            </div>
            <div className="text-sm text-gray-500">
              ({course} 완주자 {courseArr.length}명 기준)
            </div>
          </>
        )}
      </div>
    </main>
  );
};

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

export default ResultPage;
