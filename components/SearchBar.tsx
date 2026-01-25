"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  initialQuery?: string;
};

export function SearchBar({ initialQuery = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(initialQuery);

  // Sync input with URL query parameter
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setInputValue(query);
  }, [searchParams]);

  const handleSearch = () => {
    const query = inputValue.trim();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  const handleClear = () => {
    setInputValue("");
    router.push('/');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="대회 이름을 검색하세요 (예: 통영, 무주)"
            className="pl-12 pr-10 py-6 text-base bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500 dark:text-gray-100 dark:placeholder:text-gray-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="검색어 지우기"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          size="icon"
          className="h-[52px] w-[52px] bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
          aria-label="검색"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
