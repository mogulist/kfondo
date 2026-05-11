import type { RaceCategory } from "@/lib/types";
import { MapPin } from "lucide-react";

const COURSE_LINK_STYLES: {
  label: string;
  key: keyof Pick<
    RaceCategory,
    "officialSiteUrl" | "stravaUrl" | "rideWithGpsUrl"
  >;
  btnClass: string;
}[] = [
  {
    label: "공식 사이트",
    key: "officialSiteUrl",
    btnClass: "bg-slate-500 hover:bg-slate-700 text-white",
  },
  {
    label: "Strava",
    key: "stravaUrl",
    btnClass: "bg-[#fc4c02] hover:bg-[#e04502] text-white",
  },
  {
    label: "RideWithGPS",
    key: "rideWithGpsUrl",
    btnClass: "bg-[#2d7dd2] hover:bg-[#2569b8] text-white",
  },
];

const NAVER_MAP_BTN_CLASS =
  "bg-[#03c75a] hover:bg-[#02b350] text-white inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";
const NAVER_MAP_BTN_DISABLED_CLASS =
  "border border-slate-400 bg-slate-200 text-slate-600 cursor-not-allowed inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap dark:bg-slate-700 dark:border-slate-500 dark:text-slate-400";

type CourseCardProps = {
  course: RaceCategory;
  eventSlug: string;
  year: number;
};

export function CourseCard({ course, eventSlug, year }: CourseCardProps) {
  const distanceLabel =
    typeof course.distance === "number" && course.distance > 0
      ? ` (${course.distance}km)`
      : "";
  const hasGpx =
    typeof course.gpxBlobUrl === "string" && course.gpxBlobUrl.trim().length > 0;
  const mapHref = hasGpx ? `/${eventSlug}/map/${course.id}?year=${year}` : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="font-semibold text-foreground mb-3">
        {course.name}
        {distanceLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {COURSE_LINK_STYLES.filter(({ key }) => {
          const url = course[key];
          return typeof url === "string" && url.trim().length > 0;
        }).map(({ label, key, btnClass }) => {
          const url = course[key]!.trim();
          const pillClass =
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";
          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnClass} ${pillClass}`}
            >
              <MapPin className="size-3.5 shrink-0 opacity-90" aria-hidden />
              {label}
            </a>
          );
        })}
        {mapHref ? (
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className={NAVER_MAP_BTN_CLASS}
          >
            <MapPin className="size-3.5 shrink-0 opacity-90" aria-hidden />
            네이버맵
          </a>
        ) : (
          <span className={NAVER_MAP_BTN_DISABLED_CLASS} aria-disabled>
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            네이버맵
          </span>
        )}
      </div>
    </div>
  );
}

export function hasAnyCourseLink(course: RaceCategory): boolean {
  const keys: (keyof Pick<
    RaceCategory,
    "officialSiteUrl" | "stravaUrl" | "rideWithGpsUrl" | "gpxBlobUrl"
  >)[] = ["officialSiteUrl", "stravaUrl", "rideWithGpsUrl", "gpxBlobUrl"];
  return keys.some(
    (k) =>
      typeof course[k] === "string" && (course[k] as string).trim().length > 0,
  );
}

type CourseInfoGridProps = {
  eventSlug: string;
  year: number;
  courses: RaceCategory[] | undefined;
};

export function CourseInfoGrid({
  eventSlug,
  year,
  courses,
}: CourseInfoGridProps) {
  const withName = courses?.filter((c) => c.name?.trim()) ?? [];
  const coursesWithLinks = withName.filter(hasAnyCourseLink);
  if (coursesWithLinks.length === 0) return null;

  return (
    <section className="space-y-3 mb-8" role="region" aria-label="코스 정보">
      <h2 className="text-lg font-bold text-foreground pl-1">코스 정보</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {coursesWithLinks.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            eventSlug={eventSlug}
            year={year}
          />
        ))}
      </div>
    </section>
  );
}
