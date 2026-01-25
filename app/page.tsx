import { EventCard } from "@/components/EventCard";
import Link from "next/link";
import FondoScopeHeader from "@/components/FondoScopeHeader";
import { EventCarousel } from "@/components/EventCarousel";
import { HeroSection } from "@/components/HeroSection";
import { getFilteredEvents, mapToEventData } from "@/lib/server-utils";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const params = await searchParams;
  const searchQuery = params.q || "";

  // Get filtered events from server-side utility
  const { recentEvents, upcomingEvents, otherEvents, showSections } = 
    getFilteredEvents(searchQuery);

  const hasSearchResults = 
    recentEvents.length > 0 || 
    upcomingEvents.length > 0 || 
    otherEvents.length > 0;

  return (
    <>
      <FondoScopeHeader />
      <HeroSection initialQuery={searchQuery} />
      <main className="py-12">
        <div className="space-y-12">

          {/* 최근 기록 업데이트 섹션 */}
          {recentEvents.length > 0 && (
            <EventCarousel
              icon="⚡️"
              title="최근 기록 업데이트"
              events={recentEvents}
            />
          )}

          {/* 다가오는 대회 섹션 */}
          {upcomingEvents.length > 0 && (
            <EventCarousel
              icon="📅"
              title="다가오는 대회"
              events={upcomingEvents}
            />
          )}

          {/* 전체 대회 섹션 */}
          {otherEvents.length > 0 && (
            <div className="container mx-auto px-4 space-y-6">
              {showSections && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📂</span>
                  <h2 className="text-2xl font-bold text-foreground">전체 대회 ({otherEvents.length})</h2>
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

          {/* 검색 결과 없음 메시지 */}
          {searchQuery.trim() && !hasSearchResults && (
            <div className="container mx-auto px-4 text-center py-12">
              <p className="text-xl text-muted-foreground">
                "{searchQuery}"에 대한 검색 결과가 없습니다.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                다른 검색어로 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default HomePage;
