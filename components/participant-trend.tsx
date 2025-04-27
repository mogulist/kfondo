"use client"

import type React from "react"

import type { EventYearData } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface ParticipantTrendProps {
  eventData: EventYearData[]
}

// 커스텀 범례 렌더러
const CustomLegend = (props: any) => {
  const { payload } = props
  const isMobile = useMobile()

  if (!payload || payload.length === 0) return null

  return (
    <div className={`flex flex-wrap ${isMobile ? "justify-start gap-2 text-xs" : "justify-center gap-4 text-sm"} mt-2`}>
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ParticipantTrend({ eventData }: ParticipantTrendProps) {
  const isMobile = useMobile()
  const isTablet = useMobile(1024) // 1024px 미만을 태블릿으로 간주
  const [currentYearIndex, setCurrentYearIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const data = eventData.map((d) => ({
    year: d.year,
    granFondoRegistered: d.granFondoRegistered,
    granFondoParticipants: d.granFondoParticipants,
    medioFondoRegistered: d.medioFondoRegistered,
    medioFondoParticipants: d.medioFondoParticipants,
  }))

  // 연도 데이터를 내림차순으로 정렬 (최신 연도가 먼저 오도록)
  const sortedData = [...data].sort((a, b) => b.year - a.year)

  // 모바일에서 한 번에 보여줄 연도 수
  const yearsPerView = isMobile ? 2 : sortedData.length

  // 현재 보여줄 데이터 슬라이스
  const currentData = sortedData.slice(currentYearIndex, currentYearIndex + yearsPerView)

  // 최대 인덱스 계산 (마지막 페이지가 꽉 차지 않아도 됨)
  const maxIndex = Math.max(0, sortedData.length - yearsPerView)

  // 초기 위치를 최신 연도로 설정
  useEffect(() => {
    setCurrentYearIndex(0) // 최신 연도부터 시작 (내림차순 정렬했으므로)
  }, [eventData])

  // 이전/다음 연도 이동 함수
  const goToPrevYears = () => {
    setCurrentYearIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const goToNextYears = () => {
    setCurrentYearIndex((prev) => Math.max(prev - 1, 0))
  }

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentYearIndex < maxIndex) {
      goToPrevYears() // 왼쪽으로 스와이프하면 이전 연도(더 오래된 연도)로
    }

    if (isRightSwipe && currentYearIndex > 0) {
      goToNextYears() // 오른쪽으로 스와이프하면 다음 연도(더 최신 연도)로
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className="h-full w-full">
      <div className={`${isTablet ? "flex flex-col gap-8" : "grid grid-cols-2 gap-12"} h-full`}>
        <div className={`${isMobile ? "h-[200px]" : "h-full"} w-full border-r-0 sm:border-r sm:pr-4 border-border/30`}>
          <h3 className="text-lg font-medium mb-2">그란폰도</h3>
          <div
            ref={containerRef}
            className="relative h-[calc(100%-2rem)]"
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            {isMobile && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-sm"
                  onClick={goToNextYears}
                  disabled={currentYearIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 연도</span>
                </Button>
              </div>
            )}

            {isMobile && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-sm"
                  onClick={goToPrevYears}
                  disabled={currentYearIndex >= maxIndex}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 연도</span>
                </Button>
              </div>
            )}

            <ChartContainer
              config={{
                registered: {
                  label: "등록자",
                  color: "hsl(215, 90%, 80%)",
                },
                participants: {
                  label: "참가자",
                  color: "hsl(215, 90%, 50%)",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    isMobile
                      ? currentData.map((d) => ({
                          year: d.year,
                          registered: d.granFondoRegistered,
                          participants: d.granFondoParticipants,
                        }))
                      : data.map((d) => ({
                          year: d.year,
                          registered: d.granFondoRegistered,
                          participants: d.granFondoParticipants,
                        }))
                  }
                  margin={{
                    top: 10,
                    right: isMobile ? 20 : 30,
                    left: isMobile ? 0 : 0,
                    bottom: isMobile ? 60 : 40,
                  }}
                  barSize={isMobile ? 20 : 20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: isMobile ? 12 : 12 }}
                    tickFormatter={(value) => `${value}년`}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                  <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                  <Legend content={CustomLegend} verticalAlign="bottom" height={isMobile ? 50 : 36} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {isMobile && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
                {Array.from({ length: Math.ceil(sortedData.length / yearsPerView) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i === currentYearIndex / yearsPerView ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${isMobile ? "h-[200px]" : "h-full"} w-full sm:pl-4`}>
          <h3 className="text-lg font-medium mb-2">메디오폰도</h3>
          <div
            className="relative h-[calc(100%-2rem)]"
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            {isMobile && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-sm"
                  onClick={goToNextYears}
                  disabled={currentYearIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 연도</span>
                </Button>
              </div>
            )}

            {isMobile && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 shadow-sm"
                  onClick={goToPrevYears}
                  disabled={currentYearIndex >= maxIndex}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 연도</span>
                </Button>
              </div>
            )}

            <ChartContainer
              config={{
                registered: {
                  label: "등록자",
                  color: "hsl(150, 80%, 80%)",
                },
                participants: {
                  label: "참가자",
                  color: "hsl(150, 80%, 40%)",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    isMobile
                      ? currentData.map((d) => ({
                          year: d.year,
                          registered: d.medioFondoRegistered,
                          participants: d.medioFondoParticipants,
                        }))
                      : data.map((d) => ({
                          year: d.year,
                          registered: d.medioFondoRegistered,
                          participants: d.medioFondoParticipants,
                        }))
                  }
                  margin={{
                    top: 10,
                    right: isMobile ? 20 : 30,
                    left: isMobile ? 0 : 0,
                    bottom: isMobile ? 60 : 40,
                  }}
                  barSize={isMobile ? 20 : 20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: isMobile ? 12 : 12 }}
                    tickFormatter={(value) => `${value}년`}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                  <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                  <Legend content={CustomLegend} verticalAlign="bottom" height={isMobile ? 50 : 36} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {isMobile && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
                {Array.from({ length: Math.ceil(sortedData.length / yearsPerView) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i === currentYearIndex / yearsPerView ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
