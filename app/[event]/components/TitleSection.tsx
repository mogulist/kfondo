import type { Event } from "@/lib/types";

type Props = {
  event: Event;
};

export const TitleSection = ({ event }: Props) => {
  return (
    <h1 className="text-4xl font-bold tracking-tight">
      {event.name || `${event.location} 그란폰도`}
    </h1>
  );
};
