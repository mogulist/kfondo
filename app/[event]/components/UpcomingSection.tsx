import type { Event, RaceCategory } from "@/lib/types";
import { getDaysUntilEvent, normalizeEventDate } from "@/lib/date";
import dayjs from "dayjs";
import { MapPin } from "lucide-react";
import { DDayCard } from "./DDayCard";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const UPCOMING_WITHOUT_RECORD_DAYS = 7;
const RECORD_PENDING_NOTICE =
  "공식 기록이 아직 공개되지 않았습니다. 보통 대회 당일 오후~수일 내 순차 반영됩니다.";
const RECORD_COLLECTING_NOTICE =
  "기록 정리 및 검수 중입니다. 반영까지 시간이 걸릴 수 있습니다.";

type Props = {
  event: Event;
};

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

export const UpcomingSection = ({ event }: Props) => {
  const latestYear = event.years.length > 0 ? Math.max(...event.years) : null;
  const latestDetail =
    latestYear != null ? event.yearDetails[latestYear] : undefined;
  const hasDate =
    latestDetail?.date &&
    /^\d{4}[.-]\d{1,2}[.-]\d{1,2}$/.test(latestDetail.date.replace(/\./g, "-"));

  const normalizedDate = latestDetail?.date
    ? normalizeEventDate(latestDetail.date)
    : "";
  const dDay = hasDate ? getDaysUntilEvent(latestDetail!.date) : null;
  const daysSinceEvent =
    hasDate && normalizedDate
      ? dayjs().diff(dayjs(normalizedDate), "day")
      : null;
  const hasRecords =
    (latestDetail?.totalRegistered ?? 0) > 0 ||
    Boolean(latestDetail?.recordsBlobUrl?.trim()) ||
    Boolean(latestDetail?.sortedRecordsBlobUrl?.trim());
  const isPreparing = latestDetail?.status === "preparing";
  const showPendingNotice =
    !isPreparing &&
    !hasRecords &&
    daysSinceEvent !== null &&
    daysSinceEvent >= 0 &&
    daysSinceEvent <= UPCOMING_WITHOUT_RECORD_DAYS;
  const noticeMessage = isPreparing
    ? RECORD_COLLECTING_NOTICE
    : showPendingNotice
    ? RECORD_PENDING_NOTICE
    : null;
  const dateLabel = hasDate ? formatEventDateLabel(latestDetail!.date) : null;
  const showDDayCard = hasDate && dateLabel && dDay !== null && dDay >= 0;

  const officialSiteUrl = getOfficialSiteUrl(event);
  const latestCourses =
    latestDetail?.courses?.filter((c) => c.name?.trim()) ?? [];
  const coursesWithLinks = latestCourses.filter(hasAnyCourseLink);
  const hasCourseInfo = coursesWithLinks.length > 0;

  if (!showDDayCard && !noticeMessage && !officialSiteUrl && !hasCourseInfo) return null;

  return (
    <div className="space-y-4">
      {showDDayCard && (
        <DDayCard date={latestDetail!.date} dateLabel={dateLabel!} />
      )}

      {noticeMessage && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          role="status"
          aria-live="polite"
        >
          {noticeMessage}
        </div>
      )}

      {officialSiteUrl && (
        <a
          href={officialSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:opacity-70 pl-2"
        >
          <MapPin className="size-4 shrink-0" aria-hidden />
          공식 사이트
        </a>
      )}

      {hasCourseInfo && (
        <section className="space-y-3" role="region" aria-label="코스 정보">
          <h2 className="text-lg font-bold text-foreground pl-1">코스 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {coursesWithLinks.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                eventSlug={event.id}
                year={latestYear!}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const NAVER_MAP_BTN_CLASS =
  "bg-[#03c75a] hover:bg-[#02b350] text-white inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";
const NAVER_MAP_BTN_DISABLED_CLASS =
  "border border-slate-400 bg-slate-200 text-slate-600 cursor-not-allowed inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap dark:bg-slate-700 dark:border-slate-500 dark:text-slate-400";

type CourseCardProps = {
  course: RaceCategory;
  eventSlug: string;
  year: number;
};

function CourseCard({ course, eventSlug, year }: CourseCardProps) {
  const distanceLabel =
    typeof course.distance === "number" && course.distance > 0
      ? ` (${course.distance}km)`
      : "";
  const hasGpx = typeof course.gpxBlobUrl === "string" && course.gpxBlobUrl.trim().length > 0;
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

function hasAnyCourseLink(course: RaceCategory): boolean {
  const keys: (keyof Pick<
    RaceCategory,
    "officialSiteUrl" | "stravaUrl" | "rideWithGpsUrl" | "gpxBlobUrl"
  >)[] = ["officialSiteUrl", "stravaUrl", "rideWithGpsUrl", "gpxBlobUrl"];
  return keys.some(
    (k) => typeof course[k] === "string" && (course[k] as string).trim().length > 0,
  );
}

function getOfficialSiteUrl(event: Event): string | undefined {
  const yearsWithUrl = event.years.filter((y) =>
    event.yearDetails[y]?.url?.trim(),
  );
  if (yearsWithUrl.length === 0) return undefined;
  const latestYear = Math.max(...yearsWithUrl);
  return event.yearDetails[latestYear].url!.trim();
}

function formatEventDateLabel(dateStr: string): string {
  const normalized = normalizeEventDate(dateStr);
  const d = dayjs(normalized);
  const month = d.month() + 1;
  const date = d.date();
  const weekday = WEEKDAY_KO[d.day()];
  return `${month}월 ${date}일 (${weekday})`;
}
