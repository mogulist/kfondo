import { getYearStats, getYearStatsWithCourses } from "./stats";
import { events } from "../events.config";

describe("분포 변환 함수 비교", () => {
  it("2025년 홍천 그란폰도의 granfondo/mediofondo distribution이 동일해야 한다", () => {
    const event = events.find((e) => e.id === "hongcheon")!;
    const dataDir = "data"; // 실제 데이터 경로에 맞게

    const oldStats = getYearStats(event, dataDir);
    const newStats = getYearStatsWithCourses(event, dataDir);

    // 2025년만 비교
    const old2025 = oldStats.find((y) => y.year === 2025);
    const new2025 = newStats.find((y) => y.year === 2025);
    expect(old2025).toBeDefined();
    expect(new2025).toBeDefined();

    const granDist = new2025?.distributions.find(
      (d) => d.courseId === "granfondo"
    );
    expect(granDist?.distribution).toEqual(old2025?.granFondoDistribution);

    const medioDist = new2025?.distributions.find(
      (d) => d.courseId === "mediofondo"
    );
    expect(medioDist?.distribution).toEqual(old2025?.medioFondoDistribution);
  });

  it("2025년 설악 그란폰도의 granfondo/mediofondo distribution이 동일해야 한다", () => {
    const event = events.find((e) => e.id === "seorak")!;
    const dataDir = "data";

    const oldStats = getYearStats(event, dataDir);
    const newStats = getYearStatsWithCourses(event, dataDir);

    // 2025년만 비교
    const old2025 = oldStats.find((y) => y.year === 2025);
    const new2025 = newStats.find((y) => y.year === 2025);
    expect(old2025).toBeDefined();
    expect(new2025).toBeDefined();

    const granDist = new2025?.distributions.find(
      (d) => d.courseId === "granfondo"
    );
    expect(granDist?.distribution).toEqual(old2025?.granFondoDistribution);

    const medioDist = new2025?.distributions.find(
      (d) => d.courseId === "mediofondo"
    );
    expect(medioDist?.distribution).toEqual(old2025?.medioFondoDistribution);
  });
});
