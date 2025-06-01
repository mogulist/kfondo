import type { Metadata } from "next";
import { events } from "@/events.config";
import { getCourseNameById } from "./utils";

type GenerateFindRecordMetadataParams = {
  eventId: string;
  courseId: string;
  year: string;
};

export const generateFindRecordMetadata = ({
  eventId,
  courseId,
  year,
}: GenerateFindRecordMetadataParams): Metadata => {
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return {
      title: "페이지를 찾을 수 없습니다 | FondoScope",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  const courseName = getCourseNameById(eventId, year, courseId);

  const title = `${year ? `${year}년 ` : ""}${
    event.location
  } ${courseName} 기록 찾기 | FondoScope`;
  const description = `${year ? `${year}년 ` : ""}${
    event.location
  } ${courseName}의 기록을 입력하여 순위와 백분율을 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
};
