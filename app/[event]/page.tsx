import { unstable_cache } from "next/cache";
import { ParticipantTrendSection } from "./components/ParticipantTrendSection";
import { StatsSection } from "./components/StatsSection";
import { TitleSection } from "./components/TitleSection";
import { UpcomingSection } from "./components/UpcomingSection";
import { CommentsSection } from "./components/CommentsSection";
import { getEventById } from "@/lib/db/events";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";

/** 30일 (Next.js segment config는 리터럴만 허용) */
export const revalidate = 2592000;

type Props = {
  params: Promise<{
    event: string;
  }>;
};

function getCachedEvent(slug: string) {
  return unstable_cache(
    () => getEventById(slug),
    [`event-${slug}`],
    { revalidate: 2592000, tags: [`event-${slug}`] }
  );
}

export async function generateStaticParams() {
  return [];
}

export default async function EventPage({ params }: Props) {
  const { event: eventSlug } = await params;
  const event = await getCachedEvent(eventSlug)();

  if (!event) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8 max-w-full">
          <div className="space-y-4">
            <TitleSection event={event} />
            <UpcomingSection event={event} />
          </div>
          <div className="space-y-16 md:space-y-20">
            <ParticipantTrendSection event={event} />
            <StatsSection event={event} />
            <CommentsSection event={event} eventId={eventSlug} />
          </div>
        </div>
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { event: eventSlug } = await params;
  const event = await getCachedEvent(eventSlug)();

  if (!event) {
    return {
      title: "페이지를 찾을 수 없습니다 | K-Fondo",
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
