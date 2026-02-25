import type { Event, RaceCategory } from "@/lib/types";
import dayjs from "dayjs";
import { Calendar, MapPin } from "lucide-react";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

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

  const normalizedDate = latestDetail?.date?.replace(/\./g, "-") ?? "";
  const dDay = hasDate ? dayjs(normalizedDate).diff(dayjs(), "day") : null;
  const dateLabel = hasDate ? formatEventDateLabel(latestDetail!.date) : null;
  const showDDayCard = hasDate && dateLabel && dDay !== null && dDay >= 0;

  const officialSiteUrl = getOfficialSiteUrl(event);
  const latestCourses =
    latestDetail?.courses?.filter((c) => c.name?.trim()) ?? [];
  const hasCourseInfo = latestCourses.length > 0;

  if (!showDDayCard && !officialSiteUrl && !hasCourseInfo) return null;

  return (
    <div className="space-y-4">
      {showDDayCard && (
        <div
          className="rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-white"
          style={{
            background:
              "linear-gradient(to right, rgb(16, 185, 129), rgb(4, 120, 87))",
          }}
          role="region"
          aria-label="다가오는 대회 일정"
        >
          <div>
            <p className="text-sm text-white/80">올해 개최까지</p>
            <p className="text-3xl font-bold tabular-nums">
              {dDay! > 0 ? `D-${dDay}` : "D-Day"}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
            <Calendar className="size-4 shrink-0" aria-hidden />
            <span className="text-sm font-medium">{dateLabel}</span>
          </div>
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
          <div className="grid grid-cols-2 gap-4 w-full">
            {latestCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

function CourseCard({ course }: { course: RaceCategory }) {
  const distanceLabel =
    typeof course.distance === "number" && course.distance > 0
      ? ` (${course.distance}km)`
      : "";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="font-semibold text-foreground mb-3">
        {course.name}
        {distanceLabel}
      </p>
      <div className="flex flex-nowrap gap-2">
        {COURSE_LINK_STYLES.map(({ label, key, btnClass }) => {
          const url = course[key];
          const hasUrl = typeof url === "string" && url.trim().length > 0;
          const pillClass =
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";
          const content = (
            <>
              <MapPin className="size-3.5 shrink-0 opacity-90" aria-hidden />
              {label}
            </>
          );
          if (hasUrl) {
            return (
              <a
                key={key}
                href={url!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnClass} ${pillClass}`}
              >
                {content}
              </a>
            );
          }
          return (
            <span
              key={key}
              className={`${pillClass} bg-muted text-muted-foreground cursor-not-allowed opacity-60`}
              aria-disabled="true"
            >
              {content}
            </span>
          );
        })}
      </div>
    </div>
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
  const normalized = dateStr.replace(/\./g, "-");
  const d = dayjs(normalized);
  const month = d.month() + 1;
  const date = d.date();
  const weekday = WEEKDAY_KO[d.day()];
  return `${month}월 ${date}일 (${weekday})`;
}
