"use client"

import type { EventYearData } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useRef, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChartIcon, TableIcon } from "lucide-react"

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

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const registered = payload[0].value
    const participants = payload[1].value
    const dnf = payload.length > 2 ? payload[2].value : 0
    const participationRate = ((participants / registered) * 100).toFixed(1)
    const completionRate = dnf > 0 ? (((participants - dnf) / participants) * 100).toFixed(1) : "100.0"

    return (
      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{`${label}년`}</p>
        <p className="text-xs mb-1">{`등록자: ${registered}명`}</p>
        <p className="text-xs mb-1">{`참가자: ${participants}명`}</p>
        {dnf > 0 && <p className="text-xs mb-1">{`DNF: ${dnf}명`}</p>}
        <p className="text-xs font-medium">{`참가율: ${participationRate}%`}</p>
        <p className="text-xs font-medium">{`완주율: ${completionRate}%`}</p>
      </div>
    )
  }

  return null
}

export function ParticipantTrend({ eventData }: ParticipantTrendProps) {
  const isMobile = useMobile()
  const isTablet = useMobile(1024) // 1024px 미만을 태블릿으로 간주
  const scrollRef = useRef<HTMLDivElement>(null)
  const [viewType, setViewType] = useState<"chart" | "table">("chart")

  const data = eventData.map((d) => ({
    year: d.year,
    granFondoRegistered: d.granFondoRegistered,
    granFondoParticipants: d.granFondoParticipants,
    granFondoDNF: d.granFondoDNF || 0,
    granFondoRate: ((d.granFondoParticipants / d.granFondoRegistered) * 100).toFixed(1),
    granFondoCompletionRate: d.granFondoDNF
      ? (((d.granFondoParticipants - d.granFondoDNF) / d.granFondoParticipants) * 100).toFixed(1)
      : "100.0",
    medioFondoRegistered: d.medioFondoRegistered,
    medioFondoParticipants: d.medioFondoParticipants,
    medioFondoDNF: d.medioFondoDNF || 0,
    medioFondoRate: ((d.medioFondoParticipants / d.medioFondoRegistered) * 100).toFixed(1),
    medioFondoCompletionRate: d.medioFondoDNF
      ? (((d.medioFondoParticipants - d.medioFondoDNF) / d.medioFondoParticipants) * 100).toFixed(1)
      : "100.0",
  }))

  // 연도 데이터를 내림차순으로 정렬 (최신 연도가 먼저 오도록)
  const sortedData = [...data].sort((a, b) => b.year - a.year)

  // 모바일에서의 차트 너비 계산
  const chartWidth = isMobile ? 100 : 120 // 각 연도별 차트의 너비 (간격 좁힘)
  const totalWidth = sortedData.length * chartWidth // 전체 스크롤 영역 너비

  return (
    <div className="h-full w-full">
      <div className="flex justify-end mb-4">
        <Tabs
          defaultValue="chart"
          className="w-[180px]"
          onValueChange={(value) => setViewType(value as "chart" | "table")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">
              <BarChartIcon className="h-4 w-4 mr-1" />
              <span>차트</span>
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-1" />
              <span>테이블</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={`${isTablet ? "flex flex-col space-y-6" : "grid grid-cols-2 gap-8"} px-4`}>
        <div className="w-full">
          <h3 className="text-lg font-medium mb-2">그란폰도</h3>
          {viewType === "chart" ? (
            isMobile ? (
              <div
                ref={scrollRef}
                className="relative overflow-x-auto pb-6 hide-scrollbar"
                style={{ overscrollBehavior: "contain" }}
              >
                <div style={{ width: `${totalWidth}px` }}>
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
                      dnf: {
                        label: "DNF",
                        color: "hsl(0, 80%, 60%)",
                      },
                    }}
                  >
                    <BarChart
                      data={sortedData.map((d) => ({
                        year: d.year,
                        registered: d.granFondoRegistered,
                        participants: d.granFondoParticipants,
                        dnf: d.granFondoDNF,
                      }))}
                      margin={{
                        top: 20,
                        right: 16,
                        left: 16,
                        bottom: 20,
                      }}
                      barSize={30}
                      barGap={2}
                      width={totalWidth}
                      height={320}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tickFormatter={(value) => `${value}년`} height={35} />
                      <YAxis type="number" domain={[0, "dataMax + 100"]} width={45} />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                      <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                      <Bar name="DNF" dataKey="dnf" fill="var(--color-dnf)" />
                      <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground">
                  ← 좌우로 스크롤하여 더 많은 연도 확인 →
                </div>
              </div>
            ) : (
              <div>
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
                    dnf: {
                      label: "DNF",
                      color: "hsl(0, 80%, 60%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={data.map((d) => ({
                        year: d.year,
                        registered: d.granFondoRegistered,
                        participants: d.granFondoParticipants,
                        dnf: d.granFondoDNF,
                      }))}
                      margin={{
                        top: 20,
                        right: 16,
                        left: 16,
                        bottom: 20,
                      }}
                      barSize={20}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}년`} height={35} />
                      <YAxis tick={{ fontSize: 12 }} width={45} />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                      <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                      <Bar name="DNF" dataKey="dnf" fill="var(--color-dnf)" />
                      <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )
          ) : (
            <div className="h-[250px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">연도</TableHead>
                    <TableHead>등록자</TableHead>
                    <TableHead>참가자</TableHead>
                    <TableHead>DNF</TableHead>
                    <TableHead className="text-right">참가율</TableHead>
                    <TableHead className="text-right">완주율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}년</TableCell>
                      <TableCell>{item.granFondoRegistered}명</TableCell>
                      <TableCell>{item.granFondoParticipants}명</TableCell>
                      <TableCell>{item.granFondoDNF}명</TableCell>
                      <TableCell className="text-right">{item.granFondoRate}%</TableCell>
                      <TableCell className="text-right">{item.granFondoCompletionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className="text-lg font-medium mb-2">메디오폰도</h3>
          {viewType === "chart" ? (
            isMobile ? (
              <div
                ref={scrollRef}
                className="relative overflow-x-auto pb-6 hide-scrollbar"
                style={{ overscrollBehavior: "contain" }}
              >
                <div style={{ width: `${totalWidth}px` }}>
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
                      dnf: {
                        label: "DNF",
                        color: "hsl(0, 80%, 60%)",
                      },
                    }}
                  >
                    <BarChart
                      data={sortedData.map((d) => ({
                        year: d.year,
                        registered: d.medioFondoRegistered,
                        participants: d.medioFondoParticipants,
                        dnf: d.medioFondoDNF,
                      }))}
                      margin={{
                        top: 20,
                        right: 16,
                        left: 16,
                        bottom: 20,
                      }}
                      barSize={30}
                      barGap={2}
                      width={totalWidth}
                      height={320}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tickFormatter={(value) => `${value}년`} height={35} />
                      <YAxis type="number" domain={[0, "dataMax + 100"]} width={45} />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                      <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                      <Bar name="DNF" dataKey="dnf" fill="var(--color-dnf)" />
                      <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground">
                  ← 좌우로 스크롤하여 더 많은 연도 확인 →
                </div>
              </div>
            ) : (
              <div>
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
                    dnf: {
                      label: "DNF",
                      color: "hsl(0, 80%, 60%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={data.map((d) => ({
                        year: d.year,
                        registered: d.medioFondoRegistered,
                        participants: d.medioFondoParticipants,
                        dnf: d.medioFondoDNF,
                      }))}
                      margin={{
                        top: 20,
                        right: 16,
                        left: 16,
                        bottom: 20,
                      }}
                      barSize={20}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}년`} height={35} />
                      <YAxis tick={{ fontSize: 12 }} width={45} />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Bar name="등록자" dataKey="registered" fill="var(--color-registered)" />
                      <Bar name="참가자" dataKey="participants" fill="var(--color-participants)" />
                      <Bar name="DNF" dataKey="dnf" fill="var(--color-dnf)" />
                      <Legend content={CustomLegend} verticalAlign="bottom" height={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )
          ) : (
            <div className="h-[250px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">연도</TableHead>
                    <TableHead>등록자</TableHead>
                    <TableHead>참가자</TableHead>
                    <TableHead>DNF</TableHead>
                    <TableHead className="text-right">참가율</TableHead>
                    <TableHead className="text-right">완주율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}년</TableCell>
                      <TableCell>{item.medioFondoRegistered}명</TableCell>
                      <TableCell>{item.medioFondoParticipants}명</TableCell>
                      <TableCell>{item.medioFondoDNF}명</TableCell>
                      <TableCell className="text-right">{item.medioFondoRate}%</TableCell>
                      <TableCell className="text-right">{item.medioFondoCompletionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
