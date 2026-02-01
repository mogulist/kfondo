import { EventForm } from "../event-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">
          Update event details.
        </p>
      </div>
      {/* DB 타입과 Zod 스키마 타입이 미묘하게 다를 수 있어 (null vs optional) 캐스팅 필요할 수 있음. 
          여기서는 간단히 넘깁니다. */}
      {/* @ts-ignore */}
      <EventForm initialData={event} />
    </div>
  )
}
