import type { Event } from "@/lib/types";

type Props = {
  event: Event;
};

export const TitleSection = ({ event }: Props) => {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">
        {event.location} 그란폰도
      </h1>
      <p className="text-xl text-muted-foreground">
        {event.years[0]}년부터 {event.years[event.years.length - 1]}
        년까지의 통계 데이터
      </p>
    </div>
  );
};
