import { DisqusComments } from "@/components/disqus-comments";
import type { Event } from "@/lib/types";

type Props = {
  event: Event;
  eventId: string;
};

export const CommentsSection = ({ event, eventId }: Props) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">댓글</h2>
      <DisqusComments
        eventId={eventId}
        eventTitle={`${event.location} 그란폰도`}
      />
    </section>
  );
};
