"use client"

import { getEventYearStats } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import type { EventYearStats } from "@/lib/types"

interface StatsChartProps {
  eventId: string
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

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timeRange = label // 시간 범위
    const participants = payload[0].value // 참가자 수
    const percentile = payload[0].payload.percentile // 백분위

    return (
      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-2 text-foreground">{`시간 범위: ${timeRange}`}</p>
        <div className="space-y-1">
          <p className="text-sm text-foreground">{`참가자: ${participants}명`}</p>
          <p className="text-sm text-foreground">{`상위: ${percentile}%`}</p>
        </div>
      </div>
    )
  }

  return null
}

// X축 레이블 포맷팅 함수 추가
const formatXAxisTick = (value: string, isMobile: boolean) => {
  const parts = value.split(" - ")
  if (isMobile) {
    return parts[0]
  }

  // 모바일이 아닌 경우 5분 간격이면 일부 레이블만 표시
  const time = parts[0]
  const [hours, minutes] = time.split(":")

  // 15분 간격으로만 레이블 표시 (5분, 20분, 35분, 50분은 빈 문자열 반환)
  if (["00", "15", "30", "45"].includes(minutes)) {
    return time
  }
  return ""
}

export function StatsChart({ eventId }: StatsChartProps) {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get("year")
  const isMobile = useMobile()
  const isTablet = useMobile(1024) // 1024px 미만을 태블릿으로 간주

  const [stats, setStats] = useState<EventYearStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const yearData = yearParam ? Number.parseInt(yearParam) : undefined
        const statsData = await getEventYearStats(eventId, yearData)
        setStats(statsData)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [eventId, yearParam])

  if (loading) {
    return <div className="flex h-full items-center justify-center">데이터를 불러오는 중...</div>
  }

  if (!stats) {
    return <div className="flex h-full items-center justify-center">데이터가 없습니다.</div>
  }

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      key={yearParam || "latest"}
    >
      <div className={`${isTablet ? "flex flex-col gap-8" : "grid grid-cols-2 gap-12"} h-full`}>
        <div className={`${isMobile ? "h-[250px]" : "h-full"} w-full border-r-0 sm:border-r sm:pr-4 border-border/30`}>
          <h3 className="text-lg font-medium mb-4">그란폰도 ({stats.year}년)</h3>
          <div className="h-[calc(100%-2rem)] w-full">
            <ChartContainer
              config={{
                participants: {
                  label: "참가자 수",
                  color: "hsl(215, 90%, 50%)",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.granFondoDistribution}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 0,
                    bottom: isMobile ? 70 : 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timeRange"
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 80 : 70}
                    tick={{ fontSize: isMobile ? 8 : 12 }}
                    tickFormatter={(value) => formatXAxisTick(value, isMobile)}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    name="참가자 수"
                    dataKey="participants"
                    stroke="var(--color-participants)"
                    fill="var(--color-participants)"
                    fillOpacity={0.2}
                  />
                  <Legend content={CustomLegend} verticalAlign="top" height={isMobile ? 20 : 36} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className={`${isMobile ? "h-[250px]" : "h-full"} w-full sm:pl-4`}>
          <h3 className="text-lg font-medium mb-4">메디오폰도 ({stats.year}년)</h3>
          <div className="h-[calc(100%-2rem)] w-full">
            <ChartContainer
              config={{
                participants: {
                  label: "참가자 수",
                  color: "hsl(150, 80%, 40%)",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.medioFondoDistribution}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 0,
                    bottom: isMobile ? 70 : 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timeRange"
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 80 : 70}
                    tick={{ fontSize: isMobile ? 8 : 12 }}
                    tickFormatter={(value) => formatXAxisTick(value, isMobile)}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    name="참가자 수"
                    dataKey="participants"
                    stroke="var(--color-participants)"
                    fill="var(--color-participants)"
                    fillOpacity={0.2}
                  />
                  <Legend content={CustomLegend} verticalAlign="top" height={isMobile ? 20 : 36} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
