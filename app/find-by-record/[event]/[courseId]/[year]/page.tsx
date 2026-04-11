import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/db/events";
import StackNavBar from "../../../../../components/StackNavBar";
import FindMyRecordSection from "./FindMyRecordSection";
import { generateFindRecordMetadata } from "@/lib/metadata";

type Props = {
  params: {
    event: string;
    courseId: string;
    year: string;
  };
};

const FindMyRecordPage = async ({ params }: Props) => {
  const { event: eventId, courseId, year } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }
  const eventName = event.name || `${event.location} 그란폰도`;

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <FindMyRecordSection
        event={event}
        eventName={eventName}
        courseId={courseId}
        year={year}
      />
    </main>
  );
};

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { event: eventId, courseId, year } = await params;
  return generateFindRecordMetadata({ eventId, courseId, year });
};

export default FindMyRecordPage;
export { generateMetadata };
