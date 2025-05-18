import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event, EventV2 } from "@/lib/types";
import StackNavBar from "../StackNavBar";
import fs from "fs";
import path from "path";

type Props = {
  params: { event: string; time: string };
};

const ResultPage = async (props: Props) => {
  const awaitedParams = await props.params;
  const { event: eventId, time } = awaitedParams;
  const event = events.find((e) => e.id === eventId) as
    | Event
    | EventV2
    | undefined;
  const parsedTime = parseDigitTime(time);
  if (!event || !parsedTime) {
    notFound();
  }
  // 최신 연도 기준 (가장 최근 연도)
  const latestYear = Math.max(...event.years);
  const sortedFile = path.join(
    process.cwd(),
    "data",
    "sorted-msec",
    `${eventId}_${latestYear}.json`
  );
  console.log("[DEBUG] eventId:", eventId, "latestYear:", latestYear);
  console.log("[DEBUG] sortedFile:", sortedFile);
  if (!fs.existsSync(sortedFile)) {
    console.log("[ERROR] sortedFile does not exist:", sortedFile);
    notFound();
  }
  const sortedRaw = fs.readFileSync(sortedFile, "utf-8");
  const sortedData = JSON.parse(sortedRaw);
  const granfondoArr: number[] = sortedData["그란폰도"] || [];
  console.log("[DEBUG] granfondoArr.length:", granfondoArr.length);
  const inputMsec = timeToMilliseconds(parsedTime);
  console.log("[DEBUG] parsedTime:", parsedTime, "inputMsec:", inputMsec);
  if (inputMsec < 0) {
    console.log("[ERROR] inputMsec < 0:", inputMsec);
    notFound();
  }

  let rank: number | null = null;
  let percentile: number | null = null;
  let resultMsg = null;

  if (granfondoArr.length === 0) {
    resultMsg = (
      <div className="text-lg text-red-500 mb-4">
        그란폰도 완주자 데이터가 없습니다.
      </div>
    );
  } else {
    // 입력 기록보다 빠른 사람 수 + 1 (동일 기록은 같은 순위)
    rank = granfondoArr.filter((msec) => msec < inputMsec).length + 1;
    // 상위 %
    if (granfondoArr.length > 0) {
      percentile = ((rank - 1) / granfondoArr.length) * 100;
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
              (그란폰도 완주자 {granfondoArr.length}명 기준)
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

export default ResultPage;
