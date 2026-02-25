import { getEventById } from "@/lib/db/events";
import { notFound } from "next/navigation";
import { CourseMapClient } from "./CourseMapClient";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ event: string; courseId: string }>;
  searchParams: Promise<{ year?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { event: eventSlug, courseId } = await params;
  const { year: yearStr } = await searchParams;
  const event = await getEventById(eventSlug);
  if (!event) return { title: "코스 지도" };
  const year = yearStr ? Number(yearStr) : Math.max(...event.years, 0);
  const detail = event.yearDetails[year];
  const course = detail?.courses?.find((c) => c.id === courseId);
  const title = course?.name
    ? `${course.name} - ${event.name ?? eventSlug} 코스 지도`
    : "코스 지도";
  return { title };
}

export default async function CourseMapPage({ params, searchParams }: Props) {
  const { event: eventSlug, courseId } = await params;
  const { year: yearStr } = await searchParams;

  const event = await getEventById(eventSlug);
  if (!event) notFound();

  const year = yearStr ? Number(yearStr) : (event.years.length ? Math.max(...event.years) : 0);
  const detail = event.yearDetails[year];
  const course = detail?.courses?.find((c) => c.id === courseId);

  if (!course?.gpxBlobUrl) notFound();

  const eventName = event.name ?? eventSlug;
  const courseName = course.name;
  const distanceLabel =
    typeof course.distance === "number" && course.distance > 0
      ? ` (${course.distance}km)`
      : "";

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={`/${eventSlug}`}
            className="inline-flex items-center justify-center size-9 rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground shrink-0"
            aria-label={`${eventName}(으)로 돌아가기`}
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">
              {eventName}
            </p>
            <h1 className="text-xl font-bold text-foreground truncate">
              {courseName}
              {distanceLabel}
            </h1>
          </div>
        </div>
        <div className="w-full h-[70vh] min-h-[400px] rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <CourseMapClient gpxBlobUrl={course.gpxBlobUrl} />
        </div>
      </main>
    </>
  );
}
