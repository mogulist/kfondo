import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event, EventV2 } from "@/lib/types";
import StackNavBar from "../StackNavBar";

type Props = {
  params: { event: string; time: string };
};

const ResultPage = async ({ params }: Props) => {
  const { event: eventId, time } = params;
  const event = events.find((e) => e.id === eventId) as
    | Event
    | EventV2
    | undefined;
  const parsedTime = parseDigitTime(time);
  if (!event || !parsedTime) {
    notFound();
  }
  // TODO: 기록 데이터 분석 및 결과 표시
  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <div className="max-w-full px-4 py-4">
        <div className="text-xl text-muted-foreground font-semibold mb-8">
          결과 페이지 (입력 기록: {parsedTime})
        </div>
        {/* 순위, 백분율 등 결과 표시 영역 */}
      </div>
    </main>
  );
};

export default ResultPage;

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
