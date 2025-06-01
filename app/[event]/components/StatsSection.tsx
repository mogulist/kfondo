import path from "path";
import type { Event } from "@/lib/types";
import { StatsChart } from "./StatsChart";
import { getYearStatsWithCourses } from "@/lib/stats";

type Props = {
  event: Event;
};

export const StatsSection = ({ event }: Props) => {
  const dataDir = path.join(process.cwd(), "data");
  const yearlyStats = getYearStatsWithCourses(event, dataDir);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">기록 분포</h2>
      <div className="w-full">
        <StatsChart statistics={yearlyStats} eventId={event.id} />
      </div>
    </section>
  );
};
