import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event, EventV2 } from "@/lib/types";
import StackNavBar from "./StackNavBar";
import FindMyRecordSection from "./FindMyRecordSection";

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
  const latestYear = [...event.years].sort((a, b) => b - a)[0];
  const eventName = event.location + " 그란폰도";

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <FindMyRecordSection
        event={event}
        latestYear={latestYear}
        eventName={eventName}
      />
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
