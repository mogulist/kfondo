"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RecordInput, {
  isValidRecordFormat,
  formatRecordInput,
} from "./RecordInput";
import type { Event, EventV2 } from "@/lib/types";

interface FindMyRecordSectionProps {
  event: Event | EventV2;
  latestYear: number;
  eventName: string;
}

const FindMyRecordSection = ({
  event,
  latestYear,
  eventName,
}: FindMyRecordSectionProps) => {
  const [record, setRecord] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // 결과 표시용 상태 (추후 순위/백분율 등)
  // const [result, setResult] = useState(null);

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
    router.push(`/${event.id}/find-by-record/${digit}`);
  };

  return (
    <div className="space-y-12 max-w-full px-4 py-4">
      <div className="text-xl text-muted-foreground font-semibold mb-8">
        {latestYear} {eventName}
      </div>
      <RecordInput
        value={record}
        onChange={handleRecordChange}
        error={error}
        onSubmit={handleSubmit}
      />
      {/* 결과 표시 영역 (추후 구현) */}
    </div>
  );
};

export default FindMyRecordSection;
