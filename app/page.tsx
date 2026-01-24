import { EventCard } from "@/components/EventCard";
import Link from "next/link";
import { events } from "@/events.config";
import FondoScopeHeader from "@/components/FondoScopeHeader";
import dayjs from "dayjs";

const HomePage = () => {
  const sortedEvents = [...events].sort((a, b) => {
    const aLatestYear = Math.max(...a.years);
    const bLatestYear = Math.max(...b.years);
    const aDate = dayjs(a.yearDetails[aLatestYear].date);
    const bDate = dayjs(b.yearDetails[bLatestYear].date);
    return bDate.valueOf() - aDate.valueOf();
  });

  return (
    <>
      <FondoScopeHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              한국 그란폰도 통계
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              한국에서 열리는 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => {
              const latestYear = Math.max(...event.years);
              const latestDetail = event.yearDetails[latestYear];
              
              const mappedEvent = {
                id: event.id,
                name: event.name || `${event.location} 그란폰도`,
                status: 'archive' as const,
                date: latestDetail.date,
                years: event.years.map(String),
                categories: latestDetail.courses.map(course => ({
                  name: course.name,
                  distance: course.distance,
                  elevation: course.elevation
                })),
                updatedAt: latestDetail.date,
                participants: latestDetail.totalRegistered
              };

              return (
                <Link href={`/${event.id}`} key={event.id} className="block">
                  <EventCard event={mappedEvent} />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;
