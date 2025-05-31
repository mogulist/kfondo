import { ParticipantTrendSection } from "./components/ParticipantTrendSection";
import { StatsSection } from "./components/StatsSection";
import { TitleSection } from "./components/TitleSection";
import { CommentsSection } from "./components/CommentsSection";
import { events } from "@/events.config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Event } from "@/lib/types";
import FondoScopeHeader from "@/components/FondoScopeHeader";

type Props = {
  params: {
    event: string;
  };
};

export default async function EventPage({ params }: Props) {
  const { event: eventId } = await params;
  const event = events.find((e) => e.id === eventId) as Event | undefined;

  if (!event) {
    notFound();
  }

  return (
    <>
      <FondoScopeHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12 max-w-full">
          <TitleSection event={event} />
          <div className="space-y-16 md:space-y-20">
            <ParticipantTrendSection event={event} />
            <StatsSection event={event} />
            <CommentsSection event={event} eventId={eventId} />
          </div>
        </div>
      </main>
    </>
  );
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
