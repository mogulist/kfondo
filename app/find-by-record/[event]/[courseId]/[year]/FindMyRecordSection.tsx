"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RecordInput, { isValidRecordFormat } from "./RecordInput";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import posthog from "posthog-js";

type Props = {
  event: Event;
  eventName: string;
  courseId: string;
  year: string;
};

const FindMyRecordSection = ({ event, eventName, courseId, year }: Props) => {
  const [record, setRecord] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRecordChange = (value: string) => {
    setRecord(value);
    if (value && !isValidRecordFormat(value)) {
      setError("올바른 시간 형식이 아닙니다. 예: 05:08:27 또는 05:08:27.53");
    } else {
      setError("");
    }
  };

  // HH:mm:ss(.SS) → digit string 변환
  const toDigitString = (value: string) => {
    return value.replace(/[^\d]/g, "");
  };

  const handleSubmit = () => {
    if (!record || error) return;
    const digit = toDigitString(record);
    posthog.capture("record_lookup_submitted", {
      event_id: event.id,
      course_id: courseId,
      year,
      is_past_year: Number(year) !== new Date().getFullYear(),
    });
    router.push(`/find-by-record/${event.id}/${courseId}/${year}/${digit}`);
  };

  const yearDetail = event.yearDetails[Number(year)];
  const courseInfo = yearDetail?.courses.find((course) => course.id === courseId);

  return (
    <div className="max-w-full px-4 py-4">
      <div className="text-xl text-muted-foreground font-semibold mb-4">
        {year}년 {eventName}
      </div>
      {courseInfo && (
        <div className="flex gap-2">
          <Badge className="bg-blue-600 text-white">{courseInfo.name}</Badge>
          <Badge className="bg-green-600 text-white">
            {courseInfo.distance}km
          </Badge>
          {typeof courseInfo.elevation === "number" && (
            <Badge className="bg-orange-500 text-white">
              {courseInfo.elevation}m
            </Badge>
          )}
        </div>
      )}
      <RecordInput
        value={record}
        onChange={handleRecordChange}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FindMyRecordSection;
