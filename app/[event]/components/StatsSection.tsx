import { StatsChart } from "@/components/stats-chart";
import type { Event, EventYearStats, RaceRecord } from "@/lib/types";
import { generateTimeDistributionFromRecords } from "@/lib/record-stats";
import { timeToSeconds } from "@/lib/utils";
import path from "path";
import fs from "fs";

type Props = {
  event: Event;
};

export const StatsSection = ({ event }: Props) => {
  const dataDir = path.join(process.cwd(), "data");
  const yearsWithData = event.years.filter((year) => {
    const filePath = path.join(dataDir, `${event.id}_${year}.json`);
    return fs.existsSync(filePath);
  });

  const yearStats: EventYearStats[] = yearsWithData.map((year) => {
    const filePath = path.join(dataDir, `${event.id}_${year}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const records: RaceRecord[] = JSON.parse(raw).map((r: any) => ({
      bibNo: String(r.BIB_NO),
      gender: r.Gender,
      event: r.Event,
      time: r.Time,
      status: r.Status,
      timeInSeconds: r.Time ? timeToSeconds(r.Time) : undefined,
    }));

    const yearData = event.years
      .map((y) => {
        const detail = event.yearDetails[y];
        const gran = detail.courses.find((c) => c.id === "granfondo");
        const medio = detail.courses.find((c) => c.id === "mediofondo");
        return {
          year: y,
          registered: {
            granfondo: gran?.registered ?? 0,
            mediofondo: medio?.registered ?? 0,
          },
        };
      })
      .find((d) => d.year === year);

    if (!yearData) {
      throw new Error(`No data found for year ${year}`);
    }

    const gran = event.yearDetails[year]?.courses.find(
      (c) => c.id === "granfondo"
    );
    const granfondoComment = gran?.comment;

    return {
      year,
      granFondoDistribution: generateTimeDistributionFromRecords(
        records,
        "그란폰도",
        2,
        year,
        yearData.registered.granfondo
      ),
      medioFondoDistribution: generateTimeDistributionFromRecords(
        records,
        "메디오폰도",
        2,
        year,
        yearData.registered.mediofondo
      ),
      comment: granfondoComment,
    };
  });

  yearStats.sort((a, b) => b.year - a.year);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">기록 분포</h2>
      <div className="w-full">
        <StatsChart yearStats={yearStats} eventId={event.id} />
      </div>
    </section>
  );
};
