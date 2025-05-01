import type { GranMedio } from "./types";
import fs from "fs";
import path from "path";

interface Participant {
  BIB_NO: number;
  Gender: string;
  Event: string;
  Time: string;
  Status: string;
}

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
