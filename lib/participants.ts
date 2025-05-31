import fs from "fs";
import path from "path";
import type { Event, EventYear, GranMedio } from "./types";

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
): GranMedio {
  const participants = readParticipants(eventId, year);

  const granfondoParticipants = participants.filter(
    (participant) => participant.Event === "그란폰도"
  ).length;

  const mediofondoParticipants = participants.filter(
    (participant) => participant.Event === "메디오폰도"
  ).length;

  return {
    granfondo: granfondoParticipants,
    mediofondo: mediofondoParticipants,
  };
}

export function calculateDNF(eventId: string, year: number): GranMedio {
  const participants = readParticipants(eventId, year);

  const granfondoDNF = participants.filter(
    (participant) =>
      participant.Event === "그란폰도" && participant.Status === "DNF"
  ).length;

  const mediofondoDNF = participants.filter(
    (participant) =>
      participant.Event === "메디오폰도" && participant.Status === "DNF"
  ).length;

  return {
    granfondo: granfondoDNF,
    mediofondo: mediofondoDNF,
  };
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
};
type EventParticipantTrendForACourse = {
  id: string;
  name: string;
  yearlyData: EventParticipantTrendForYear[];
};

type EventParticipantTrends = EventParticipantTrendForACourse[];

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

  console.log("courses", baseCourses);

  const eventParticipantTrends: EventParticipantTrends = baseCourses.map(
    (course) => {
      const yearlyData: EventParticipantTrendForYear[] = [];

      event.years.forEach((year) => {
        const courseData = event.yearDetails[year].courses.find(
          (c) => c.id === course.id
        );
        yearlyData.push({
          year,
          registered: courseData?.registered ?? 0,
          participants: calculateParticipantsFor(event.id, course, year),
          dnf: calculateDNFsFor(event.id, course, year),
        });
      });

      return {
        id: course.id,
        name: course.name,
        yearlyData,
      };
    }
  );

  console.log("eventParticipantTrends", eventParticipantTrends);

  return eventParticipantTrends;
};
