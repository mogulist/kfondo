"use client";

import { EventCard, type EventData } from "@/components/EventCard";
import Link from "next/link";
import { events } from "@/events.config";
import FondoScopeHeader from "@/components/FondoScopeHeader";
import dayjs from "dayjs";
import { EventCarousel } from "@/components/EventCarousel";
import { HeroSection } from "@/components/HeroSection";
import { useState, useEffect } from "react";

// Helper to map raw event to EventCard props
const mapToEventData = (event: typeof events[0]): EventData => {
  const latestYear = Math.max(...event.years);
  const latestDetail = event.yearDetails[latestYear];
  
  // Normalize date format for Safari (YYYY.MM.DD -> YYYY-MM-DD)
  const normalizedDate = latestDetail.date.replace(/\./g, '-');
  
  return {
    id: event.id,
    name: event.name || `${event.location} 그란폰도`,
    status: 'archive',
    date: latestDetail.date,
    years: event.years.filter(year => event.yearDetails[year]?.status !== 'upcoming').map(String),
    categories: latestDetail.courses.map(course => ({
      name: course.name,
      distance: course.distance,
      elevation: course.elevation
    })),
    updatedAt: latestDetail.date,
    participants: latestDetail.totalRegistered,
    dDay: dayjs(normalizedDate).diff(dayjs(), 'day')
  };
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEventData, setRecentEventData] = useState<EventData[]>([]);
  const [upcomingEventData, setUpcomingEventData] = useState<EventData[]>([]);
  const [otherEvents, setOtherEvents] = useState<typeof events>([]);
  const [showSections, setShowSections] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Perform date-based filtering only on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
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
    const otherEventsTemp: typeof events = [];

    sortedEvents.forEach(event => {
      const latestYear = Math.max(...event.years);
      const latestDetail = event.yearDetails[latestYear];
      
      // Normalize date format for Safari (YYYY.MM.DD -> YYYY-MM-DD)
      const normalizedDate = latestDetail.date.replace(/\./g, '-');
      const eventDate = dayjs(normalizedDate);
      
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
      otherEventsTemp.push(event);
    });

    // Sort groups with safer date access
    recentEvents.sort((a, b) => {
      const aYear = a.yearDetails[currentYear] ? currentYear : Math.max(...a.years);
      const bYear = b.yearDetails[currentYear] ? currentYear : Math.max(...b.years);
      const aDateStr = a.yearDetails[aYear].date.replace(/\./g, '-');
      const bDateStr = b.yearDetails[bYear].date.replace(/\./g, '-');
      const aDate = dayjs(aDateStr);
      const bDate = dayjs(bDateStr);
      return bDate.valueOf() - aDate.valueOf();
    });

    upcomingEvents.sort((a, b) => {
      const aYear = a.yearDetails[currentYear] ? currentYear : Math.max(...a.years);
      const bYear = b.yearDetails[currentYear] ? currentYear : Math.max(...b.years);
      const aDateStr = a.yearDetails[aYear].date.replace(/\./g, '-');
      const bDateStr = b.yearDetails[bYear].date.replace(/\./g, '-');
      const aDate = dayjs(aDateStr);
      const bDate = dayjs(bDateStr);
      return aDate.valueOf() - bDate.valueOf();
    });

    setShowSections(recentEvents.length > 0 || upcomingEvents.length > 0);

    const recentData = recentEvents.map(e => {
      const data = mapToEventData(e);
      data.status = 'recently_updated';
      return data;
    });

    const upcomingData = upcomingEvents.map(e => {
      const data = mapToEventData(e);
      data.status = 'upcoming';
      return data;
    });

    setRecentEventData(recentData);
    setUpcomingEventData(upcomingData);
    setOtherEvents(otherEventsTemp);
    
    console.log('Event filtering complete:', {
      currentYear,
      recentCount: recentEvents.length,
      upcomingCount: upcomingEvents.length,
      otherCount: otherEventsTemp.length,
      upcomingEvents: upcomingEvents.map(e => ({
        id: e.id,
        name: e.name || e.location,
        date: e.yearDetails[Math.max(...e.years)].date
      }))
    });
  }, []); // Empty dependency array - only run once on mount

  // Apply search filtering
  const filterBySearch = (eventList: EventData[]) => {
    if (!searchQuery.trim()) return eventList;
    const query = searchQuery.toLowerCase();
    return eventList.filter(event => 
      event.name.toLowerCase().includes(query) ||
      event.id.toLowerCase().includes(query)
    );
  };

  const filteredRecentEvents = filterBySearch(recentEventData);
  const filteredUpcomingEvents = filterBySearch(upcomingEventData);
  const filteredOtherEvents = otherEvents.filter(event => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const eventName = event.name || `${event.location} 그란폰도`;
    return eventName.toLowerCase().includes(query) || event.id.toLowerCase().includes(query);
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <FondoScopeHeader />
      <HeroSection onSearch={handleSearch} onClearSearch={handleClearSearch} />
      <main className="py-12">
        <div className="space-y-12">

          {/* 최근 기록 업데이트 섹션 */}
          {mounted && recentEventData.length > 0 && (
            <EventCarousel
              icon="⚡️"
              title="최근 기록 업데이트"
              events={filteredRecentEvents}
            />
          )}

          {/* 다가오는 대회 섹션 */}
          {mounted && upcomingEventData.length > 0 && (
            <EventCarousel
              icon="📅"
              title="다가오는 대회"
              events={filteredUpcomingEvents}
            />
          )}

          {/* 전체 대회 섹션 */}
          {filteredOtherEvents.length > 0 && (
            <div className="container mx-auto px-4 space-y-6">
              {showSections && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📂</span>
                  <h2 className="text-2xl font-bold text-foreground">전체 대회 ({filteredOtherEvents.length})</h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOtherEvents.map((event) => (
                  <Link href={`/${event.id}`} key={event.id} className="block">
                    <EventCard event={mapToEventData(event)} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 검색 결과 없음 메시지 */}
          {searchQuery.trim() && 
           filteredRecentEvents.length === 0 && 
           filteredUpcomingEvents.length === 0 && 
           filteredOtherEvents.length === 0 && (
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
