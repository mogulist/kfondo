import fs from "fs";
import path from "path";
import type { Event, GranMedio } from "./types";
import { events } from "@/events.config";

type Participant = {
  BIB_NO: number;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
};

function readParticipants(eventId: string, year: number): Participant[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      `${eventId}_${year}.json`
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading participants for ${eventId} ${year}:`, error);
    return [];
  }
}

export function calculateParticipants(
  eventId: string,
  year: number
): Record<string, number> {
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const { courses } = event.yearDetails[year];
  const courseIdsNames = courses.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const participants = readParticipants(eventId, year);

  return courseIdsNames.reduce((acc: Record<string, number>, curr) => {
    const count = participants.filter(
      (participant) =>
        (participant.Event === curr.id || participant.Event === curr.name) &&
        participant.Status !== "DNS"
    ).length;
    acc[curr.id] = count;
    return acc;
  }, {});
}

export function calculateDNF(
  eventId: string,
  year: number
): Record<string, number> {
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const { courses } = event.yearDetails[year];
  const courseIdsNames = courses.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const participants = readParticipants(eventId, year);

  return courseIdsNames.reduce((acc: Record<string, number>, curr) => {
    const count = participants.filter(
      (participant) =>
        (participant.Event === curr.id || participant.Event === curr.name) &&
        participant.Status === "DNF"
    ).length;
    acc[curr.id] = count;
    return acc;
  }, {});
}

export function calculateParticipantsFor(
  eventId: string,
  course: BaseCourse,
  year: number
): number {
  const participants = readParticipants(eventId, year);
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  const yearDetail = event ? event.yearDetails[year] : undefined;
  const courseForYear = yearDetail?.courses.find((c) => c.id === course.id);
  const courseNameForYear = courseForYear?.name ?? course.name;
  let participantsCount = 0;

  participants.forEach((participant) => {
    if (
      (participant.Event === course.id ||
        participant.Event === courseNameForYear ||
        participant.Event === course.name) &&
      participant.Status !== "DNS"
    ) {
      participantsCount++;
    }
  });

  return participantsCount;
}

export function calculateDNFsFor(
  eventId: string,
  course: BaseCourse,
  year: number
): number {
  const participants = readParticipants(eventId, year);
  const event = events.find((e) => e.id === eventId) as Event | undefined;
  const yearDetail = event ? event.yearDetails[year] : undefined;
  const courseForYear = yearDetail?.courses.find((c) => c.id === course.id);
  const courseNameForYear = courseForYear?.name ?? course.name;
  let dnfCount = 0;

  participants.forEach((participant) => {
    if (
      (participant.Event === course.id ||
        participant.Event === courseNameForYear ||
        participant.Event === course.name) &&
      participant.Status === "DNF"
    ) {
      dnfCount++;
    }
  });

  return dnfCount;
}

type EventParticipantTrendForYear = {
  year: number;
  registered: number;
  participants: number;
  dnf: number;
  participationRate: string;
  completionRate: string;
};
type EventParticipantTrendForACourse = {
  id: string;
  name: string;
  yearlyData: EventParticipantTrendForYear[];
};

export type EventParticipantTrends = EventParticipantTrendForACourse[];

type BaseCourse = {
  id: string;
  name: string;
};

export const getEventParticipantTrend = (
  event: Event
): EventParticipantTrends => {
  // 모든 연도의 코스 id 합집합으로 시리즈 기준을 만든다
  const idToName: Record<string, string> = {};
  event.years.forEach((y) => {
    const yd = event.yearDetails[y];
    yd.courses.forEach((c) => {
      // 표준 코스명은 고정, 그 외는 최초 등장 name을 사용
      if (c.id === "granfondo") idToName[c.id] = "그란폰도";
      else if (c.id === "mediofondo") idToName[c.id] = "메디오폰도";
      else if (!(c.id in idToName)) idToName[c.id] = c.name;
    });
  });
  const baseCourses = Object.entries(idToName).map(([id, name]) => ({
    id,
    name,
  }));

  const recentlyFirstSortedYears = event.years.sort((a, b) => b - a);

  const eventParticipantTrends: EventParticipantTrends = baseCourses.map(
    (course) => {
      const yearlyData: EventParticipantTrendForYear[] = [];

      recentlyFirstSortedYears.forEach((year) => {
        const yearDetail = event.yearDetails[year];

        // preparing 상태인 연도는 데이터가 없으므로 건너뛰기
        if (yearDetail.status === "preparing") {
          return;
        }

        const courseData = yearDetail.courses.find((c) => c.id === course.id);
        const registered = courseData?.registered ?? 0;
        const participants = calculateParticipantsFor(event.id, course, year);
        const dnf = calculateDNFsFor(event.id, course, year);
        const participationRate =
          registered === 0
            ? "0"
            : ((100 * participants) / registered).toFixed(1);
        const completionRate = dnf
          ? ((100 * (participants - dnf)) / participants).toFixed(1)
          : "100";

        yearlyData.push({
          year,
          registered: courseData?.registered ?? 0,
          participants,
          dnf,
          participationRate,
          completionRate,
        });
      });

      return {
        id: course.id,
        name: course.name,
        yearlyData,
      };
    }
  );

  return eventParticipantTrends;
};
