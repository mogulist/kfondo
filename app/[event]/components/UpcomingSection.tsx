import type { Event } from "@/lib/types";
import dayjs from "dayjs";
import { Calendar, ExternalLink } from "lucide-react";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  event: Event;
};

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

  if (!showDDayCard && !officialSiteUrl) return null;

  return (
    <div className="space-y-3">
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
          className="inline-flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:opacity-70 pl-2"
        >
          공식 사이트
          <ExternalLink className="size-4 shrink-0" aria-hidden />
        </a>
      )}
    </div>
  );
};

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
