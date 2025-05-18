import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event, EventV2 } from "@/lib/types";
import StackNavBar from "./StackNavBar";

type Props = {
  params: {
    event: string;
  };
};

const FindMyRecordPage = async ({ params }: Props) => {
  const { event: eventId } = params;
  const event = events.find((e) => e.id === eventId) as
    | Event
    | EventV2
    | undefined;

  if (!event) {
    notFound();
  }

  // 최신 연도 추출 (내림차순 정렬 후 첫 번째)
  const latestYear = [...event.years].sort((a, b) => b - a)[0];
  const eventName = event.location + " 그란폰도";

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <div className="space-y-12 max-w-full px-4 py-4">
        <div className="text-xl text-muted-foreground font-semibold mb-8">
          {latestYear} {eventName}
        </div>
        <form className="max-w-xs mx-auto">
          <label
            htmlFor="record-input"
            className="block text-sm font-medium mb-2"
          >
            기록 입력
          </label>
          <input
            id="record-input"
            name="record"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="예: 05:08:27 또는 05:08:27.53"
            className="w-full border rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        {/* 이후 컨텐츠 영역 */}
      </div>
    </main>
  );
};

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { event: eventId } = params;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return {
      title: "페이지를 찾을 수 없습니다 | FondoScope",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  return {
    title: `${event.location} 그란폰도 - 기록으로 찾기 | FondoScope`,
    description: `${event.location} 그란폰도의 기록을 입력하여 순위와 백분율을 확인하세요.`,
  };
};

export default FindMyRecordPage;
export { generateMetadata };
