"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

export function HeroSection({ onSearch, onClearSearch }: HeroSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    onSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue("");
    onClearSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-background dark:to-background py-16 md:py-20 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-6">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50">
            내 기록은 몇 등일까?
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            한국 그란폰도 기록 통계
          </p>
          
          {/* Description */}
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            목표 기록을 시뮬레이션하고 순위를 예측하세요
          </p>
          
          {/* Search Bar */}
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
        </div>
      </div>
    </div>
  );
}
