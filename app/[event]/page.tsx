import { ParticipantTrend } from "@/components/participant-trend"
import { StatsChart } from "@/components/stats-chart"
import { YearSelector } from "@/components/year-selector"
import { events, getEventData } from "@/lib/data"
import { notFound } from "next/navigation"

interface EventPageProps {
  params: {
    event: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const eventId = params.event
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    notFound()
  }

  const eventData = getEventData(eventId)
  const latestYear = Math.max(...eventData.map((d) => d.year))

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="space-y-12 max-w-full">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{event.location} 그란폰도</h1>
          <p className="text-xl text-muted-foreground">
            {event.years[0]}년부터 {event.years[event.years.length - 1]}년까지의 통계 데이터
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">연도별 참가자 추세</h2>
            <div className="h-[400px] md:h-[500px] w-full">
              <ParticipantTrend eventData={eventData} />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <h2 className="text-2xl font-semibold">기록 분포</h2>
              <YearSelector years={event.years} defaultYear={latestYear} />
            </div>
            <div className="h-[500px] md:h-[600px] w-full overflow-hidden">
              <StatsChart eventId={eventId} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
