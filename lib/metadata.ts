import type { Metadata } from "next";
import { events } from "@/events.config";
import type { Event } from "@/lib/types";

type GenerateFindRecordMetadataParams = {
  eventId: string;
  course?: string;
  year?: string;
};

export const generateFindRecordMetadata = ({
  eventId,
  course,
  year,
}: GenerateFindRecordMetadataParams): Metadata => {
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return {
      title: "페이지를 찾을 수 없습니다 | FondoScope",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  const courseName = course === "granfondo" ? "그란폰도" : "메디오폰도";

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
