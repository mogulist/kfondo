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
        participant.Event === curr.id || participant.Event === curr.name
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
  let participantsCount = 0;

  participants.forEach((participant) => {
    if (participant.Event === course.id || participant.Event === course.name) {
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
  let dnfCount = 0;

  participants.forEach((participant) => {
    if (
      (participant.Event === course.id || participant.Event === course.name) &&
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
  const recentYear = event.years[event.years.length - 1];
  const recentYearDetail = event.yearDetails[recentYear];
  const baseCourses = recentYearDetail.courses.map((course) => ({
    id: course.id,
    name: course.name,
  }));

  const recentlyFirstSortedYears = event.years.sort((a, b) => b - a);

  const eventParticipantTrends: EventParticipantTrends = baseCourses.map(
    (course) => {
      const yearlyData: EventParticipantTrendForYear[] = [];

      recentlyFirstSortedYears.forEach((year) => {
        const courseData = event.yearDetails[year].courses.find(
          (c) => c.id === course.id
        );
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
