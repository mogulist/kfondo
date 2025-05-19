"use client";
import { useRouter } from "next/navigation";
import type { FC } from "react";

const StackNavBar: FC = () => {
  const router = useRouter();
  return (
    <nav className="flex items-center px-2 py-3 border-b bg-white dark:bg-background sticky top-0 z-20">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center px-2 py-1"
        aria-label="뒤로가기"
      >
        {/* Heroicons mini/chevron-left-solid */}
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-gray-900 dark:text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <span className="ml-1 text-base font-medium text-gray-900 dark:text-white">
          기록으로 찾기
        </span>
      </button>
    </nav>
  );
};

export default StackNavBar;
