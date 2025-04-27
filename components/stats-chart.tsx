"use client"

import { getEventYearStats } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

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

export function StatsChart({ eventId }: StatsChartProps) {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get("year")
  const isMobile = useMobile()
  const isTablet = useMobile(1024) // 1024px 미만을 태블릿으로 간주

  const stats = getEventYearStats(eventId, yearParam ? Number.parseInt(yearParam) : undefined)

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
                    tickFormatter={(value) => (isMobile ? value.split(" - ")[0] : value.replace(" - ", "\n"))}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => {
                          const { payload } = props
                          const percentile = payload.percentile
                          return [`${value}명`, `${name} (상위 ${percentile}%)`]
                        }}
                      />
                    }
                  />
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
                    tickFormatter={(value) => (isMobile ? value.split(" - ")[0] : value.replace(" - ", "\n"))}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => {
                          const { payload } = props
                          const percentile = payload.percentile
                          return [`${value}명`, `${name} (상위 ${percentile}%)`]
                        }}
                      />
                    }
                  />
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
