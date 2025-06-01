import path from "path";
import fs from "fs";
import type {
  Event,
  EventYearStats,
  EventYearStatsWithCourses,
  RaceRecord,
} from "./types";
import { generateTimeDistributionFromRecords } from "./record-stats";
import { timeToSeconds } from "./utils";

export function getYearStats(event: Event, dataDir: string): EventYearStats[] {
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
        year
      ),
      medioFondoDistribution: generateTimeDistributionFromRecords(
        records,
        "메디오폰도",
        2,
        year
      ),
      comment: granfondoComment,
    };
  });

  yearStats.sort((a, b) => b.year - a.year);
  return yearStats;
}

export function getYearStatsWithCourses(
  event: Event,
  dataDir: string
): EventYearStatsWithCourses[] {
  const yearsWithData = event.years.filter((year) => {
    const filePath = path.join(dataDir, `${event.id}_${year}.json`);
    return fs.existsSync(filePath);
  });

  const yearStats: EventYearStatsWithCourses[] = yearsWithData.map((year) => {
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

    const detail = event.yearDetails[year];
    const distributions = detail.courses.map((course) => ({
      courseId: course.id,
      courseName: course.name,
      distribution: generateTimeDistributionFromRecords(
        records,
        course.name,
        2,
        year
      ),
    }));

    // comment는 granfondo에만 있다고 가정
    const gran = detail.courses.find((c) => c.id === "granfondo");
    const granfondoComment = gran?.comment;

    return {
      year,
      distributions,
      comment: granfondoComment,
    };
  });

  yearStats.sort((a, b) => b.year - a.year);
  return yearStats;
}
