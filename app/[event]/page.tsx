import { unstable_cache } from "next/cache";
import { ParticipantTrendSection } from "./components/ParticipantTrendSection";
import { StatsSection } from "./components/StatsSection";
import { TitleSection } from "./components/TitleSection";
import { CommentsSection } from "./components/CommentsSection";
import { getEventById } from "@/lib/db/events";
import { REVALIDATE_SECONDS_MONTH } from "@/lib/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";

export const revalidate = REVALIDATE_SECONDS_MONTH;

type Props = {
  params: Promise<{
    event: string;
  }>;
};

function getCachedEvent(slug: string) {
  return unstable_cache(
    () => getEventById(slug),
    [`event-${slug}`],
    { revalidate: REVALIDATE_SECONDS_MONTH, tags: [`event-${slug}`] }
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
        <div className="space-y-12 max-w-full">
          <TitleSection event={event} />
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
