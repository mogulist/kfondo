import { EventCard, type EventData } from "@/components/EventCard";
import Link from "next/link";
import { events } from "@/events.config";
import FondoScopeHeader from "@/components/FondoScopeHeader";
import dayjs from "dayjs";
import { EventCarousel } from "@/components/EventCarousel";

// Helper to map raw event to EventCard props
const mapToEventData = (event: typeof events[0]): EventData => {
  const latestYear = Math.max(...event.years);
  const latestDetail = event.yearDetails[latestYear];
  
  return {
    id: event.id,
    name: event.name || `${event.location} 그란폰도`,
    status: 'archive', // Default status, can be overridden if needed by specific logic, but UI requirements were specific for the card. 
                       // Actually, strictly speaking, the card status visually changes details. 
                       // "Recent" section might validly use 'recently_updated' status if we want the "NEW" badge from the card component?
                       // The user screenshot for "Recently Updated" shows cards with "NEW" badge.
                       // The provided EventCard component logic for `isRecentlyUpdated` checks `event.status === 'recently_updated'`.
                       // So I should set status accordingly for the sections.
    date: latestDetail.date,
    years: event.years.map(String),
    categories: latestDetail.courses.map(course => ({
      name: course.name,
      distance: course.distance,
      elevation: course.elevation
    })),
    updatedAt: latestDetail.date,
    participants: latestDetail.totalRegistered,
    dDay: dayjs(latestDetail.date).diff(dayjs(), 'day')
  };
};

const HomePage = () => {
  const currentYear = dayjs().year();
  const today = dayjs();

  // Sort events first by latest year's date desc (default sort)
  const sortedEvents = [...events].sort((a, b) => {
    const aLatestYear = Math.max(...a.years);
    const bLatestYear = Math.max(...b.years);
    const aDate = dayjs(a.yearDetails[aLatestYear].date);
    const bDate = dayjs(b.yearDetails[bLatestYear].date);
    return bDate.valueOf() - aDate.valueOf();
  });

  // Filter groups
  const recentEvents: typeof events = [];
  const upcomingEvents: typeof events = [];
  const otherEvents: typeof events = [];

  sortedEvents.forEach(event => {
    const latestYear = Math.max(...event.years);
    const latestDetail = event.yearDetails[latestYear];
    const eventDate = dayjs(latestDetail.date);
    
    // Check if it's this year
    if (latestYear === currentYear) {
      const daysSince = today.diff(eventDate, 'day');
      const isFuture = eventDate.isAfter(today);
      const hasRecords = latestDetail.totalRegistered > 0;

      if (hasRecords && daysSince >= 0 && daysSince <= 14) {
        recentEvents.push(event);
        return;
      }

      if (!hasRecords && isFuture) {
        upcomingEvents.push(event);
        return;
      }
    }

    // Default to other
    otherEvents.push(event);
  });

  // Sort groups
  // Recent: Latest updated first (already sorted by sortedEvents desc? No, ensure it)
  recentEvents.sort((a, b) => {
    const aDate = dayjs(a.yearDetails[2026].date);
    const bDate = dayjs(b.yearDetails[2026].date);
    return bDate.valueOf() - aDate.valueOf();
  });

  // Upcoming: Nearest future date first (Ascending)
  upcomingEvents.sort((a, b) => {
    const aDate = dayjs(a.yearDetails[2026].date);
    const bDate = dayjs(b.yearDetails[2026].date);
    return aDate.valueOf() - bDate.valueOf();
  });
  
  // Other: Latest date first (Descending)
  // (sortedEvents was already desc)

  // Other: Latest date first (Descending)
  // (sortedEvents was already desc)

  const showSections = recentEvents.length > 0 || upcomingEvents.length > 0;

  const recentEventData = recentEvents.map(e => {
    const data = mapToEventData(e);
    data.status = 'recently_updated';
    return data;
  });

  const upcomingEventData = upcomingEvents.map(e => {
    const data = mapToEventData(e);
    data.status = 'upcoming';
    return data;
  });

  return (
    <>
      <FondoScopeHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              한국 그란폰도 통계
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              한국에서 열리는 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요.
            </p>
          </div>

          {/* 최근 기록 업데이트 섹션 */}
          {recentEventData.length > 0 && (
            <EventCarousel
              icon="⚡️"
              title="최근 기록 업데이트"
              events={recentEventData}
            />
          )}

          {/* 다가오는 대회 섹션 */}
          {upcomingEventData.length > 0 && (
            <EventCarousel
              icon="📅"
              title="다가오는 대회"
              events={upcomingEventData}
            />
          )}

          {/* 전체 대회 섹션 */}
          {otherEvents.length > 0 && (
            <div className="space-y-6">
              {showSections && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📂</span>
                  <h2 className="text-2xl font-bold text-gray-900">전체 대회 ({otherEvents.length})</h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherEvents.map((event) => (
                  <Link href={`/${event.id}`} key={event.id} className="block">
                    <EventCard event={mapToEventData(event)} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default HomePage;
