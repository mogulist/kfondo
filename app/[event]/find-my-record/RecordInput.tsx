"use client";
import { useState } from "react";

const isValidRecordFormat = (value: string) => {
  // 허용: HH:mm:ss 또는 HH:mm:ss.SS
  return /^\d{2}:\d{2}:\d{2}(\.\d{1,2})?$/.test(value);
};

const formatRecordInput = (value: string) => {
  // 숫자만 입력된 경우 자동 포맷팅 (50827 → 05:08:27)
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length === 6) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(
      4,
      6
    )}.${digits.slice(6, 8)}`;
  }
  return value;
};

const RecordInput = () => {
  const [record, setRecord] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // 자동 포맷팅
    value = formatRecordInput(value);
    setRecord(value);
    // 유효성 검사
    if (value && !isValidRecordFormat(value)) {
      setError("올바른 시간 형식이 아닙니다. 예: 05:08:27 또는 05:08:27.53");
    } else {
      setError("");
    }
  };

  return (
    <form
      className="max-w-xs mx-auto"
      autoComplete="off"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="record-input" className="block text-sm font-medium mb-2">
        기록 입력
      </label>
      <input
        id="record-input"
        name="record"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="예: 05:08:27 또는 05:08:27.53"
        className="w-full border rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={record}
        onChange={handleInputChange}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default RecordInput;
