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

const SPLIT_THRESHOLD = 6;
const MIN_GROUP_SIZE = 3;

type UpcomingCarousel = { title: string; events: EventData[] };

function getMonthKey(dateStr: string): number {
  const normalized = dateStr.replace(/\./g, '-');
  return dayjs(normalized).month();
}

function formatMonthLabel(months: number[]): string {
  if (months.length === 1) return `${months[0] + 1}월`;
  if (months.length === 2) return `${months[0] + 1}~${months[1] + 1}월`;
  return `${months[0] + 1}월 이후`;
}

export function splitUpcomingCarousels(events: EventData[]): UpcomingCarousel[] {
  if (events.length === 0) return [];
  if (events.length < SPLIT_THRESHOLD) {
    return [{ title: "다가오는 대회", events }];
  }

  // 1. 월 단위 그룹 (month: 0=1월, 1=2월, ...)
  const monthMap = new Map<number, EventData[]>();
  for (const event of events) {
    const month = getMonthKey(event.date);
    const list = monthMap.get(month) ?? [];
    list.push(event);
    monthMap.set(month, list);
  }

  const sortedMonths = [...monthMap.keys()].sort((a, b) => a - b);
  const groups: { months: number[]; events: EventData[] }[] = [];

  for (const month of sortedMonths) {
    const monthEvents = monthMap.get(month)!;
    if (groups.length === 0) {
      groups.push({ months: [month], events: monthEvents });
      continue;
    }

    const last = groups[groups.length - 1];
    if (last.events.length < MIN_GROUP_SIZE) {
      last.months.push(month);
      last.events.push(...monthEvents);
    } else {
      groups.push({ months: [month], events: monthEvents });
    }
  }

  // 마지막 그룹이 MIN 미만이면 직전 그룹에 흡수
  if (groups.length > 1 && groups[groups.length - 1].events.length < MIN_GROUP_SIZE) {
    const last = groups.pop()!;
    groups[groups.length - 1].months.push(...last.months);
    groups[groups.length - 1].events.push(...last.events);
  }

  return groups.map((g) => ({
    title: `다가오는 대회 (${formatMonthLabel(g.months)})`,
    events: g.events,
  }));
}

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

  const upcomingCarousels = splitUpcomingCarousels(filteredUpcomingEvents);

  return {
    recentEvents: filteredRecentEvents,
    upcomingCarousels,
    otherEvents: filteredOtherEvents,
    showSections: recentEvents.length > 0 || upcomingCarousels.length > 0
  };
}

