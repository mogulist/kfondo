import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { events } from "@/events.config";
import type { Event } from "@/lib/types";
import StackNavBar from "../../../../../components/StackNavBar";
import FindMyRecordSection from "./FindMyRecordSection";
import { generateFindRecordMetadata } from "@/lib/metadata";

type Props = {
  params: {
    event: string;
    course: string;
    year: string;
  };
};

const FindMyRecordPage = async ({ params }: Props) => {
  const { event: eventId, course, year } = await params;
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  if (!event) {
    notFound();
  }
  const eventName = event.location + " 그란폰도";

  return (
    <main className="container mx-auto px-0 py-0">
      <StackNavBar />
      <FindMyRecordSection
        event={event}
        eventName={eventName}
        course={course}
        year={year}
      />
    </main>
  );
};

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { event: eventId, course, year } = await params;
  return generateFindRecordMetadata({ eventId, course, year });
};

export default FindMyRecordPage;
export { generateMetadata };
