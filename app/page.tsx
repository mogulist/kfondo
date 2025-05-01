import { EventCard } from "@/components/event-card";
import { events } from "@/lib/events";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            한국 그란폰도 통계
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            한국에서 열리는 그란폰도 대회들의 참가자 통계와 기록 분포를
            확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
