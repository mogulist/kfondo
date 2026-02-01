import dayjs from "dayjs";
import { getAllEvents } from "@/lib/db/events";
import type { EventData } from "@/components/EventCard";
import type { Event } from "@/lib/types";

// Helper to map raw event to EventCard props
export const mapToEventData = (event: Event): EventData => {
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

// Server-side event filtering logic
export async function getFilteredEvents(searchQuery?: string) {
  const events = await getAllEvents();
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

  // Apply search filtering
  const filterBySearch = (eventList: EventData[]) => {
    if (!searchQuery || !searchQuery.trim()) return eventList;
    const query = searchQuery.toLowerCase();
    return eventList.filter(event => 
      event.name.toLowerCase().includes(query) ||
      event.id.toLowerCase().includes(query)
    );
  };

  const filteredRecentEvents = filterBySearch(recentData);
  const filteredUpcomingEvents = filterBySearch(upcomingData);
  const filteredOtherEvents = otherEventsTemp.filter(event => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const eventName = event.name || `${event.location} 그란폰도`;
    return eventName.toLowerCase().includes(query) || event.id.toLowerCase().includes(query);
  });

  return {
    recentEvents: filteredRecentEvents,
    upcomingEvents: filteredUpcomingEvents,
    otherEvents: filteredOtherEvents,
    showSections: recentEvents.length > 0 || upcomingEvents.length > 0
  };
}

