import type { RaceRecord } from "./types";
import { filterRaceRecordsByGender } from "./record-gender-filter";

const mk = (gender: string): RaceRecord => ({
  bibNo: "1",
  gender,
  event: "그란폰도",
  time: "03:00:00",
  status: "",
  timeInSeconds: 10800,
});

describe("filterRaceRecordsByGender", () => {
  const rows: RaceRecord[] = [
    mk("M"),
    mk("F"),
    mk("W"),
    mk("male"),
    mk("female"),
    mk("남"),
    mk("여"),
    mk(""),
    mk("???"),
  ];

  it("open returns all", () => {
    expect(filterRaceRecordsByGender(rows, "open")).toHaveLength(rows.length);
  });

  it("male keeps M/male/남 (case-insensitive M)", () => {
    const out = filterRaceRecordsByGender(rows, "male");
    expect(out.map((r) => r.gender).sort()).toEqual(
      ["M", "male", "남"].sort(),
    );
  });

  it("female keeps F/W/female/여", () => {
    const out = filterRaceRecordsByGender(rows, "female");
    expect(out.map((r) => r.gender).sort()).toEqual(
      ["F", "W", "female", "여"].sort(),
    );
  });
});
